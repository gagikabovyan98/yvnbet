import { mixGames } from "./catalog.mjs";
// A fixed-size strip keeps the animation bounded even with a large CMS catalog.
export function createReel(games, winnerIndex, previousId, random = Math.random) {
  if (!games.length) return { entries: [], target: 0, winner: null };
  if (
    !Number.isInteger(winnerIndex) ||
    winnerIndex < 0 ||
    winnerIndex >= games.length
  )
    throw new RangeError("Invalid game selection");
  const target = 30;
  const entries = [];
  while (entries.length < target + 4) {
    const batch = mixGames(games, random);
    if (batch.length > 1 && entries.at(-1)?.provider === batch[0].provider) {
      const next = batch.findIndex(g => g.provider !== batch[0].provider);
      if (next > 0) [batch[0], batch[next]] = [batch[next], batch[0]];
    }
    entries.push(...batch.slice(0, target + 4 - entries.length));
  }
  const previous = games.find((g) => g.id === previousId);
  if (previous) entries[1] = previous;
  entries[target] = games[winnerIndex];
  return { entries, target, winner: games[winnerIndex] };
}
