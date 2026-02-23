import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import { generateAllSprites } from '../sprites/SpriteGenerator';
import { generateAllSounds } from '../audio/SoundGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const barWidth = 320;
    const barHeight = 20;
    const barX = (GAME_WIDTH - barWidth) / 2;
    const barY = GAME_HEIGHT / 2;

    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x16213e, 0.8);
    progressBox.fillRect(barX - 4, barY - 4, barWidth + 8, barHeight + 8);

    const progressBar = this.add.graphics();

    const loadingText = this.add.text(GAME_WIDTH / 2, barY - 30, 'Loading...', {
      fontSize: '16px',
      color: COLORS.UI_TEXT,
    });
    loadingText.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xe94560, 1);
      progressBar.fillRect(barX, barY, barWidth * value, barHeight);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  create() {
    // Generate all pixel art sprites
    generateAllSprites(this);

    // Generate all sound effects
    generateAllSounds(this);

    this.scene.start('MenuScene');
  }
}
