import { isIP } from "node:net";
import geoip from "geoip-country";

const supported = ["hy", "ru", "en"];

export function requestLanguage(req, fallback = "hy") {
  const preferred = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("yvn_language="))
    ?.slice(13);
  if (supported.includes(preferred)) return preferred;

  // req.ip follows Express's explicitly configured proxy trust, never raw forwarded headers.
  const ip = req.ip?.replace(/^::ffff:/, "");
  const country = ip && isIP(ip) ? geoip.lookup(ip)?.country : undefined;
  if (country === "AM") return "hy";
  if (country === "RU") return "ru";
  const browser =
    req.headers["accept-language"] && req.acceptsLanguages(supported);
  return supported.includes(browser) ? browser : fallback;
}
