import { describe, it, expect } from 'vitest';
import { rollLoot, LootEntry } from '../../src/systems/LootTable';

describe('LootTable', () => {
  const table: LootEntry[] = [
    { type: 'potion', weight: 50, minFloor: 1 },
    { type: 'sword', weight: 30, minFloor: 1 },
    { type: 'rare_gem', weight: 20, minFloor: 5 },
  ];

  it('should return a valid loot type', () => {
    const loot = rollLoot(1, table, () => 0.3);
    expect(loot).toBeTruthy();
    expect(['potion', 'sword']).toContain(loot);
  });

  it('should filter by minimum floor', () => {
    // On floor 1, rare_gem (minFloor: 5) should never drop
    for (let i = 0; i < 100; i++) {
      const loot = rollLoot(1, table);
      expect(loot).not.toBe('rare_gem');
    }
  });

  it('should allow rare items on higher floors', () => {
    // On floor 5+, rare_gem is eligible
    let foundRare = false;
    for (let i = 0; i < 1000; i++) {
      const loot = rollLoot(5, table);
      if (loot === 'rare_gem') {
        foundRare = true;
        break;
      }
    }
    expect(foundRare).toBe(true);
  });

  it('should return null for empty eligible table', () => {
    const loot = rollLoot(1, [{ type: 'x', weight: 10, minFloor: 99 }]);
    expect(loot).toBeNull();
  });

  it('should respect weights', () => {
    const counts: Record<string, number> = { potion: 0, sword: 0 };
    const runs = 10000;
    for (let i = 0; i < runs; i++) {
      const loot = rollLoot(1, table);
      if (loot && counts[loot] !== undefined) counts[loot]++;
    }
    // Potion weight is 50/80 = 62.5%, sword is 30/80 = 37.5%
    expect(counts.potion).toBeGreaterThan(counts.sword);
  });
});
