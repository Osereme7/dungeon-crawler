export interface LootEntry {
  type: string;
  weight: number;
  minFloor: number;
}

const DEFAULT_LOOT_TABLE: LootEntry[] = [
  { type: 'health_potion', weight: 40, minFloor: 1 },
  { type: 'weapon_rusty_sword', weight: 20, minFloor: 1 },
  { type: 'weapon_iron_sword', weight: 10, minFloor: 3 },
  { type: 'weapon_fire_blade', weight: 5, minFloor: 5 },
  { type: 'treasure_gold', weight: 30, minFloor: 1 },
  { type: 'treasure_gem', weight: 10, minFloor: 2 },
];

export function rollLoot(
  floor: number,
  table: LootEntry[] = DEFAULT_LOOT_TABLE,
  randomFn: () => number = Math.random,
): string | null {
  const eligible = table.filter((e) => floor >= e.minFloor);
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, e) => sum + e.weight, 0);
  let roll = randomFn() * totalWeight;

  for (const entry of eligible) {
    roll -= entry.weight;
    if (roll <= 0) return entry.type;
  }

  return eligible[eligible.length - 1].type;
}
