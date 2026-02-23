import { describe, it, expect } from 'vitest';
import {
  addItem,
  removeItem,
  useItem,
  InventoryItem,
  MAX_INVENTORY_SIZE,
} from '../../src/systems/InventorySystem';

function makeItem(overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: 'test-1',
    type: 'health_potion',
    name: 'Health Potion',
    description: 'Heals 30 HP',
    stackable: true,
    count: 1,
    ...overrides,
  };
}

describe('InventorySystem', () => {
  describe('addItem', () => {
    it('should add an item to empty inventory', () => {
      const result = addItem([], makeItem());
      expect(result.success).toBe(true);
      expect(result.inventory.length).toBe(1);
    });

    it('should stack stackable items', () => {
      const existing = makeItem({ count: 2 });
      const result = addItem([existing], makeItem({ id: 'test-2' }));
      expect(result.success).toBe(true);
      expect(result.inventory.length).toBe(1);
      expect(result.inventory[0].count).toBe(3);
    });

    it('should not stack non-stackable items', () => {
      const sword = makeItem({ id: 'sword-1', type: 'weapon', stackable: false });
      const sword2 = makeItem({ id: 'sword-2', type: 'weapon', stackable: false });
      const result = addItem([sword], sword2);
      expect(result.success).toBe(true);
      expect(result.inventory.length).toBe(2);
    });

    it('should fail when inventory is full', () => {
      const full = Array.from({ length: MAX_INVENTORY_SIZE }, (_, i) =>
        makeItem({ id: `item-${i}`, type: `type-${i}`, stackable: false }),
      );
      const result = addItem(full, makeItem({ id: 'extra', type: 'extra', stackable: false }));
      expect(result.success).toBe(false);
      expect(result.inventory.length).toBe(MAX_INVENTORY_SIZE);
    });
  });

  describe('removeItem', () => {
    it('should remove an item by id', () => {
      const item = makeItem({ id: 'rm-1', stackable: false });
      const result = removeItem([item], 'rm-1');
      expect(result.removed).toBeTruthy();
      expect(result.inventory.length).toBe(0);
    });

    it('should decrement stackable item count', () => {
      const item = makeItem({ id: 'stack-1', count: 3 });
      const result = removeItem([item], 'stack-1');
      expect(result.removed).toBeTruthy();
      expect(result.removed!.count).toBe(1);
      expect(result.inventory[0].count).toBe(2);
    });

    it('should return null for non-existent item', () => {
      const result = removeItem([], 'nonexistent');
      expect(result.removed).toBeNull();
    });
  });

  describe('useItem', () => {
    it('should use and remove an item', () => {
      const item = makeItem({ id: 'use-1', stackable: false });
      const result = useItem([item], 'use-1');
      expect(result.used).toBeTruthy();
      expect(result.inventory.length).toBe(0);
    });

    it('should return null for non-existent item', () => {
      const result = useItem([], 'missing');
      expect(result.used).toBeNull();
    });
  });
});
