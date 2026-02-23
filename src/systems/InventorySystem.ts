export interface InventoryItem {
  id: string;
  type: string;
  name: string;
  description: string;
  stackable: boolean;
  count: number;
}

export const MAX_INVENTORY_SIZE = 10;

export function addItem(
  inventory: InventoryItem[],
  item: InventoryItem,
): { success: boolean; inventory: InventoryItem[] } {
  if (item.stackable) {
    const existing = inventory.find((i) => i.type === item.type);
    if (existing) {
      existing.count += item.count;
      return { success: true, inventory };
    }
  }

  if (inventory.length >= MAX_INVENTORY_SIZE) {
    return { success: false, inventory };
  }

  return { success: true, inventory: [...inventory, { ...item }] };
}

export function removeItem(
  inventory: InventoryItem[],
  itemId: string,
): { removed: InventoryItem | null; inventory: InventoryItem[] } {
  const index = inventory.findIndex((i) => i.id === itemId);
  if (index === -1) return { removed: null, inventory };

  const item = inventory[index];
  if (item.stackable && item.count > 1) {
    item.count -= 1;
    return { removed: { ...item, count: 1 }, inventory };
  }

  const newInventory = [...inventory];
  newInventory.splice(index, 1);
  return { removed: item, inventory: newInventory };
}

export function useItem(
  inventory: InventoryItem[],
  itemId: string,
): { used: InventoryItem | null; inventory: InventoryItem[] } {
  const item = inventory.find((i) => i.id === itemId);
  if (!item) return { used: null, inventory };

  const result = removeItem(inventory, itemId);
  return { used: result.removed, inventory: result.inventory };
}
