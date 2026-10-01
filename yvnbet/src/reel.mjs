// A fixed-size strip keeps the animation bounded even with a large CMS catalog.
export function createReel(games, winnerIndex, previousId) {
  if (!games.length) return { entries: [], target: 0, winner: null };
  if (
    !Number.isInteger(winnerIndex) ||
    winnerIndex < 0 ||
    winnerIndex >= games.length
  )
    throw new RangeError("Invalid game selection");
  const target = 30;
  const entries = Array.from(
    { length: target + 4 },
    (_, i) => games[i % games.length],
  );
  const previous = games.find((g) => g.id === previousId);
  if (previous) entries[1] = previous;
  entries[target] = games[winnerIndex];
  return { entries, target, winner: games[winnerIndex] };
}
