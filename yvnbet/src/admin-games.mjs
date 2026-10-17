export function nextGameIdentifier(games, fillRandom = (values) => crypto.getRandomValues(values)) {
  const used = new Set(games.flatMap((game) => [String(game.id), String(game.slug)]));
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const values = new Uint32Array(1);
    fillRandom(values);
    const id = String(10000 + (values[0] % 90000));
    if (!used.has(id)) return id;
  }
  throw new Error("Не удалось создать уникальный пятизначный ID игры");
}

export function sharedGameTitle(value) {
  return { ru: value, hy: value, en: value };
}
