import { z } from "zod";
import sharp from "sharp";
import { ui } from "../src/content.mjs";
const text = z.string().max(12000);
const local = z.strictObject({ ru: text, hy: text, en: text });
const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(90);
export function safeUrl(s, internal = true) {
  if (s === "") return true;
  if (
    internal &&
    /^\/(?!\/)[a-zA-Z0-9/_?#=&%.+-]*$/.test(s) &&
    !s.includes("..")
  )
    return true;
  try {
    const u = new URL(s);
    return (
      u.protocol === "https:" && !u.username && !u.password && !/[\s\\]/.test(s)
    );
  } catch {
    return false;
  }
}
const url = z
  .string()
  .max(2000)
  .refine((s) => safeUrl(s), "Нужен HTTPS-адрес или внутренний путь");
const external = z
  .string()
  .max(2000)
  .refine((s) => safeUrl(s, false), "Нужен HTTPS-адрес");
const telegramUrl = z
  .string()
  .max(2000)
  .refine((s) => {
    if (!s) return true;
    if (!safeUrl(s, false)) return false;
    const u = new URL(s);
    return (
      u.hostname === "t.me" &&
      !u.port &&
      /^\/(?:[a-zA-Z][a-zA-Z0-9_]{4,31}|\+\d{7,15})\/?$/.test(u.pathname)
    );
  }, "Укажите ссылку оператора: https://t.me/username");
const image = z
  .string()
  .max(2000)
  .refine(
    (s) =>
      !s ||
      /^\/(images|uploads)\/[a-zA-Z0-9._-]+$/.test(s) ||
      safeUrl(s, false),
    "Некорректный адрес изображения",
  );
const seo = z.strictObject({
  title: local,
  description: local,
  keywords: local,
});
const base = {
  id: slug,
  slug,
  title: local,
  description: local,
  seo,
  enabled: z.boolean(),
};
const mode = z.enum(["iframe", "external"]);
const date = z
  .string()
  .refine(
    (s) =>
      !s ||
      (/^\d{4}-\d{2}-\d{2}$/.test(s) &&
        !isNaN(Date.parse(s)) &&
        new Date(s).toISOString().slice(0, 10) === s),
    "Дата: YYYY-MM-DD",
  );
const list = (s) => z.array(z.strictObject({ ...base, ...s })).max(1000);
export const contentSchema = z.strictObject({
  version: z.literal(2),
  settings: z.strictObject({
    brand: z.string().min(1).max(80),
    logo: image,
    favicon: image,
    lion: image,
    telegram: z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{4,31}$/),
    registrationTelegramUrl: telegramUrl,
    supportTelegramUrl: telegramUrl,
    floatingTelegramUrl: telegramUrl,
    partnersTelegramUrl: telegramUrl,
    maintenanceTelegramUrl: telegramUrl,
    maintenance: z.boolean(),
    maintenanceTitle: local,
    maintenanceText: local,
    telegramText: local,
    loginUrl: external,
    loginMode: mode,
    appUrl: external,
    siteUrl: external.refine(
      (s) => !s || new URL(s).origin === s,
      "Укажите домен без пути и завершающего слеша",
    ),
    indexable: z.boolean(),
    ogImage: image,
    defaultLanguage: z.enum(["ru", "hy", "en"]),
    sliderSeconds: z.number().int().min(4).max(30),
  }),
  interface: z.strictObject(
    Object.fromEntries(
      ["ru", "hy", "en"].map((l) => [
        l,
        z.strictObject(
          Object.fromEntries(
            Object.keys(ui.ru).map((k) => [k, z.string().min(1).max(1000)]),
          ),
        ),
      ]),
    ),
  ),
  seo: z.strictObject(
    Object.fromEntries(
      ["home", "slots", "promotions", "help", "app"].map((k) => [k, seo]),
    ),
  ),
  providers: list({ logo: image, url: external, mode }),
  categories: list({}),
  games: list({
    provider: slug,
    category: slug,
    image,
    url: external,
    mode,
    featured: z.boolean(),
  }),
  slides: list({ mobileImage: image, mobileImageRu: image, mobileImageHy: image, mobileImageEn: image, image, imageRu: image, imageHy: image, imageEn: image, showText: z.boolean(), label: local, button: local, url }),
  promotions: list({
    kind: z.enum(["promotion", "bonus", "news", "offer"]),
    image,
    start: date,
    end: date,
    button: local,
    url,
  }),
  faq: list({}),
  pages: list({}),
});
export function validateContent(input) {
  const parsed = contentSchema.safeParse(input);
  if (!parsed.success)
    throw new Error(
      parsed.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; "),
    );
  const c = parsed.data;
  const reservedPages = new Set([
    "home",
    "login",
    "slots",
    "games",
    "providers",
    "promotions",
    "help",
    "ru",
    "hy",
    "en",
    "admin",
    "api",
    "uploads",
    "assets",
    "server",
  ]);
  if (c.pages.some((p) => reservedPages.has(p.slug)))
    throw new Error("Адрес страницы занят системным разделом");
  for (const key of [
    "games",
    "providers",
    "categories",
    "slides",
    "promotions",
    "faq",
    "pages",
  ])
    for (const row of c[key])
      if (row.enabled && Object.values(row.title).some((t) => !t.trim()))
        throw new Error(`${key}: заполните заголовок на трёх языках`);
  for (const key of ["games", "slides", "promotions"])
    for (const row of c[key])
      if (row.enabled && !row.image)
        throw new Error(`${key}: добавьте изображение перед публикацией`);
  if (!c.settings.logo || !c.settings.lion)
    throw new Error("Добавьте логотип и изображение льва");
  for (const key of [
    "providers",
    "categories",
    "games",
    "slides",
    "promotions",
    "faq",
    "pages",
  ]) {
    for (const field of ["id", "slug"])
      if (new Set(c[key].map((x) => x[field])).size !== c[key].length)
        throw new Error(`${key}: ${field} должны быть уникальными`);
  }
  for (const g of c.games)
    if (
      !c.providers.some((p) => p.id === g.provider) ||
      !c.categories.some((p) => p.id === g.category)
    )
      throw new Error(`У игры ${g.id} отсутствует провайдер или категория`);
  for (const p of c.promotions)
    if (p.start && p.end && p.start > p.end)
      throw new Error("Дата окончания раньше начала");
  if (!c.pages.some((p) => p.slug === "privacy" && p.enabled))
    throw new Error("Нужна опубликованная страница privacy");
  if (c.settings.indexable && !c.settings.siteUrl)
    throw new Error("Перед индексацией укажите домен");
  return c;
}
export async function parseImage(data) {
  const m =
    typeof data === "string" &&
    data.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!m) throw new Error("Поддерживаются PNG, JPEG и WebP");
  const bytes = Buffer.from(m[2], "base64");
  if (bytes.length > 4 * 1024 * 1024)
    throw new Error("Максимальный размер — 4 МБ");
  try {
    return {
      bytes: await sharp(bytes, {
        limitInputPixels: 25_000_000,
        animated: false,
      })
        .rotate()
        .resize({
          width: 1920,
          height: 1920,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 84 })
        .toBuffer(),
      ext: "webp",
    };
  } catch {
    throw new Error("Не удалось прочитать изображение");
  }
}
export const leadSchema = z.strictObject({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d ()-]{7,25}$/)
    .refine((s) => s.replace(/\D/g, "").length >= 7),
  city: z.string().trim().min(2).max(100),
  adult: z.literal(true),
  telegram: z
    .string()
    .trim()
    .regex(/^(?:@?[a-zA-Z][a-zA-Z0-9_]{4,31})?$/)
    .default(""),
  consent: z.literal(true),
  termsAccepted: z.literal(true),
  language: z.enum(["ru", "hy", "en"]),
  website: z.string().max(0),
});
