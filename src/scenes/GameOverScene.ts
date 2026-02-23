import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';

export interface GameOverData {
  floor: number;
  kills: number;
  gold: number;
  level: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: GameOverData) {
    this.cameras.main.setBackgroundColor(0x0a0a15);

    // Title
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 4, 'YOU DIED', {
        fontSize: '56px',
        color: COLORS.UI_ACCENT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Stats
    const stats = [
      `Floor Reached: ${data.floor}`,
      `Level: ${data.level}`,
      `Enemies Slain: ${data.kills}`,
      `Gold Collected: ${data.gold}`,
    ];

    stats.forEach((stat, i) => {
      this.add
        .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20 + i * 28, stat, {
          fontSize: '18px',
          color: COLORS.UI_TEXT,
        })
        .setOrigin(0.5);
    });

    // Retry prompt
    const prompt = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT * 0.78, 'Press ENTER to Try Again', {
        fontSize: '20px',
        color: COLORS.UI_TEXT,
      })
      .setOrigin(0.5);

    // Blink
    this.time.addEvent({
      delay: 600,
      loop: true,
      callback: () => prompt.setVisible(!prompt.visible),
    });

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.scene.start('MenuScene');
    });
  }
}
