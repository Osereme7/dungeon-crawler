import Phaser from 'phaser';
import { TILE_SIZE } from '../constants';

export function showDamageNumber(
  scene: Phaser.Scene,
  tileX: number,
  tileY: number,
  damage: number,
  isCritical: boolean,
): void {
  const x = tileX * TILE_SIZE + TILE_SIZE / 2;
  const y = tileY * TILE_SIZE;

  const text = scene.add
    .text(x, y, `${isCritical ? 'CRIT ' : ''}${damage}`, {
      fontSize: isCritical ? '14px' : '11px',
      color: isCritical ? '#ffff00' : '#ff4444',
      fontStyle: isCritical ? 'bold' : 'normal',
    })
    .setOrigin(0.5)
    .setDepth(100);

  scene.tweens.add({
    targets: text,
    y: y - 20,
    alpha: 0,
    duration: 800,
    ease: 'Power2',
    onComplete: () => text.destroy(),
  });
}
