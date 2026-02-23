import Phaser from 'phaser';
import { COLORS } from '../constants';
import { InventoryItem, MAX_INVENTORY_SIZE } from '../systems/InventorySystem';

const SLOT_SIZE = 28;
const SLOT_GAP = 4;

export class InventoryDisplay {
  private slots: Phaser.GameObjects.Rectangle[] = [];
  private labels: Phaser.GameObjects.Text[] = [];
  private countTexts: Phaser.GameObjects.Text[] = [];
  private x: number;
  private y: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.x = x;
    this.y = y;

    for (let i = 0; i < MAX_INVENTORY_SIZE; i++) {
      const sx = x + i * (SLOT_SIZE + SLOT_GAP);

      // Slot background
      const slot = scene.add
        .rectangle(sx, y, SLOT_SIZE, SLOT_SIZE, 0x16213e)
        .setOrigin(0, 0)
        .setDepth(200)
        .setStrokeStyle(1, 0x3d3d5c);
      this.slots.push(slot);

      // Key label
      const label = scene.add
        .text(sx + 2, y + 1, `${(i + 1) % 10}`, {
          fontSize: '8px',
          color: '#666666',
        })
        .setDepth(201);
      this.labels.push(label);

      // Count text
      const count = scene.add
        .text(sx + SLOT_SIZE - 3, y + SLOT_SIZE - 3, '', {
          fontSize: '8px',
          color: COLORS.UI_TEXT,
        })
        .setOrigin(1, 1)
        .setDepth(201);
      this.countTexts.push(count);
    }
  }

  update(inventory: InventoryItem[]): void {
    for (let i = 0; i < MAX_INVENTORY_SIZE; i++) {
      if (i < inventory.length) {
        const item = inventory[i];
        this.slots[i].setFillStyle(0x2a2a4e);
        this.countTexts[i].setText(item.count > 1 ? `${item.count}` : '');
      } else {
        this.slots[i].setFillStyle(0x16213e);
        this.countTexts[i].setText('');
      }
    }
  }
}
