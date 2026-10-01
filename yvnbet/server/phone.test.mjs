import { test } from "node:test";
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import {
  countryOptions,
  phoneCountries,
  normalizePhone,
  internationalCountry,
} from "../src/phone.mjs";

test("country search supports localized names, ISO codes and international prefixes with local flags", async () => {
  for (const query of ["Հայաստան", "Армения", "Armenia", "AM", "+374", "00374"])
    assert.ok(
      countryOptions("hy", query).some((c) => c.code === "AM"),
      query,
    );
  assert.ok(countryOptions("ru", "+1").some((c) => c.code === "CA"));
  assert.equal(countryOptions("en", "nonexistent-country-xyz").length, 0);
  assert.equal(countryOptions("en").length, phoneCountries.length);
  await Promise.all(
    phoneCountries.map((code) =>
      access(new URL(`../public/images/flag-${code}.svg`, import.meta.url)),
    ),
  );
});

test("phone normalization respects selected country, pasted international numbers and invalid input", () => {
  assert.equal(normalizePhone("091 123456", "AM"), "+37491123456");
  assert.equal(normalizePhone("+33 6 12 34 56 78", "AM"), "+33612345678");
  assert.equal(normalizePhone("00374 91 123456", "US"), "+37491123456");
  assert.equal(internationalCountry("+33 6 12 34 56 78"), "FR");
  for (const value of ["", "123", "call me 091123456", "----"])
    assert.equal(normalizePhone(value, "AM"), null);
});
