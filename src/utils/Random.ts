// Simple seeded PRNG (Mulberry32)
export function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(min: number, max: number, randomFn: () => number = Math.random): number {
  return min + Math.floor(randomFn() * (max - min + 1));
}

export function randomPick<T>(array: T[], randomFn: () => number = Math.random): T {
  return array[Math.floor(randomFn() * array.length)];
}

export function shuffle<T>(array: T[], randomFn: () => number = Math.random): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
