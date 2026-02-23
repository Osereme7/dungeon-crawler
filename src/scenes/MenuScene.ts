import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';

export class MenuScene extends Phaser.Scene {
  private blinkTimer = 0;
  private promptText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Title
    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 3, 'DUNGEON\nCRAWLER', {
      fontSize: '64px',
      color: COLORS.UI_ACCENT,
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 8,
    });
    title.setOrigin(0.5);

    // Subtitle
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 3 + 80, 'A Roguelike Adventure', {
        fontSize: '18px',
        color: COLORS.UI_TEXT,
      })
      .setOrigin(0.5);

    // Start prompt
    this.promptText = this.add
      .text(GAME_WIDTH / 2, (GAME_HEIGHT * 2) / 3, 'Press ENTER to Start', {
        fontSize: '20px',
        color: COLORS.UI_TEXT,
      })
      .setOrigin(0.5);

    // Controls info
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'WASD / Arrow Keys to move\nSPACE to attack', {
        fontSize: '14px',
        color: '#888888',
        align: 'center',
      })
      .setOrigin(0.5);

    // Listen for ENTER key
    this.input.keyboard!.on('keydown-ENTER', () => {
      this.scene.start('GameScene');
    });
  }

  update(_time: number, delta: number) {
    // Blink the prompt text
    this.blinkTimer += delta;
    if (this.blinkTimer > 600) {
      this.blinkTimer = 0;
      this.promptText.setVisible(!this.promptText.visible);
    }
  }
}
