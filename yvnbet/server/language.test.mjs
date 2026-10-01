import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { requestLanguage } from "./language.mjs";

const request = (ip, headers = {}) => ({
  ip,
  headers,
  acceptsLanguages: express.request.acceptsLanguages,
});

test("language uses manual choice, then country, then browser and CMS default", () => {
  assert.equal(
    requestLanguage(request("37.157.216.1", { "accept-language": "ru-RU" })),
    "hy",
  );
  assert.equal(
    requestLanguage(request("77.88.8.8", { "accept-language": "hy" })),
    "ru",
  );
  assert.equal(requestLanguage(request("::ffff:77.88.8.8")), "ru");
  assert.equal(
    requestLanguage(
      request("37.157.216.1", { cookie: "other=1; yvn_language=en" }),
    ),
    "en",
  );
  assert.equal(
    requestLanguage(
      request("127.0.0.1", {
        "accept-language": "fr;q=1,ru-RU;q=0.8,en;q=0.2",
      }),
    ),
    "ru",
  );
  assert.equal(
    requestLanguage(request("::1", { "accept-language": "hy-AM,en;q=0.5" })),
    "hy",
  );
  assert.equal(
    requestLanguage(
      request("invalid", {
        cookie: "yvn_language=invalid",
        "accept-language": "de",
      }),
      "en",
    ),
    "en",
  );
  assert.equal(requestLanguage(request("127.0.0.1"), "ru"), "ru");
  assert.equal(
    requestLanguage(
      request("127.0.0.1", {
        "x-forwarded-for": "77.88.8.8",
        "cf-ipcountry": "RU",
      }),
      "en",
    ),
    "en",
  );
});
