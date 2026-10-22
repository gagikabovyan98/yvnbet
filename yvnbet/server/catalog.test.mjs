import { test } from "node:test";
import assert from "node:assert/strict";
import { mixGames, orderProviders, seededRandom } from "../src/catalog.mjs";
import { initialContent, upgradeProviderOrdering } from "../src/content.mjs";
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

test("up to five manually ranked providers precede a shuffled remainder; migration preserves choices", () => {
  const providers = Array.from({length: 12}, (_, i) => ({id: String(i), pinned: i === 3 || i === 8, pinnedOrder: i === 8 ? 1 : 2}));
  const first = orderProviders(providers, seededRandom(10));
  const second = orderProviders(providers, seededRandom(11));
  assert.deepEqual(first.slice(0, 2).map(p => p.id), ["8", "3"]);
  assert.deepEqual(first.slice(0, 2), second.slice(0, 2));
  assert.notDeepEqual(first.slice(2), second.slice(2));
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
  upgraded.providers = Array.from({length: 6}, (_, i) => ({...upgraded.providers[0], id: 'provider-' + i, slug: 'provider-' + i, pinned: true}));
  assert.throws(() => validateContent(upgraded), /не больше 5/);
});
