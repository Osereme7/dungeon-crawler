import Phaser from 'phaser';
import { TILE_SIZE } from '../../constants';

export type ItemType = 'health_potion' | 'weapon' | 'treasure';

export interface ItemConfig {
  type: string;
  name: string;
  description: string;
  color: number;
  effect: ItemEffect;
}

export type ItemEffect =
  | { kind: 'heal'; amount: number }
  | { kind: 'weapon'; attack: number }
  | { kind: 'gold'; amount: number };

export class WorldItem {
  sprite: Phaser.GameObjects.Rectangle;
  tileX: number;
  tileY: number;
  config: ItemConfig;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number, config: ItemConfig) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.config = config;

    this.sprite = scene.add.rectangle(
      tileX * TILE_SIZE + TILE_SIZE / 2,
      tileY * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2,
      TILE_SIZE / 2,
      config.color,
    );
    this.sprite.setDepth(5);
  }

  destroy(): void {
    this.sprite.destroy();
  }
}

export const ITEM_CONFIGS: Record<string, ItemConfig> = {
  health_potion: {
    type: 'health_potion',
    name: 'Health Potion',
    description: 'Restores 30 HP',
    color: 0xff4444,
    effect: { kind: 'heal', amount: 30 },
  },
  weapon_rusty_sword: {
    type: 'weapon_rusty_sword',
    name: 'Rusty Sword',
    description: 'ATK +3',
    color: 0xaa8844,
    effect: { kind: 'weapon', attack: 3 },
  },
  weapon_iron_sword: {
    type: 'weapon_iron_sword',
    name: 'Iron Sword',
    description: 'ATK +6',
    color: 0xccccdd,
    effect: { kind: 'weapon', attack: 6 },
  },
  weapon_fire_blade: {
    type: 'weapon_fire_blade',
    name: 'Fire Blade',
    description: 'ATK +10',
    color: 0xff6600,
    effect: { kind: 'weapon', attack: 10 },
  },
  treasure_gold: {
    type: 'treasure_gold',
    name: 'Gold Coins',
    description: 'Worth 25 gold',
    color: 0xffd700,
    effect: { kind: 'gold', amount: 25 },
  },
  treasure_gem: {
    type: 'treasure_gem',
    name: 'Gemstone',
    description: 'Worth 100 gold',
    color: 0x44ddff,
    effect: { kind: 'gold', amount: 100 },
  },
};
