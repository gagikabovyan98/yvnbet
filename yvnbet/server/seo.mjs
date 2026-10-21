import { routeFor, indexablePaths, routeIsIndexable } from "../src/routes.mjs";
export const escapeHtml = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const jsonSafe = (x) => JSON.stringify(x).replace(/</g, "\\u003c");
const absolute = (origin, value) =>
  !value ? undefined : value.startsWith("/") ? origin + value : value;
export function metaFor(c, path) {
  const r = routeFor(path, c),
    t = c.interface[r.lang],
    pageSeo = r.item && r.section !== "app" ? undefined : c.seo[r.section],
    s = r.item?.seo || pageSeo,
    L = (x) => x?.[r.lang] || "";
  return {
    ...r,
    indexable: routeIsIndexable(c, path),
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
  const schema = schemaFor(c, m);
  const robots = `${m.indexable ? "index, follow" : "noindex, follow"}${c.settings.indexImages ? "" : ", noimageindex"}`;
  return `<title>${escapeHtml(m.title)}</title>${tag("description", m.description)}${tag("keywords", m.keywords)}${tag("robots", robots)}${tag("og:type", "website", true)}${tag("og:site_name", c.settings.brand, true)}${tag("og:title", m.title, true)}${tag("og:description", m.description, true)}${tag("og:locale", { ru: "ru_RU", hy: "hy_AM", en: "en_GB" }[m.lang], true)}${tag("twitter:card", "summary_large_image")}${tag("twitter:title", m.title)}${tag("twitter:description", m.description)}${origin ? `${tag("og:url", canonical, true)}${tag("og:image", img, true)}${tag("twitter:image", img)}<link rel="canonical" href="${escapeHtml(canonical)}">${["ru", "hy", "en"].map((l) => `<link rel="alternate" hreflang="${l}" href="${escapeHtml(origin + m.path.replace(/^\/(ru|hy|en)/, "/" + l))}">`).join("")}<link rel="alternate" hreflang="x-default" href="${escapeHtml(origin + m.path.replace(/^\/(ru|hy|en)/, "/" + c.settings.defaultLanguage))}">` : ""}<script type="application/ld+json" nonce="${nonce}">${jsonSafe(schema)}</script>`;
}
export function schemaFor(c, routeOrPath) {
  const m =
      typeof routeOrPath === "string" ? metaFor(c, routeOrPath) : routeOrPath,
    origin = c.settings.siteUrl,
    canonical = origin + m.path,
    L = (value) => value?.[m.lang] || "",
    websiteId = origin ? origin + "/#website" : "#website",
    pageId = canonical + "#webpage";
  const page = {
    "@type": m.section === "help" ? "FAQPage" : m.section === "categories" ? "CollectionPage" : "WebPage",
    "@id": pageId,
    url: canonical,
    name: m.title,
    description: m.description,
    inLanguage: m.lang,
    isPartOf: { "@id": websiteId },
  };
  if (m.section === "help")
    page.mainEntity = c.faq.map((f) => ({
      "@type": "Question",
      name: L(f.title),
      acceptedAnswer: { "@type": "Answer", text: L(f.description) },
    }));
  if (m.section === "games" && m.item) {
    const provider = c.providers.find((p) => p.id === m.item.provider);
    page.mainEntity = {
      "@type": "VideoGame",
      "@id": canonical + "#game",
      name: L(m.item.title),
      description: L(m.item.description) || m.description,
      url: canonical,
      image: absolute(origin, m.item.image),
      gamePlatform: "Web Browser",
      ...(provider
        ? { publisher: { "@type": "Organization", name: L(provider.title) } }
        : {}),
    };
  }
  if (m.section === "providers" && m.item)
    page.mainEntity = {
      "@type": "Organization",
      "@id": canonical + "#provider",
      name: L(m.item.title),
      url: canonical,
      logo: absolute(origin, m.item.logo),
    };
  const graph = [
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: origin + "/",
      name: c.settings.brand,
      inLanguage: ["ru", "hy", "en"],
    },
    page,
  ];
  if (m.item) {
    const sectionName = c.interface[m.lang]?.[m.section] || m.section;
    graph.push({
      "@type": "BreadcrumbList",
      "@id": canonical + "#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: c.settings.brand,
          item: origin + "/" + m.lang,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: sectionName,
          item: origin + "/" + m.lang + "/" + m.section,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: L(m.item.title),
          item: canonical,
        },
      ],
    });
    if (m.section === "categories") {
      const breadcrumbs = graph.at(-1).itemListElement;
      breadcrumbs.splice(1, 1);
      breadcrumbs[1].position = 2;
    }
    page.breadcrumb = { "@id": canonical + "#breadcrumb" };
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
export function sitemap(c) {
  const origin = c.settings.siteUrl;
  if (!origin || !c.settings.indexable)
    return '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"/>';
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
    indexablePaths(c)
      .flatMap((p) =>
        ["ru", "hy", "en"].map(
          (l) =>
            `  <url>\n    <loc>${escapeHtml(origin + "/" + l + p)}</loc>\n${["ru", "hy", "en"].map((x) => `    <xhtml:link rel="alternate" hreflang="${x}" href="${escapeHtml(origin + "/" + x + p)}"/>`).join("\n")}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeHtml(origin + "/" + c.settings.defaultLanguage + p)}"/>\n  </url>`,
        ),
      )
      .join("\n") +
    "\n</urlset>"
  );
}
