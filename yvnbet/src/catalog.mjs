// Keep a visit's ordering stable while searching, opening games and returning to the list.
export function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle(items, random = Math.random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function mixGames(games, random = Math.random) {
  const groups = new Map();
  for (const game of shuffle(games, random)) {
    if (!groups.has(game.provider)) groups.set(game.provider, []);
    groups.get(game.provider).push(game);
  }
  const result = [];
  let previous;
  while (groups.size) {
    let candidates = [...groups.keys()].filter(key => key !== previous);
    if (!candidates.length) candidates = [...groups.keys()];
    const key = candidates[Math.floor(random() * candidates.length)];
    const group = groups.get(key);
    result.push(group.pop());
    if (!group.length) groups.delete(key);
    previous = key;
  }
  return result;
}
export function orderProviders(providers) {
  return [
    ...providers.filter(p => p.pinned).sort((a, b) => a.pinnedOrder - b.pinnedOrder),
    ...providers.filter(p => !p.pinned),
  ];
}
export function visitSeed() {
  if (typeof window === "undefined") return 1;
  try {
    const saved = sessionStorage.getItem("yvn-catalog-seed");
    if (saved) return Number(saved);
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    sessionStorage.setItem("yvn-catalog-seed", String(seed));
    return seed;
  } catch { return Date.now() >>> 0; }
}

export function orderGames(games, random = Math.random) {
  return [
    ...games.filter(game => game.priority).sort((a, b) => a.priorityOrder - b.priorityOrder),
    ...mixGames(games.filter(game => !game.priority), random),
  ];
}
