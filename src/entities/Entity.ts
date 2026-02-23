import Phaser from 'phaser';
import { TILE_SIZE, COLORS } from '../constants';
import { CombatStats } from '../systems/CombatSystem';

export class Entity {
  sprite: Phaser.GameObjects.Rectangle;
  tileX: number;
  tileY: number;
  stats: CombatStats;
  isMoving = false;

  constructor(
    scene: Phaser.Scene,
    tileX: number,
    tileY: number,
    color: number,
    stats: CombatStats,
  ) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.stats = { ...stats };

    this.sprite = scene.add.rectangle(
      tileX * TILE_SIZE + TILE_SIZE / 2,
      tileY * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE - 2,
      TILE_SIZE - 2,
      color,
    );
    this.sprite.setDepth(10);
  }

  moveTo(scene: Phaser.Scene, newX: number, newY: number, duration = 100): Promise<void> {
    return new Promise((resolve) => {
      this.isMoving = true;
      this.tileX = newX;
      this.tileY = newY;

      scene.tweens.add({
        targets: this.sprite,
        x: newX * TILE_SIZE + TILE_SIZE / 2,
        y: newY * TILE_SIZE + TILE_SIZE / 2,
        duration,
        ease: 'Power2',
        onComplete: () => {
          this.isMoving = false;
          resolve();
        },
      });
    });
  }

  takeDamage(amount: number): number {
    this.stats.hp = Math.max(0, this.stats.hp - amount);
    return this.stats.hp;
  }

  isAlive(): boolean {
    return this.stats.hp > 0;
  }

  flashDamage(scene: Phaser.Scene): void {
    const originalColor = this.sprite.fillColor;
    this.sprite.setFillStyle(0xff0000);
    scene.time.delayedCall(100, () => {
      if (this.sprite.active) {
        this.sprite.setFillStyle(originalColor);
      }
    });
  }

  destroy(): void {
    this.sprite.destroy();
  }

  static readonly DEFAULT_PLAYER_STATS: CombatStats = {
    hp: 100,
    maxHp: 100,
    attack: 10,
    defense: 3,
  };

  static readonly COLORS = COLORS;
}
