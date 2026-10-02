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
  upgradeContent,
  upgradeRegistrationUi,
  upgradeTelegramLinks,
  upgradeSiteControls,
  telegramContact,
  publicContent,
  activePromotion,
} from "../src/content.mjs";
import { headFor, sitemap, metaFor } from "./seo.mjs";
import { routeFor } from "../src/routes.mjs";
const clone = () => structuredClone(initialContent);
test("detail metadata stays unique and text pages reject extra path segments", () => {
  const c = clone();
  assert.equal(
    metaFor(c, "/ru/promotions/welcome-guide").title,
    "Ваш первый шаг в YvnBet — YvnBet",
  );
  assert.notEqual(
    metaFor(c, "/ru/promotions/welcome-guide").description,
    metaFor(c, "/ru/promotions").description,
  );
  assert.equal(routeFor("/ru/about/unexpected", c).valid, false);
  c.pages.push({ ...c.pages[0], id: "custom", slug: "custom" });
  assert.equal(routeFor("/en/custom", c).valid, true);
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
    (c) => (c.settings.registrationTelegramUrl = "https://evil.test/operator"),
    (c) => (c.settings.supportTelegramUrl = "javascript:alert(1)"),
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

test("Telegram settings migrate without changing operators and keep registration and support independent", () => {
  const c = clone();
  delete c.settings.registrationTelegramUrl;
  delete c.settings.supportTelegramUrl;
  c.settings.telegram = "existing_operator";
  const next = upgradeTelegramLinks(c);
  assert.equal(validateContent(next).settings.telegram, "existing_operator");
  assert.equal(
    new URL(telegramContact(next.settings, "registration", "Name & +374"))
      .pathname,
    "/existing_operator",
  );
  next.settings.registrationTelegramUrl = "https://t.me/new_operator";
  assert.equal(
    new URL(
      telegramContact(next.settings, "registration", "Name & +374"),
    ).searchParams.get("text"),
    "Name & +374",
  );
  assert.equal(
    new URL(telegramContact(next.settings, "registration", "")).pathname,
    "/new_operator",
  );
  assert.equal(
    new URL(telegramContact(next.settings, "support", "")).pathname,
    "/existing_operator",
  );
  assert.deepEqual(upgradeTelegramLinks(next), next);
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
    city: "Yerevan",
    adult: true,
    consent: true,
    termsAccepted: true,
    language: "en",
    website: "",
  };
  assert.equal(leadSchema.safeParse(v).success, true);
  for (const change of [
    { consent: false },
    { termsAccepted: false },
    { termsAccepted: undefined },
    { adult: false },
    { adult: undefined },
    { city: "" },
    { city: undefined },
    { website: "bot" },
    { telegram: "http://test.com" },
    { name: "" },
  ])
    assert.equal(leadSchema.safeParse({ ...v, ...change }).success, false);
  assert.equal(leadSchema.safeParse({ ...v, telegram: "" }).success, true);
  const { telegram, ...withoutTelegram } = v;
  assert.equal(leadSchema.safeParse(withoutTelegram).success, true);
  assert.equal(safeUrl("https://user:pass@example.com"), false);
});

test("registration UI migration preserves edited content and adds a routable partner page once", () => {
  const c = clone();
  c.pages = c.pages.filter((p) => p.slug !== "partners");
  c.interface.ru.countrySearch = "Custom search";
  delete c.interface.hy.countrySearch;
  const upgraded = upgradeRegistrationUi(c);
  assert.equal(
    validateContent(upgraded).interface.ru.countrySearch,
    "Custom search",
  );
  assert.ok(upgraded.interface.hy.countrySearch);
  for (const lang of ["ru", "hy", "en"])
    assert.equal(routeFor(`/${lang}/partners`, upgraded).valid, true);
  upgraded.pages.find((p) => p.slug === "partners").description.en =
    "Custom partnership terms";
  assert.deepEqual(upgradeRegistrationUi(upgraded), upgraded);
  assert.equal(
    c.pages.some((p) => p.slug === "partners"),
    false,
  );
});

test("existing content gains registration fields and slot previews without losing custom CMS values", () => {
  const c = clone();
  delete c.interface.hy.city;
  delete c.interface.ru.registrationIntro;
  c.interface.en.register = "Custom CTA";
  c.providers[0].logo = "/uploads/custom-provider.webp";
  c.providers[1].logo = "";
  c.categories.push({ ...c.categories[0], id: "table", slug: "table" });
  c.games[2].category = "table";
  c.games.push({
    ...c.games[0],
    id: "real-table",
    slug: "real-table",
    category: "table",
    url: "https://example.com/real-game",
  });
  c.settings.telegram = "custom_operator";
  const upgraded = upgradeContent(c);
  assert.equal(validateContent(upgraded).interface.hy.city, "Քաղաք");
  assert.equal(upgraded.interface.en.register, "Custom CTA");
  assert.equal(upgraded.settings.telegram, "custom_operator");
  assert.equal(upgraded.providers[0].logo, "/uploads/custom-provider.webp");
  assert.match(upgraded.providers[1].logo, /provider-pragmatic/);
  assert.equal(upgraded.games[2].category, "slots");
  assert.equal(upgraded.games.at(-1).category, "table");
  assert.equal(
    publicContent(upgraded).games.some((g) => g.id === "real-table"),
    false,
  );
  assert.deepEqual(upgradeContent(upgraded), upgraded);
  assert.equal(c.games[2].category, "table");
});

test("site controls migrate custom artwork and operators without enabling maintenance", () => {
  const c = clone();
  delete c.settings.maintenance;
  delete c.settings.floatingTelegramUrl;
  c.settings.supportTelegramUrl = "https://t.me/operator_existing";
  c.slides[0].image = "/uploads/custom.webp";
  delete c.slides[0].showText;
  const upgraded = upgradeSiteControls(c);
  assert.equal(validateContent(upgraded).settings.maintenance, false);
  assert.equal(upgraded.slides[0].showText, false);
  assert.equal(upgraded.settings.supportTelegramUrl, c.settings.supportTelegramUrl);
  assert.deepEqual(upgradeSiteControls(upgraded), upgraded);
  for (const purpose of ["floating", "partners", "maintenance"]) {
    assert.equal(new URL(telegramContact(upgraded.settings, purpose, "")).pathname, "/operator_existing");
    upgraded.settings[purpose + "TelegramUrl"] = "https://t.me/operator_" + purpose;
    const link = telegramContact(upgraded.settings, purpose, "Բարև hello +374 & name");
    assert.equal(new URL(link).pathname, "/operator_" + purpose);
    assert.equal(new URL(link).searchParams.get("text"), "Բարև hello +374 & name");
    assert.ok(!new URL(link).search.includes("+"));
  }
  upgraded.settings.registrationTelegramUrl = "https://t.me/+37499123456";
  assert.equal(new URL(telegramContact(upgraded.settings, "registration", "hello there")).pathname, "/+37499123456");
});
