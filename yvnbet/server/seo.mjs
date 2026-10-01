import { routeFor, paths } from "../src/routes.mjs";
export const escapeHtml = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const jsonSafe = (x) => JSON.stringify(x).replace(/</g, "\\u003c");
export function metaFor(c, path) {
  const r = routeFor(path, c),
    t = c.interface[r.lang],
    pageSeo = r.item && r.section !== "app" ? undefined : c.seo[r.section],
    s = r.item?.seo || pageSeo,
    L = (x) => x?.[r.lang] || "";
  return {
    ...r,
    title: r.valid
      ? L(s?.title) ||
        L(pageSeo?.title) ||
        `${L(r.item?.title) || t[r.section] || c.settings.brand} — ${c.settings.brand}`
      : `404 — ${c.settings.brand}`,
    description:
      L(s?.description) ||
      L(pageSeo?.description) ||
      [L(r.item?.title), L(r.item?.description) || L(c.seo.home.description)]
        .filter(Boolean)
        .join(" — "),
    keywords: L(s?.keywords) || L(pageSeo?.keywords) || L(c.seo.home.keywords),
  };
}
export function headFor(c, path, nonce) {
  const m = metaFor(c, path),
    origin = c.settings.siteUrl,
    canonical = origin + m.path,
    img = c.settings.ogImage.startsWith("/")
      ? origin + c.settings.ogImage
      : c.settings.ogImage;
  const tag = (name, content, property = false) =>
    `<meta ${property ? "property" : "name"}="${name}" content="${escapeHtml(content)}">`;
  const schema = {
    "@context": "https://schema.org",
    "@type": m.section === "help" ? "FAQPage" : "WebPage",
    name: m.title,
    description: m.description,
    inLanguage: m.lang,
    ...(origin ? { url: canonical } : {}),
    ...(m.section === "help"
      ? {
          mainEntity: c.faq.map((f) => ({
            "@type": "Question",
            name: f.title[m.lang],
            acceptedAnswer: { "@type": "Answer", text: f.description[m.lang] },
          })),
        }
      : {}),
  };
  return `<title>${escapeHtml(m.title)}</title>${tag("description", m.description)}${tag("keywords", m.keywords)}${tag("robots", c.settings.indexable && m.valid ? "index, follow" : "noindex, nofollow")}${tag("og:type", "website", true)}${tag("og:site_name", c.settings.brand, true)}${tag("og:title", m.title, true)}${tag("og:description", m.description, true)}${tag("og:locale", { ru: "ru_RU", hy: "hy_AM", en: "en_GB" }[m.lang], true)}${tag("twitter:card", "summary_large_image")}${tag("twitter:title", m.title)}${tag("twitter:description", m.description)}${origin ? `${tag("og:url", canonical, true)}${tag("og:image", img, true)}${tag("twitter:image", img)}<link rel="canonical" href="${escapeHtml(canonical)}">${["ru", "hy", "en"].map((l) => `<link rel="alternate" hreflang="${l}" href="${escapeHtml(origin + m.path.replace(/^\/(ru|hy|en)/, "/" + l))}">`).join("")}<link rel="alternate" hreflang="x-default" href="${escapeHtml(origin + m.path.replace(/^\/(ru|hy|en)/, "/" + c.settings.defaultLanguage))}">` : ""}<script type="application/ld+json" nonce="${nonce}">${jsonSafe(schema)}</script>`;
}
export function sitemap(c) {
  const origin = c.settings.siteUrl;
  if (!origin || !c.settings.indexable)
    return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>';
  return (
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
    paths(c)
      .flatMap((p) =>
        ["ru", "hy", "en"].map(
          (l) =>
            `<url><loc>${escapeHtml(origin + "/" + l + p)}</loc>${["ru", "hy", "en"].map((x) => `<xhtml:link rel="alternate" hreflang="${x}" href="${escapeHtml(origin + "/" + x + p)}"/>`).join("")}</url>`,
        ),
      )
      .join("") +
    "</urlset>"
  );
}
