export const ADMIN_PATH = "/login/yvn/admin";
export function routeFor(path, c) {
  const parts = path.split("/").filter(Boolean);
  const lang = ["ru", "hy", "en"].includes(parts[0])
    ? parts.shift()
    : c.settings.defaultLanguage;
  let section = parts.shift() || "home";
  const slug = parts.shift();
  let item = null,
    valid = parts.length === 0;
  if (["games", "providers", "promotions", "categories"].includes(section) && slug)
    item = c[section].find((x) => x.slug === slug);
  else item = c.pages.find((x) => x.slug === section) || null;
  // Legacy flat category links remain usable, while the namespace avoids page collisions.
  if (!slug && !item && !["home", "login", "slots", "promotions", "help", "app", "games", "providers", "categories", "about", "privacy", "terms"].includes(section)) {
    item = c.categories.find((x) => x.slug === section) || null;
    if (item) section = "categories";
  }
  if (slug && !item) valid = false;
  if (slug && !["games", "providers", "promotions", "categories"].includes(section))
    valid = false;
  if (
    (![
      "home",
      "login",
      "slots",
      "promotions",
      "help",
      "app",
      "games",
      "providers",
      "about",
      "privacy",
      "terms",
    ].includes(section) &&
      !item) ||
    (["games", "categories"].includes(section) && !item)
  )
    valid = false;
  if (["about", "privacy", "terms", "app"].includes(section) && !item)
    valid = false;
  return {
    lang,
    section,
    slug,
    item,
    valid,
    path: section === "categories" && item ? (item.slug === "slots" ? `/${lang}/slots` : `/${lang}/categories/${item.slug}`) : `/${lang}${section === "home" ? "" : "/" + section}${slug ? "/" + slug : ""}`,
  };
}
export function paths(c) {
  return [...new Set([
    "",
    "/slots",
    "/providers",
    "/promotions",
    "/help",
    ...c.pages.map((x) => "/" + x.slug),
    ...["games", "providers", "promotions", "categories"].flatMap((k) =>
      c[k].filter((x) => k !== "categories" || x.slug !== "slots").map((x) => `/${k}/${x.slug}`),
    ),
  ])];
}

export function routeIsIndexable(c, path) {
  if (!c.settings.indexable) return false;
  const route = routeFor(path, c);
  if (!route.valid || route.section === "login") return false;
  if (route.item) return route.item.indexable !== false;
  return c.seo[route.section]?.indexable !== false;
}

export function indexablePaths(c) {
  return paths(c).filter((path) => routeIsIndexable(c, `/${c.settings.defaultLanguage}${path}`));
}
