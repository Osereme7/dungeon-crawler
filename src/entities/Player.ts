import Phaser from 'phaser';
import { COLORS } from '../constants';
import { CombatStats, calculateLevelUp } from '../systems/CombatSystem';
import { InventoryItem } from '../systems/InventorySystem';
import { Entity } from './Entity';

export class Player extends Entity {
  level = 1;
  xp = 0;
  xpToNext: number;
  gold = 0;
  kills = 0;
  inventory: InventoryItem[] = [];
  equippedWeapon: InventoryItem | null = null;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number) {
    const stats: CombatStats = {
      hp: 100,
      maxHp: 100,
      attack: 10,
      defense: 3,
    };
    super(scene, tileX, tileY, COLORS.PLAYER, stats);
    this.xpToNext = calculateLevelUp(this.level);
  }

  addXp(amount: number): boolean {
    this.xp += amount;
    if (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level++;
      this.xpToNext = calculateLevelUp(this.level);
      this.stats.maxHp += 10;
      this.stats.hp = this.stats.maxHp;
      this.stats.attack += 2;
      this.stats.defense += 1;
      return true; // leveled up
    }
    return false;
  }

  heal(amount: number): number {
    const before = this.stats.hp;
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
    return this.stats.hp - before;
  }

  getEffectiveAttack(): number {
    return this.stats.attack;
  }
}
