import { test } from "node:test";
import assert from "node:assert/strict";
import { mixGames, orderProviders, seededRandom } from "../src/catalog.mjs";
import { initialContent, upgradeProviderOrdering, upgradePromotionPlacement } from "../src/content.mjs";
import { validateContent } from "./validation.mjs";
import { createReel } from "../src/reel.mjs";

test("mixed catalogs are complete, immutable and stable for a visit, with provider groups broken up", () => {
  const games = Array.from({length: 45}, (_, i) => ({id: String(i), provider: String(Math.floor(i / 15))}));
  const snapshot = structuredClone(games);
  const first = mixGames(games, seededRandom(123));
  assert.deepEqual(games, snapshot);
  assert.deepEqual(first, mixGames(games, seededRandom(123)));
  assert.notDeepEqual(first, mixGames(games, seededRandom(456)));
  assert.equal(new Set(first.map(g => g.id)).size, games.length);
  assert.ok(first.slice(0, 10).every((g, i, a) => !i || g.provider !== a[i - 1].provider));
  assert.deepEqual(mixGames([], seededRandom(1)), []);
  assert.deepEqual(mixGames([games[0]], seededRandom(1)), [games[0]]);
  const reel = createReel(games, 12, games[0].id, seededRandom(5));
  assert.equal(reel.winner.id, games[12].id);
  assert.equal(reel.entries[1].id, games[0].id);
  assert.ok(new Set(reel.entries.slice(2, 10).map(g => g.provider)).size > 1);
});

test("any number of ranked providers precedes an unchanged remainder; migration preserves choices", () => {
  const providers = Array.from({length: 12}, (_, i) => ({id: String(i), pinned: i === 3 || i === 8, pinnedOrder: i === 8 ? 1 : 2}));
  const first = orderProviders(providers, seededRandom(10));
  const second = orderProviders(providers, seededRandom(11));
  assert.deepEqual(first.slice(0, 2).map(p => p.id), ["8", "3"]);
  assert.deepEqual(first, second);
  assert.deepEqual(first.slice(2).map(p => p.id), providers.filter(p => !p.pinned).map(p => p.id));
  assert.equal(new Set(first.map(p => p.id)).size, providers.length);
  const c = structuredClone(initialContent);
  delete c.providers[0].pinned;
  delete c.providers[0].pinnedOrder;
  delete c.interface.hy.searchCatalog;
  c.providers[1].pinned = true;
  c.providers[1].pinnedOrder = 3;
  const upgraded = upgradeProviderOrdering(c);
  assert.equal(upgraded.providers[0].pinned, false);
  assert.equal(upgraded.providers[1].pinnedOrder, 3);
  assert.deepEqual(upgradeProviderOrdering(upgraded), upgraded);
  assert.doesNotThrow(() => validateContent(upgraded));
  upgraded.providers = [
    ...upgraded.providers.map((provider, i) => ({ ...provider, pinned: true, pinnedOrder: i + 1 })),
    ...Array.from({length: 3}, (_, i) => ({
      ...upgraded.providers[0],
      id: 'provider-extra-' + i,
      slug: 'provider-extra-' + i,
      title: { ru: 'Provider ' + i, hy: 'Provider ' + i, en: 'Provider ' + i },
      pinned: true,
      pinnedOrder: upgraded.providers.length + i + 1,
    })),
  ];
  assert.doesNotThrow(() => validateContent(upgraded));
});

test("games can be prioritized while homepage placement belongs to promotions", async () => {
  const { upgradeGamePlacement, publicContent } = await import('../src/content.mjs');
  const { orderGames } = await import('../src/catalog.mjs');
  const old = structuredClone(initialContent);
  old.games[0].showOnHome = false;
  delete old.games[0].priority;
  delete old.games[0].priorityOrder;
  const c = upgradeGamePlacement(old);
  assert.equal("showOnHome" in c.games[0], false);
  assert.deepEqual(upgradeGamePlacement(c), c);
  c.games[2].priority = true;
  c.games[2].priorityOrder = 2;
  c.games[4].priority = true;
  c.games[4].priorityOrder = 1;
  const ordered = orderGames(c.games, seededRandom(1));
  assert.deepEqual(ordered.slice(0, 2).map(g => g.id), [c.games[4].id, c.games[2].id]);
  assert.deepEqual(orderGames(c.games, seededRandom(2)).slice(0, 2), ordered.slice(0, 2));
  assert.equal(new Set(ordered.map(g => g.id)).size, c.games.length);
  assert.equal(publicContent(c).games.length, c.games.length);
  assert.doesNotThrow(() => validateContent(c));
  const added = structuredClone(c.games[0]);
  delete added.priority; delete added.priorityOrder;
  c.games = [added];
  assert.equal(validateContent(c).games[0].priority, false);
  c.games[0].priorityOrder = 0;
  assert.throws(() => validateContent(c));
});

test("existing promotions stay on the homepage, new ones opt in, and the old game field is removed", () => {
  const old = structuredClone(initialContent);
  delete old.promotions[0].showOnHome;
  old.games[0].showOnHome = false;
  const upgraded = upgradePromotionPlacement(old);
  assert.equal(upgraded.promotions[0].showOnHome, true);
  assert.equal("showOnHome" in upgraded.games[0], false);
  assert.deepEqual(upgradePromotionPlacement(upgraded), upgraded);
  const promotion = structuredClone(upgraded.promotions[0]);
  delete promotion.showOnHome;
  upgraded.promotions = [promotion];
  assert.equal(validateContent(upgraded).promotions[0].showOnHome, false);
});
