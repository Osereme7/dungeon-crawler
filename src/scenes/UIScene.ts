import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from '../constants';
import { HealthBar } from '../ui/HealthBar';
import { MessageLog } from '../ui/MessageLog';
import { Minimap } from '../ui/Minimap';
import { InventoryDisplay } from '../ui/InventoryDisplay';
import { Visibility } from '../systems/FOVSystem';
import { InventoryItem } from '../systems/InventorySystem';

export class UIScene extends Phaser.Scene {
  private healthBar!: HealthBar;
  private messageLog!: MessageLog;
  private minimap!: Minimap;
  private inventoryDisplay!: InventoryDisplay;
  private floorText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  create() {
    // Health bar (top-left)
    this.healthBar = new HealthBar(this, 10, 10, 160, 16);

    // Level + Gold (below health)
    this.levelText = this.add
      .text(10, 32, 'Lv 1', { fontSize: '11px', color: COLORS.UI_TEXT })
      .setDepth(200);
    this.goldText = this.add
      .text(70, 32, 'Gold: 0', { fontSize: '11px', color: '#ffd700' })
      .setDepth(200);

    // Floor indicator (top-center)
    this.floorText = this.add
      .text(GAME_WIDTH / 2, 10, 'Floor 1', {
        fontSize: '14px',
        color: COLORS.UI_TEXT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0)
      .setDepth(200);

    // Message log (bottom-left)
    this.messageLog = new MessageLog(this, 10, GAME_HEIGHT - 90);

    // Inventory (bottom-center)
    this.inventoryDisplay = new InventoryDisplay(this, GAME_WIDTH / 2 - 155, GAME_HEIGHT - 38);

    // Listen to game events
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('hp-changed', this.onHpChanged, this);
    gameScene.events.on('message', this.onMessage, this);
    gameScene.events.on('floor-changed', this.onFloorChanged, this);
    gameScene.events.on('stats-changed', this.onStatsChanged, this);
    gameScene.events.on('inventory-changed', this.onInventoryChanged, this);
    gameScene.events.on(
      'minimap-init',
      (data: { grid: number[][]; width: number; height: number }) => {
        this.minimap = new Minimap(this, GAME_WIDTH - 120, 10, 110, data.width, data.height);
      },
    );
    gameScene.events.on(
      'minimap-update',
      (data: { grid: number[][]; visMap: Visibility[][]; playerX: number; playerY: number }) => {
        if (this.minimap) {
          this.minimap.update(data.grid, data.visMap, data.playerX, data.playerY);
        }
      },
    );

    this.events.on('shutdown', () => {
      gameScene.events.off('hp-changed', this.onHpChanged, this);
      gameScene.events.off('message', this.onMessage, this);
      gameScene.events.off('floor-changed', this.onFloorChanged, this);
      gameScene.events.off('stats-changed', this.onStatsChanged, this);
      gameScene.events.off('inventory-changed', this.onInventoryChanged, this);
    });
  }

  private onHpChanged(hp: number, maxHp: number) {
    this.healthBar.update(hp, maxHp);
  }

  private onMessage(msg: string) {
    this.messageLog.add(msg);
  }

  private onFloorChanged(floor: number) {
    this.floorText.setText(`Floor ${floor}`);
  }

  private onStatsChanged(data: { level: number; gold: number }) {
    this.levelText.setText(`Lv ${data.level}`);
    this.goldText.setText(`Gold: ${data.gold}`);
  }

  private onInventoryChanged(inventory: InventoryItem[]) {
    this.inventoryDisplay.update(inventory);
  }
}
