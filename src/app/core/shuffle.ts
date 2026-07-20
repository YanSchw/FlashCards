// Weighted sampling without replacement (Efraimidis–Spirakis):
// each item gets key = random^(1/weight); the K highest keys win.
// Higher weight -> more likely to be picked and to land near the front.
export function weightedSample<T>(items: T[], weightOf: (item: T) => number, k: number): T[] {
  const keyed = items.map((item) => {
    const w = Math.max(weightOf(item), 1e-9);
    return { item, key: Math.pow(Math.random(), 1 / w) };
  });
  keyed.sort((a, b) => b.key - a.key);
  return keyed.slice(0, Math.max(0, Math.min(k, items.length))).map((x) => x.item);
}
