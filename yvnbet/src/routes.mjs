export const ADMIN_PATH = "/login/yvn/admin";
export function routeFor(path, c) {
  const parts = path.split("/").filter(Boolean);
  const lang = ["ru", "hy", "en"].includes(parts[0])
    ? parts.shift()
    : c.settings.defaultLanguage;
  const section = parts.shift() || "home";
  const slug = parts.shift();
  let item = null,
    valid = parts.length === 0;
  if (["games", "providers", "promotions"].includes(section) && slug)
    item = c[section].find((x) => x.slug === slug);
  else item = c.pages.find((x) => x.slug === section) || null;
  if (slug && !item) valid = false;
  if (slug && !["games", "providers", "promotions"].includes(section))
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
    (["games", "providers"].includes(section) && !item)
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
    path: `/${lang}${section === "home" ? "" : "/" + section}${slug ? "/" + slug : ""}`,
  };
}
export function paths(c) {
  return [...new Set([
    "",
    "/slots",
    "/promotions",
    "/help",
    ...c.pages.map((x) => "/" + x.slug),
    ...["games", "providers", "promotions"].flatMap((k) =>
      c[k].map((x) => `/${k}/${x.slug}`),
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
