import { test } from "node:test";
import assert from "node:assert/strict";
import { createReel } from "../src/reel.mjs";
import { initialContent, upgradePresentation } from "../src/content.mjs";

test("reel centers the selected game and preserves the previous result for repeat spins", () => {
  const games = initialContent.games;
  const before = structuredClone(games);
  for (let winner = 0; winner < games.length; winner++) {
    const run = createReel(games, winner, games.at(-1).id);
    assert.equal(run.entries[run.target].id, games[winner].id);
    assert.equal(run.winner, games[winner]);
    assert.equal(run.entries[1].id, games.at(-1).id);
    assert.ok(run.target > 10);
    assert.ok(run.entries[run.target - 1] && run.entries[run.target + 1]);
  }
  assert.deepEqual(games, before);
  assert.deepEqual(createReel([], 0), { entries: [], target: 0, winner: null });
  assert.equal(createReel([games[0]], 0).winner.id, games[0].id);
  const large = Array.from({ length: 1000 }, (_, i) => ({ id: String(i) }));
  assert.ok(createReel(large, 999).entries.length < 50);
  assert.equal(createReel(large, 999).winner.id, "999");
  assert.throws(() => createReel(games, -1), RangeError);
});

test("existing default top-games labels update while custom CMS text remains unchanged", () => {
  const c = structuredClone(initialContent);
  c.interface.hy.featured = "Ուշադրության կենտրոնում";
  c.interface.ru.featured = "Наш выбор";
  const updated = upgradePresentation(c);
  assert.equal(updated.interface.hy.featured, "Թոփ խաղեր");
  assert.equal(updated.interface.ru.featured, "Наш выбор");
  assert.deepEqual(upgradePresentation(updated), updated);
  assert.equal(c.interface.hy.featured, "Ուշադրության կենտրոնում");
});
