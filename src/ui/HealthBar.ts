import Phaser from 'phaser';
import { COLORS } from '../constants';

export class HealthBar {
  private bg: Phaser.GameObjects.Rectangle;
  private bar: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;
  private maxWidth: number;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    this.maxWidth = width;

    // Background
    this.bg = scene.add.rectangle(x, y, width, height, 0x333333).setOrigin(0, 0).setDepth(200);

    // Health fill
    this.bar = scene.add.rectangle(x, y, width, height, 0xe94560).setOrigin(0, 0).setDepth(201);

    // Text overlay
    this.text = scene.add
      .text(x + width / 2, y + height / 2, '', {
        fontSize: '11px',
        color: COLORS.UI_TEXT,
      })
      .setOrigin(0.5)
      .setDepth(202);
  }

  update(hp: number, maxHp: number): void {
    const ratio = Math.max(0, hp / maxHp);
    this.bar.setDisplaySize(this.maxWidth * ratio, this.bar.displayHeight);
    this.text.setText(`HP: ${hp}/${maxHp}`);

    // Color changes based on health
    if (ratio > 0.6) {
      this.bar.setFillStyle(0x44cc44);
    } else if (ratio > 0.3) {
      this.bar.setFillStyle(0xcccc44);
    } else {
      this.bar.setFillStyle(0xe94560);
    }
  }
}
