import Phaser from 'phaser';
import { TILE_SIZE, COLORS } from '../constants';
import { CombatStats } from '../systems/CombatSystem';

export class Entity {
  sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  tileX: number;
  tileY: number;
  stats: CombatStats;
  isMoving = false;

  constructor(
    scene: Phaser.Scene,
    tileX: number,
    tileY: number,
    texture: string | null,
    color: number,
    stats: CombatStats,
  ) {
    this.tileX = tileX;
    this.tileY = tileY;
    this.stats = { ...stats };

    const px = tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = tileY * TILE_SIZE + TILE_SIZE / 2;

    if (texture && scene.textures.exists(texture)) {
      this.sprite = scene.add.image(px, py, texture).setDisplaySize(TILE_SIZE, TILE_SIZE);
    } else {
      this.sprite = scene.add.rectangle(px, py, TILE_SIZE - 2, TILE_SIZE - 2, color);
    }
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
    if (this.sprite instanceof Phaser.GameObjects.Image) {
      this.sprite.setTint(0xff0000);
      scene.time.delayedCall(100, () => {
        if (this.sprite.active && this.sprite instanceof Phaser.GameObjects.Image) {
          this.sprite.clearTint();
        }
      });
    } else {
      const rect = this.sprite as Phaser.GameObjects.Rectangle;
      const originalColor = rect.fillColor;
      rect.setFillStyle(0xff0000);
      scene.time.delayedCall(100, () => {
        if (rect.active) {
          rect.setFillStyle(originalColor);
        }
      });
    }
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
