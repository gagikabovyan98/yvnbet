import express from "express";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  openStore,
  hashToken,
  passwordHash,
  passwordMatches,
} from "./store.mjs";
import { validateContent, parseImage, leadSchema } from "./validation.mjs";
import { publicContent, telegramContact } from "../src/content.mjs";
import { headFor, metaFor, jsonSafe, sitemap } from "./seo.mjs";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = process.env.DATA_DIR || path.join(root, "data");
const port = Number(process.env.PORT || 4173),
  host = process.env.HOST || "127.0.0.1",
  prod = process.env.NODE_ENV === "production";
const origin = process.env.PUBLIC_ORIGIN || `http://localhost:${port}`;
const allowedOrigins = new Set([
  origin,
  ...(!process.env.PUBLIC_ORIGIN ? [`http://127.0.0.1:${port}`] : []),
]);
await mkdir(path.join(dataDir, "uploads"), { recursive: true });
const store = await openStore(dataDir),
  { db, audit, rate, getContent } = store;
validateContent(getContent().content);
const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY_HOPS)
  app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS));
const csrfCookie = {
  httpOnly: true,
  sameSite: "strict",
  secure: origin.startsWith("https:"),
  maxAge: 8 * 3600_000,
  path: "/",
};
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Frame-Options": "SAMEORIGIN",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  });
  if (origin.startsWith("https:"))
    res.set("Strict-Transport-Security", "max-age=31536000");
  next();
});
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  if (!["GET", "HEAD"].includes(req.method)) {
    if (!allowedOrigins.has(req.get("origin")))
      return res.status(403).json({ error: "Недопустимый источник запроса" });
    if (!req.is("application/json"))
      return res.status(415).json({ error: "Требуется JSON" });
  }
  next();
});
app.use(express.json({ limit: "6mb" }));
function session(req) {
  const token = req.headers.cookie
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith("yvn_session="))
    ?.slice(12);
  return (
    token &&
    db
      .prepare(
        "SELECT users.id,users.username,users.role,sessions.csrf FROM sessions JOIN users ON users.id=sessions.user_id WHERE token=? AND expires>?",
      )
      .get(hashToken(token), Date.now())
  );
}
function guard(roles) {
  return (req, res, next) => {
    const user = session(req);
    if (!user) return res.status(401).json({ error: "Войдите в админку" });
    if (!roles.includes(user.role))
      return res.status(403).json({ error: "Недостаточно прав" });
    if (
      !["GET", "HEAD"].includes(req.method) &&
      req.get("x-csrf-token") !== user.csrf
    )
      return res
        .status(403)
        .json({ error: "Обновите страницу и повторите запрос" });
    req.user = user;
    next();
  };
}
const all = guard(["admin", "editor", "support"]),
  edit = guard(["admin", "editor"]),
  admin = guard(["admin"]),
  support = guard(["admin", "support"]);
app.get("/api/health", (_, res) => res.json({ ok: true }));
app.get("/api/content", (_, res) =>
  res.json(publicContent(getContent().content)),
);
app.get("/api/session", all, (req, res) => res.json(req.user));
app.post("/api/login", (req, res) => {
  if (!rate("login:" + req.ip, 8, 15 * 60_000))
    return res
      .status(429)
      .json({ error: "Слишком много попыток. Повторите через 15 минут." });
  const { username, password } = req.body || {};
  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    password.length > 256
  )
    return res.status(400).json({ error: "Проверьте данные" });
  const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);
  if (!passwordMatches(password, user))
    return res.status(401).json({ error: "Неверный логин или пароль" });
  const token = randomBytes(32).toString("hex"),
    csrf = randomBytes(24).toString("hex");
  db.prepare("DELETE FROM sessions WHERE expires<?").run(Date.now());
  db.prepare("INSERT INTO sessions VALUES(?,?,?,?)").run(
    hashToken(token),
    user.id,
    csrf,
    Date.now() + 8 * 3600_000,
  );
  audit(username, "login");
  res.cookie("yvn_session", token, csrfCookie);
  res.json({ id: user.id, username, role: user.role, csrf });
});
app.post("/api/logout", all, (req, res) => {
  db.prepare("DELETE FROM sessions WHERE user_id=? AND csrf=?").run(
    req.user.id,
    req.user.csrf,
  );
  res.clearCookie("yvn_session", { ...csrfCookie, maxAge: undefined });
  res.json({ ok: true });
});
app.get("/api/admin/content", edit, (_, res) => res.json(getContent()));
app.put("/api/content", edit, (req, res) => {
  const { content: body, revision } = req.body || {};
  let content;
  try {
    content = validateContent(body);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
  const result = db
    .prepare(
      "UPDATE content SET body=?,revision=revision+1 WHERE id=1 AND revision=?",
    )
    .run(JSON.stringify(content), Number(revision) || 0);
  if (!result.changes)
    return res.status(409).json({
      error:
        "Контент уже изменён другим редактором. Сохраните свои изменения отдельно и перезагрузите страницу.",
    });
  audit(req.user.username, "content:save");
  res.json({ revision: Number(revision) + 1 });
});
app.post("/api/upload", edit, async (req, res) => {
  try {
    if (!rate("upload:" + req.user.id, 60, 3600_000))
      return res.status(429).json({ error: "Слишком много загрузок" });
    const { bytes, ext } = await parseImage(req.body?.data);
    const name = randomUUID() + "." + ext;
    await writeFile(path.join(dataDir, "uploads", name), bytes, {
      mode: 0o600,
    });
    audit(req.user.username, "image:upload");
    res.json({ url: "/uploads/" + name });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
app.post("/api/registrations", (req, res) => {
  if (!rate("lead:" + req.ip, 5, 3600_000))
    return res.status(429).json({ error: "Попробуйте позже" });
  const p = leadSchema.safeParse(req.body);
  if (!p.success)
    return res.status(400).json({ error: "Проверьте поля формы" });
  const { website, ...lead } = p.data;
  const created = new Date().toISOString();
  const result = db
    .prepare("INSERT INTO leads(payload,created) VALUES(?,?)")
    .run(store.encrypt(lead), created);
  const c = getContent().content;
  const t = c.interface[lead.language];
  const text = [
    t.registrationIntro,
    `${t.name}: ${lead.name}`,
    `${t.phone}: ${lead.phone}`,
    `${t.city}: ${lead.city}`,
    ...(lead.telegram ? [`Telegram: ${lead.telegram}`] : []),
  ].join("\n");
  res.status(201).json({
    id: Number(result.lastInsertRowid),
    telegramUrl: telegramContact(c.settings, "registration", text),
  });
});
app.get("/api/leads", support, (req, res) => {
  const offset = Math.max(0, Number(req.query.offset) || 0);
  const rows = db
    .prepare("SELECT * FROM leads ORDER BY id DESC LIMIT 50 OFFSET ?")
    .all(offset);
  audit(req.user.username, "leads:view");
  res.json({
    items: rows.map((r) => ({
      id: r.id,
      status: r.status,
      created: r.created,
      ...store.decrypt(r.payload),
    })),
    total: db.prepare("SELECT count(*) AS n FROM leads").get().n,
  });
});
app.patch("/api/leads/:id", support, (req, res) => {
  if (!["new", "contacted", "closed"].includes(req.body.status))
    return res.status(400).json({ error: "Некорректный статус" });
  db.prepare("UPDATE leads SET status=? WHERE id=?").run(
    req.body.status,
    Number(req.params.id),
  );
  audit(req.user.username, "lead:status:" + req.params.id);
  res.json({ ok: true });
});
app.delete("/api/leads/:id", admin, (req, res) => {
  db.prepare("DELETE FROM leads WHERE id=?").run(Number(req.params.id));
  audit(req.user.username, "lead:delete:" + req.params.id);
  res.json({ ok: true });
});
app.get("/api/users", admin, (_, res) =>
  res.json(db.prepare("SELECT id,username,role FROM users ORDER BY id").all()),
);
app.post("/api/users", admin, (req, res) => {
  const { username, password, role } = req.body;
  if (
    typeof username !== "string" ||
    !/^[a-zA-Z0-9_-]{3,40}$/.test(username || "") ||
    typeof password !== "string" ||
    password.length < 12 ||
    password.length > 256 ||
    !["admin", "editor", "support"].includes(role)
  )
    return res.status(400).json({
      error:
        "Логин: 3–40 латинских символов. Пароль: 12–256 символов. Укажите роль.",
    });
  if (db.prepare("SELECT id FROM users WHERE username=?").get(username))
    return res.status(409).json({ error: "Логин уже занят" });
  const hash = passwordHash(password);
  db.prepare("INSERT INTO users(username,salt,hash,role) VALUES(?,?,?,?)").run(
    username,
    hash.salt,
    hash.hash,
    role,
  );
  audit(req.user.username, "user:create:" + username);
  res.status(201).json({ ok: true });
});
app.patch("/api/users/:id", admin, (req, res) => {
  const id = Number(req.params.id),
    u = db.prepare("SELECT * FROM users WHERE id=?").get(id);
  if (!u) return res.status(404).json({ error: "Пользователь не найден" });
  const role = req.body.role || u.role;
  if (!["admin", "editor", "support"].includes(role))
    return res.status(400).json({ error: "Некорректная роль" });
  if (
    u.role === "admin" &&
    role !== "admin" &&
    db.prepare("SELECT count(*) n FROM users WHERE role='admin'").get().n <= 1
  )
    return res
      .status(400)
      .json({ error: "Нельзя убрать последнего администратора" });
  let h = { salt: u.salt, hash: u.hash };
  if (req.body.password) {
    if (
      typeof req.body.password !== "string" ||
      req.body.password.length < 12 ||
      req.body.password.length > 256
    )
      return res.status(400).json({ error: "Пароль: 12–256 символов" });
    h = passwordHash(req.body.password);
  }
  db.prepare("UPDATE users SET role=?,salt=?,hash=? WHERE id=?").run(
    role,
    h.salt,
    h.hash,
    id,
  );
  db.prepare("DELETE FROM sessions WHERE user_id=?").run(id);
  audit(req.user.username, "user:update:" + id);
  res.json({ ok: true });
});
app.delete("/api/users/:id", admin, (req, res) => {
  const id = Number(req.params.id),
    u = db.prepare("SELECT * FROM users WHERE id=?").get(id);
  if (
    id === req.user.id ||
    (u?.role === "admin" &&
      db.prepare("SELECT count(*) n FROM users WHERE role='admin'").get().n <=
        1)
  )
    return res
      .status(400)
      .json({ error: "Нельзя удалить себя или последнего администратора" });
  db.prepare("DELETE FROM users WHERE id=?").run(id);
  audit(req.user.username, "user:delete:" + id);
  res.json({ ok: true });
});
app.get("/api/audit", admin, (_, res) =>
  res.json(db.prepare("SELECT * FROM audit ORDER BY id DESC LIMIT 100").all()),
);
app.use("/api", (_, res) => res.status(404).json({ error: "Не найдено" }));
app.use(
  "/uploads",
  express.static(path.join(dataDir, "uploads"), {
    dotfiles: "deny",
    maxAge: "1y",
    immutable: true,
  }),
);
app.get("/sitemap.xml", (_, res) =>
  res
    .type("application/xml")
    .send(sitemap(publicContent(getContent().content))),
);
app.get("/robots.txt", (_, res) => {
  const c = getContent().content;
  res
    .type("text/plain")
    .send(
      c.settings.indexable
        ? `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: ${c.settings.siteUrl}/sitemap.xml\n`
        : "User-agent: *\nDisallow: /\n",
    );
});
let vite, render, template;
if (prod) {
  ({ render } = await import("../dist/server/entry-server.js"));
  template = await readFile(path.join(root, "dist/index.html"), "utf8");
  app.use("/server", (_, res) => res.sendStatus(404));
  app.use(
    express.static(path.join(root, "dist"), {
      index: false,
      setHeaders: (res, p) => {
        if (p.includes("/assets/"))
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      },
    }),
  );
} else {
  const { createServer } = await import("vite");
  vite = await createServer({
    root,
    server: {
      middlewareMode: true,
      fs: { deny: [".env", ".env.*", "**/data/**", "**/.git/**"] },
    },
    appType: "custom",
  });
  app.use(vite.middlewares);
}
app.get("/{*path}", async (req, res, next) => {
  try {
    if (req.path === "/")
      return res.redirect(
        302,
        "/" + getContent().content.settings.defaultLanguage,
      );
    const c = publicContent(getContent().content),
      isAdmin = req.path === "/admin",
      m = metaFor(c, req.path);
    const nonce = randomBytes(18).toString("base64");
    let tpl = template,
      renderer = render;
    if (!prod) {
      tpl = await vite.transformIndexHtml(
        req.originalUrl,
        await readFile(path.join(root, "index.html"), "utf8"),
      );
      renderer = (await vite.ssrLoadModule("/src/entry-server.jsx")).render;
    }
    const frameOrigins = [
      c.settings.loginUrl,
      ...c.games.map((g) => g.url),
      ...c.providers.map((p) => p.url),
    ]
      .filter(Boolean)
      .map((u) => new URL(u).origin);
    res.set(
      "Content-Security-Policy",
      `default-src 'self'; script-src 'self' 'nonce-${nonce}'${!prod ? " 'unsafe-inline'" : ""}; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self'; connect-src 'self'${!prod ? " ws:" : ""}; frame-src ${[...new Set(frameOrigins)].join(" ") || "'none'"}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'`,
    );
    if (isAdmin || !c.settings.indexable)
      res.set("X-Robots-Tag", "noindex, nofollow");
    res.set("Cache-Control", "no-store");
    res
      .status(isAdmin || m.valid ? 200 : 404)
      .type("html")
      .send(
        tpl
          .replace('lang="ru"', `lang="${isAdmin ? "ru" : m.lang}"`)
          .replace(
            "<!--head-->",
            isAdmin
              ? '<title>YvnBet CMS</title><meta name="robots" content="noindex,nofollow">'
              : headFor(c, req.path, nonce),
          )
          .replace("<!--app-->", isAdmin ? "" : renderer(c, req.path))
          .replace(
            "<!--data-->",
            isAdmin
              ? ""
              : `<script id="site-data" type="application/json" nonce="${nonce}">${jsonSafe(c)}</script>`,
          ),
      );
  } catch (e) {
    next(e);
  }
});
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(err.status || 500).json({
    error:
      err.status === 413
        ? "Файл слишком большой"
        : "Не удалось выполнить запрос",
  });
});
const server = app.listen(port, host, () =>
  console.log(`YvnBet: ${origin}\nCMS: ${origin}/admin`),
);
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
