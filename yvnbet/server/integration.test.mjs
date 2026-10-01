import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
test("production HTTP: auth, RBAC, CSRF, concurrent editing, encrypted leads, SSR, restart persistence", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "yvn-cms-test-"));
  const socket = net.createServer();
  await new Promise((r) => socket.listen(0, "127.0.0.1", r));
  const port = socket.address().port;
  await new Promise((r) => socket.close(r));
  const origin = `http://127.0.0.1:${port}`;
  let proc,
    logs = "";
  async function start() {
    proc = spawn(process.execPath, ["server/index.mjs"], {
      cwd: root,
      env: {
        ...process.env,
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: String(port),
        PUBLIC_ORIGIN: origin,
        DATA_DIR: dir,
        ADMIN_PASSWORD: "Isolated-Test-Password-2026",
        DATA_ENCRYPTION_KEY: "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    proc.stdout.on("data", (b) => (logs += b));
    proc.stderr.on("data", (b) => (logs += b));
    for (let i = 0; i < 600; i++) {
      try {
        if (
          (
            await fetch(origin + "/api/health", {
              signal: AbortSignal.timeout(1000),
            })
          ).ok
        )
          return;
      } catch {}
      await new Promise((r) => setTimeout(r, 100));
    }
    throw new Error("Startup timed out; exit=" + proc.exitCode + " " + logs);
  }
  async function stop() {
    if (proc?.exitCode === null) {
      const closed = once(proc, "exit");
      proc.kill("SIGTERM");
      await closed;
    }
  }
  let cookie = "",
    csrf = "";
  async function call(url, method = "GET", body, headers = {}) {
    return fetch(origin + url, {
      method,
      headers: {
        Origin: origin,
        "Content-Type": "application/json",
        Cookie: cookie,
        "X-CSRF-Token": csrf,
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  }
  async function login(username, password) {
    const r = await call("/api/login", "POST", { username, password });
    assert.equal(r.status, 200);
    cookie = r.headers.get("set-cookie").split(";")[0];
    const d = await r.json();
    csrf = d.csrf;
    return { cookie, csrf };
  }
  try {
    await start();
    assert.equal((await call("/api/admin/content")).status, 401);
    assert.equal((await call("/data/cms.sqlite")).status, 404);
    await login("admin", "Isolated-Test-Password-2026");
    const adminAuth = { cookie, csrf };
    let state = await (await call("/api/admin/content")).json();
    assert.equal(
      (await call("/api/content", "PUT", state, { "X-CSRF-Token": "" })).status,
      403,
    );
    assert.equal(
      (
        await call("/api/content", "PUT", state, {
          Origin: "https://evil.test",
        })
      ).status,
      403,
    );
    state.content.settings.siteUrl = "https://example.com";
    state.content.settings.indexable = true;
    state.content.games[0].title.ru = "Проверка сохранения";
    state.content.games[0].url = "https://provider.example/game/42";
    state.content.games[0].seo.title.ru = "Уникальный заголовок игры";
    assert.equal((await call("/api/content", "PUT", state)).status, 200);
    assert.equal((await call("/api/content", "PUT", state)).status, 409);
    const html = await (await call("/ru/games/golden-eclipse")).text();
    assert.ok(html.includes("<title>Уникальный заголовок игры</title>"));
    assert.match(html, /class="platform-main"/);
    assert.match(html, /<iframe title="Проверка сохранения"/);
    assert.doesNotMatch(
      html,
      /<footer|class="bottom-nav"|class="detail-art"|class="telegram-float"/,
    );
    const loginHtml = await (await call("/hy/login")).text();
    assert.match(loginHtml, /class="platform-main"/);
    assert.doesNotMatch(loginHtml, /<footer|class="bottom-nav"/);
    const homeHtml = await (await call("/hy")).text();
    assert.match(homeHtml, /class="bottom-nav"/);
    assert.doesNotMatch(homeHtml, /class="footer-nav"/);
    assert.match(homeHtml, /Թոփ խաղեր/);
    assert.match(homeHtml, /class="reel-machine /);
    assert.match(homeHtml, /class="hero-actions"/);
    assert.match(homeHtml, /class="provider-rail"/);
    assert.match(homeHtml, /class="language-flag"/);
    assert.doesNotMatch(homeHtml, /class="quick-strip"|class="side-nav"/);
    const header = homeHtml.match(/<header[\s\S]*?<\/header>/)[0];
    assert.doesNotMatch(header, /Գրանցվել/);
    assert.match(header, /Մուտք/);
    assert.ok(html.includes('hreflang="hy"'));
    assert.ok(html.includes("https://provider.example/game/42"));
    assert.equal((await call("/ru/unknown")).status, 404);
    assert.ok(
      (await (await call("/sitemap.xml")).text()).includes(
        "/hy/games/golden-eclipse",
      ),
    );
    assert.equal(
      (
        await call("/api/users", "POST", {
          username: "editor",
          password: "Editor-Test-Password-2026",
          role: "editor",
        })
      ).status,
      201,
    );
    assert.equal(
      (
        await call("/api/users", "POST", {
          username: "support",
          password: "Support-Test-Password-2026",
          role: "support",
        })
      ).status,
      201,
    );
    const lead = {
      name: "Synthetic Test Applicant",
      phone: "+374 00 111222",
      telegram: "",
      city: "Երևան",
      adult: true,
      consent: true,
      termsAccepted: true,
      language: "hy",
      website: "",
    };
    const r = await call("/api/registrations", "POST", lead);
    assert.equal(r.status, 201);
    const result = await r.json();
    const telegramLink = new URL(result.telegramUrl);
    const message = telegramLink.searchParams.get("text");
    assert.equal(telegramLink.origin, "https://t.me");
    assert.equal(telegramLink.pathname, "/yvnbet");
    assert.ok(message.includes(lead.phone));
    assert.ok(message.includes(lead.city));
    assert.ok(message.includes(lead.name));
    assert.match(message, /18\+/);
    assert.match(message, /Բարև, YvnBet ջան/);
    assert.doesNotMatch(message, /Telegram:/);
    const sql = new DatabaseSync(path.join(dir, "cms.sqlite"));
    const raw = sql.prepare("SELECT payload FROM leads").get().payload;
    assert.ok(!raw.includes(lead.name));
    assert.ok(!raw.includes(lead.phone));
    sql.close();
    await login("editor", "Editor-Test-Password-2026");
    assert.equal((await call("/api/leads")).status, 403);
    assert.equal((await call("/api/users")).status, 403);
    assert.equal((await call("/api/admin/content")).status, 200);
    await login("support", "Support-Test-Password-2026");
    assert.equal((await call("/api/admin/content")).status, 403);
    assert.equal((await call("/api/upload", "POST", { data: "" })).status, 403);
    let leads = await (await call("/api/leads")).json();
    assert.equal(leads.items[0].name, lead.name);
    assert.equal(leads.items[0].city, lead.city);
    assert.equal(leads.items[0].adult, true);
    assert.equal(
      (await call("/api/leads/" + result.id, "PATCH", { status: "contacted" }))
        .status,
      200,
    );
    assert.equal(
      (await call("/api/leads/" + result.id, "DELETE", {})).status,
      403,
    );
    cookie = adminAuth.cookie;
    csrf = adminAuth.csrf;
    assert.equal(
      (await call("/api/users/1", "PATCH", { role: "editor" })).status,
      400,
    );
    assert.equal((await call("/api/users/1", "DELETE", {})).status, 400);
    await stop();
    await start();
    state = await (await call("/api/admin/content")).json();
    assert.equal(state.content.games[0].title.ru, "Проверка сохранения");
    leads = await (await call("/api/leads")).json();
    assert.equal(leads.items[0].status, "contacted");
    assert.equal(
      (await call("/api/leads/" + result.id, "DELETE", {})).status,
      200,
    );
    assert.equal((await (await call("/api/leads")).json()).total, 0);
    assert.equal((await call("/api/logout", "POST", {})).status, 200);
    assert.equal((await call("/api/session")).status, 401);
    for (let i = 0; i < 8; i++)
      await call("/api/login", "POST", {
        username: "admin",
        password: "wrong",
      });
    assert.equal(
      (
        await call("/api/login", "POST", {
          username: "admin",
          password: "wrong",
        })
      ).status,
      429,
    );
  } finally {
    await stop();
    await rm(dir, { recursive: true, force: true });
  }
});
