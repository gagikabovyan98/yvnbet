import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  validateContent,
  parseImage,
  safeUrl,
  leadSchema,
} from "./validation.mjs";
import {
  initialContent,
  publicContent,
  activePromotion,
} from "../src/content.mjs";
import { headFor, sitemap, metaFor } from "./seo.mjs";
import { routeFor } from '../src/routes.mjs';
const clone = () => structuredClone(initialContent);
test('detail metadata stays unique and text pages reject extra path segments', () => {
  const c = clone();
  assert.equal(metaFor(c, '/ru/promotions/welcome-guide').title, 'Ваш первый шаг в YvnBet — YvnBet');
  assert.notEqual(metaFor(c, '/ru/promotions/welcome-guide').description, metaFor(c, '/ru/promotions').description);
  assert.equal(routeFor('/ru/about/unexpected', c).valid, false);
  c.pages.push({...c.pages[0], id:'custom', slug:'custom'});
  assert.equal(routeFor('/en/custom', c).valid, true);
});
test("CMS accepts variable collections and rejects broken provider/category references", () => {
  const c = clone();
  c.games.push({ ...c.games[0], id: "another", slug: "another" });
  assert.equal(validateContent(c).games.length, 7);
  c.providers = [];
  assert.throws(() => validateContent(c), /провайдер/);
});
test("CMS rejects missing translations, duplicate slugs, unknown properties and unsafe links", () => {
  for (const change of [
    (c) => delete c.games[0].title.hy,
    (c) => (c.games[1].slug = c.games[0].slug),
    (c) => (c.settings.extra = true),
    (c) => (c.games[0].url = "javascript:alert(1)"),
    (c) => (c.settings.logo = "data:image/svg+xml,<svg/>"),
    (c) => (c.slides[0].url = "//evil.test"),
    (c) => (c.settings.telegram = "foo/bar"),
    (c) => (c.promotions[0].end = "yesterday"),
    (c) => {
      c.promotions[0].start = "2026-12-31";
      c.promotions[0].end = "2026-01-01";
    },
  ]) {
    const c = clone();
    change(c);
    assert.throws(() => validateContent(c));
  }
});
test("uploads re-encode valid images, reject scripts, SVG, corrupted and oversized files", async () => {
  const source = await sharp({
    create: { width: 10, height: 10, channels: 4, background: "#ff0000" },
  })
    .png()
    .toBuffer();
  const out = await parseImage(
    "data:image/png;base64," + source.toString("base64"),
  );
  assert.equal((await sharp(out.bytes).metadata()).format, "webp");
  for (const s of [
    "data:image/png;base64," +
      Buffer.from("<script>alert(1)</script>").toString("base64"),
    "data:image/svg+xml;base64,AAAA",
    "data:image/png;base64," +
      Buffer.alloc(4 * 1024 * 1024 + 1).toString("base64"),
  ])
    await assert.rejects(parseImage(s));
});
test("public content excludes drafts, disabled providers, future/expired promotions", () => {
  const c = clone();
  c.providers[0].enabled = false;
  c.games[3].enabled = false;
  c.promotions[0].start = "2099-01-01";
  const p = publicContent(c);
  assert.equal(p.games.length, 3);
  assert.equal(p.promotions.length, 0);
  assert.equal(c.games.length, 6);
  assert.equal(
    activePromotion({
      ...c.promotions[0],
      start: "2020-01-01",
      end: "2020-01-02",
    }),
    false,
  );
});
test("SEO escapes metadata and JSON-LD and emits route-specific multilingual links", () => {
  const c = clone();
  c.settings.siteUrl = "https://example.com";
  c.settings.indexable = true;
  c.games[0].seo.title.ru = "Game <script>alert(1)</script>";
  const head = headFor(c, "/ru/games/golden-eclipse", "nonce");
  assert.match(head, /Game &lt;script&gt;/);
  assert.match(head, /hreflang="hy"/);
  assert.ok(head.includes("https://example.com/ru/games/golden-eclipse"));
  assert.doesNotMatch(head, /<script>alert/);
  const xml = sitemap(c);
  for (const l of ["ru", "hy", "en"])
    assert.ok(xml.includes(`https://example.com/${l}/games/golden-eclipse`));
});
test("registration requires consent, valid contacts and an empty honeypot", () => {
  const v = {
    name: "Test User",
    phone: "+374 00 123456",
    telegram: "@test_user",
    consent: true,
    language: "en",
    website: "",
  };
  assert.equal(leadSchema.safeParse(v).success, true);
  for (const change of [
    { consent: false },
    { website: "bot" },
    { telegram: "http://test.com" },
    { name: "" },
  ])
    assert.equal(leadSchema.safeParse({ ...v, ...change }).success, false);
  assert.equal(safeUrl("https://user:pass@example.com"), false);
});
