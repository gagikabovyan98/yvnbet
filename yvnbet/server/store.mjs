import { DatabaseSync } from "node:sqlite";
import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
  createHash,
} from "node:crypto";
import path from "node:path";
import {
  initialContent,
  upgradeContent,
  upgradePresentation,
} from "../src/content.mjs";
export const hashToken = (t) => createHash("sha256").update(t).digest("hex");
export function passwordHash(password) {
  const salt = randomBytes(16).toString("hex");
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}
export function passwordMatches(password, user) {
  const dummy = { salt: "dummy-salt", hash: "00".repeat(64) };
  const u = user || dummy;
  return (
    timingSafeEqual(
      scryptSync(password, u.salt, 64),
      Buffer.from(u.hash, "hex"),
    ) && !!user
  );
}
export async function openStore(dir) {
  await mkdir(dir, { recursive: true, mode: 0o700 });
  await chmod(dir, 0o700);
  const db = new DatabaseSync(path.join(dir, "cms.sqlite"));
  db.exec(
    `PRAGMA journal_mode=WAL;PRAGMA foreign_keys=ON; CREATE TABLE IF NOT EXISTS content(id INTEGER PRIMARY KEY CHECK(id=1),body TEXT NOT NULL,revision INTEGER NOT NULL DEFAULT 1);CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username TEXT UNIQUE NOT NULL,salt TEXT NOT NULL,hash TEXT NOT NULL,role TEXT NOT NULL);CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expires INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS leads(id INTEGER PRIMARY KEY,payload TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'new',created TEXT NOT NULL);CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires INTEGER NOT NULL);CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,actor TEXT NOT NULL,event TEXT NOT NULL,created TEXT NOT NULL);`,
  );
  await chmod(path.join(dir, "cms.sqlite"), 0o600);
  if (!db.prepare("SELECT id FROM content").get())
    db.prepare("INSERT INTO content(id,body) VALUES(1,?)").run(
      JSON.stringify(initialContent),
    );
  db.exec("CREATE TABLE IF NOT EXISTS migrations(name TEXT PRIMARY KEY)");
  for (const [name, upgrade] of [
    ["2026-10-slots-registration", upgradeContent],
    ["2026-10-top-games-reel", upgradePresentation],
  ]) {
    if (db.prepare("SELECT name FROM migrations WHERE name=?").get(name))
      continue;
    db.exec("BEGIN IMMEDIATE");
    try {
      const existing = db.prepare("SELECT body FROM content WHERE id=1").get();
      const upgraded = JSON.stringify(upgrade(JSON.parse(existing.body)));
      if (upgraded !== existing.body)
        db.prepare(
          "UPDATE content SET body=?, revision=revision+1 WHERE id=1",
        ).run(upgraded);
      db.prepare("INSERT INTO migrations(name) VALUES(?)").run(name);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  if (!db.prepare("SELECT id FROM users LIMIT 1").get()) {
    let auth;
    try {
      auth = JSON.parse(await readFile(path.join(dir, "auth.json"), "utf8"));
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
    if (!auth) {
      const p = process.env.ADMIN_PASSWORD;
      if (!p || p.length < 12)
        throw new Error(
          "Для первого запуска задайте ADMIN_PASSWORD (не менее 12 символов).",
        );
      auth = passwordHash(p);
    }
    db.prepare(
      "INSERT INTO users(username,salt,hash,role) VALUES(?,?,?,?)",
    ).run("admin", auth.salt, auth.hash, "admin");
  }
  let key;
  if (process.env.DATA_ENCRYPTION_KEY) {
    if (!/^[a-fA-F0-9]{64}$/.test(process.env.DATA_ENCRYPTION_KEY))
      throw new Error("DATA_ENCRYPTION_KEY: требуется 64 hex-символа");
    key = Buffer.from(process.env.DATA_ENCRYPTION_KEY, "hex");
  } else {
    try {
      key = await readFile(path.join(dir, "encryption.key"));
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      key = randomBytes(32);
      await writeFile(path.join(dir, "encryption.key"), key, {
        mode: 0o600,
        flag: "wx",
      });
    }
  }
  if (key.length !== 32)
    throw new Error("DATA_ENCRYPTION_KEY: требуется 64 hex-символа");
  const encrypt = (data) => {
    const iv = randomBytes(12),
      cipher = createCipheriv("aes-256-gcm", key, iv);
    const body = Buffer.concat([
      cipher.update(JSON.stringify(data)),
      cipher.final(),
    ]);
    return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
  };
  const decrypt = (data) => {
    const b = Buffer.from(data, "base64"),
      cipher = createDecipheriv("aes-256-gcm", key, b.subarray(0, 12));
    cipher.setAuthTag(b.subarray(12, 28));
    return JSON.parse(
      Buffer.concat([cipher.update(b.subarray(28)), cipher.final()]).toString(),
    );
  };
  const audit = (actor, event) =>
    db
      .prepare("INSERT INTO audit(actor,event,created) VALUES(?,?,?)")
      .run(actor, event, new Date().toISOString());
  const getContent = () => {
    const row = db.prepare("SELECT * FROM content WHERE id=1").get();
    return { content: JSON.parse(row.body), revision: row.revision };
  };
  const rate = (key, max, windowMs) => {
    const now = Date.now();
    db.prepare("DELETE FROM limits WHERE expires<?").run(now);
    db.prepare(
      "INSERT INTO limits VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1",
    ).run(key, now + windowMs);
    return (
      db.prepare("SELECT count FROM limits WHERE key=?").get(key).count <= max
    );
  };
  return { db, encrypt, decrypt, audit, getContent, rate };
}
