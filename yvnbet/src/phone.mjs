import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js/min";
import countryNames from "./country-names.json" with { type: "json" };
export { getCountryCallingCode };
export const phoneCountries = getCountries();
export const countryName = (code, lang = "en") =>
  countryNames[lang]?.[code] || countryNames.en[code] || code;
export function countryOptions(lang = "en", query = "") {
  const q = query.trim().toLocaleLowerCase();
  const digits = q.replace(/^\+|^00/g, "");
  return phoneCountries
    .map((code) => ({
      code,
      name: countryName(code, lang),
      dial: getCountryCallingCode(code),
      aliases: ["en", "ru", "hy"]
        .map((l) => countryName(code, l))
        .join(" ")
        .toLocaleLowerCase(),
    }))
    .filter(
      (c) =>
        !q ||
        c.name.toLocaleLowerCase().includes(q) ||
        c.aliases.includes(q) ||
        c.code.toLowerCase() === q ||
        (/^\d+$/.test(digits) && c.dial.startsWith(digits)),
    )
    .sort((a, b) => a.name.localeCompare(b.name, lang));
}
export function normalizePhone(value, country) {
  if (!phoneCountries.includes(country) || !/^[+\d ()-]+$/.test(value.trim()))
    return null;
  const number = parsePhoneNumberFromString(
    value.trim().replace(/^00/, "+"),
    country,
  );
  return number?.isPossible() ? number.number : null;
}
export function internationalCountry(value) {
  const input = value.trim().replace(/^00/, "+");
  return input.startsWith("+")
    ? parsePhoneNumberFromString(input)?.country
    : undefined;
}
