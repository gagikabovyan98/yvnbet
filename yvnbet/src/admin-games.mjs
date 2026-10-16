export function nextGameIdentifier(games) {
  const used = new Set(games.flatMap((game) => [String(game.id), String(game.slug)]));
  for (let value = 10000; value <= 99999; value += 1) {
    const id = String(value);
    if (!used.has(id)) return id;
  }
  throw new Error("Закончились свободные пятизначные ID игр");
}

export function sharedGameTitle(value) {
  return { ru: value, hy: value, en: value };
}
