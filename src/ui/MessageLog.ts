import Phaser from 'phaser';
import { COLORS } from '../constants';

const MAX_MESSAGES = 5;

export class MessageLog {
  private messages: string[] = [];
  private textObjects: Phaser.GameObjects.Text[] = [];
  private scene: Phaser.Scene;
  private x: number;
  private y: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;

    for (let i = 0; i < MAX_MESSAGES; i++) {
      const text = scene.add
        .text(x, y + i * 16, '', {
          fontSize: '11px',
          color: COLORS.UI_TEXT,
        })
        .setDepth(200)
        .setAlpha(1 - i * 0.15);
      this.textObjects.push(text);
    }
  }

  add(message: string): void {
    this.messages.unshift(message);
    if (this.messages.length > MAX_MESSAGES) {
      this.messages.pop();
    }
    this.render();
  }

  private render(): void {
    for (let i = 0; i < MAX_MESSAGES; i++) {
      this.textObjects[i].setText(this.messages[i] || '');
    }
  }
}
