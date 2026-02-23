import Phaser from 'phaser';
import { TILE_SIZE, COLORS } from '../constants';
import { generateDungeon, DungeonData, TILE_FLOOR } from '../dungeon/DungeonGenerator';
import { getDungeonParams } from '../dungeon/DungeonConfig';
import { Player } from '../entities/Player';
import { Enemy, ENEMY_CONFIGS, EnemyType } from '../entities/enemies/Enemy';
import { WorldItem, ITEM_CONFIGS } from '../entities/items/Item';
import { resolveAttack, calculateXpReward } from '../systems/CombatSystem';
import { canMoveTo } from '../systems/MovementSystem';
import { addItem, InventoryItem } from '../systems/InventorySystem';
import { rollLoot } from '../systems/LootTable';
import { createVisibilityMap, updateFOV, Visibility } from '../systems/FOVSystem';
import { findPath } from '../utils/Pathfinding';
import { manhattanDistance } from '../utils/TileUtils';
import { randomPick, randomInt } from '../utils/Random';
import { showDamageNumber } from '../ui/DamageNumbers';

const FOV_RADIUS = 8;
const ENEMY_TYPES: EnemyType[] = ['slime', 'bat', 'skeleton'];

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private items: WorldItem[] = [];
  private dungeon!: DungeonData;
  private visMap!: Visibility[][];
  private floor = 1;
  private tileGraphics!: Phaser.GameObjects.Graphics;
  private stairsSprite!: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private inputCooldown = 0;
  private isProcessingTurn = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.floor = 1;
    this.enemies = [];
    this.items = [];

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<string, Phaser.Input.Keyboard.Key>;

    // Use items with number keys
    this.input.keyboard!.on('keydown-ONE', () => this.useInventoryItem(0));
    this.input.keyboard!.on('keydown-TWO', () => this.useInventoryItem(1));
    this.input.keyboard!.on('keydown-THREE', () => this.useInventoryItem(2));
    this.input.keyboard!.on('keydown-FOUR', () => this.useInventoryItem(3));
    this.input.keyboard!.on('keydown-FIVE', () => this.useInventoryItem(4));

    // Tile rendering
    this.tileGraphics = this.add.graphics();

    // Launch UI
    this.scene.launch('UIScene');

    // Generate first floor
    this.generateFloor();
  }

  update(_time: number, delta: number) {
    if (this.isProcessingTurn) return;

    this.inputCooldown -= delta;
    if (this.inputCooldown > 0) return;

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.up.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) dy = 1;

    if (dx === 0 && dy === 0) return;

    this.inputCooldown = 130;
    this.processTurn(dx, dy);
  }

  private async processTurn(dx: number, dy: number) {
    this.isProcessingTurn = true;

    const newX = this.player.tileX + dx;
    const newY = this.player.tileY + dy;

    // Check for enemy at target position (bump attack)
    const targetEnemy = this.enemies.find(
      (e) => e.isAlive() && e.tileX === newX && e.tileY === newY,
    );

    if (targetEnemy) {
      await this.attackEnemy(targetEnemy);
    } else if (canMoveTo(this.dungeon.grid, newX, newY)) {
      await this.player.moveTo(this, newX, newY);
      this.playSound('sfx-step');
      this.pickupItems();
      this.checkStairs();
    }

    // Enemy turns
    await this.processEnemyTurns();

    // Update FOV
    this.updateVisibility();

    // Emit UI events
    this.emitUIUpdates();

    this.isProcessingTurn = false;
  }

  private async attackEnemy(enemy: Enemy) {
    const result = resolveAttack(
      { ...this.player.stats, attack: this.player.getEffectiveAttack() },
      enemy.stats,
    );

    enemy.takeDamage(result.damage);
    enemy.flashDamage(this);
    showDamageNumber(this, enemy.tileX, enemy.tileY, result.damage, result.isCritical);
    this.playSound(result.isCritical ? 'sfx-crit' : 'sfx-hit');
    this.cameras.main.shake(80, 0.005);

    const critText = result.isCritical ? ' CRITICAL!' : '';
    this.events.emit('message', `You hit ${enemy.name} for ${result.damage} damage!${critText}`);

    if (!enemy.isAlive()) {
      this.events.emit('message', `${enemy.name} defeated!`);
      this.playSound('sfx-kill');
      this.spawnDeathParticles(enemy.tileX, enemy.tileY);
      this.player.kills++;

      const xp = calculateXpReward(this.floor);
      const leveledUp = this.player.addXp(xp);
      if (leveledUp) {
        this.events.emit('message', `Level up! You are now level ${this.player.level}!`);
        this.playSound('sfx-levelup');
      }

      // Drop loot
      const lootType = rollLoot(this.floor);
      if (lootType && ITEM_CONFIGS[lootType]) {
        const config = ITEM_CONFIGS[lootType];
        const worldItem = new WorldItem(this, enemy.tileX, enemy.tileY, config);
        this.items.push(worldItem);
      }

      enemy.destroy();
      this.enemies = this.enemies.filter((e) => e !== enemy);
    }
  }

  private async processEnemyTurns() {
    for (const enemy of this.enemies) {
      if (!enemy.isAlive() || enemy.isMoving) continue;

      const dist = manhattanDistance(
        enemy.tileX,
        enemy.tileY,
        this.player.tileX,
        this.player.tileY,
      );

      if (dist > enemy.detectionRange) continue;

      // Adjacent — attack player
      if (dist === 1) {
        const result = resolveAttack(enemy.stats, this.player.stats);
        this.player.takeDamage(result.damage);
        this.player.flashDamage(this);
        showDamageNumber(
          this,
          this.player.tileX,
          this.player.tileY,
          result.damage,
          result.isCritical,
        );
        this.events.emit('message', `${enemy.name} hits you for ${result.damage} damage!`);
        this.playSound('sfx-hurt');
        this.cameras.main.shake(100, 0.008);

        if (!this.player.isAlive()) {
          this.gameOver();
          return;
        }
        continue;
      }

      // Move toward player
      let moveX = enemy.tileX;
      let moveY = enemy.tileY;

      if (enemy.usesPathfinding) {
        const path = findPath(
          this.dungeon.grid,
          enemy.tileX,
          enemy.tileY,
          this.player.tileX,
          this.player.tileY,
          50,
        );
        if (path && path.length > 0) {
          moveX = path[0].x;
          moveY = path[0].y;
        }
      } else {
        const ddx = Math.sign(this.player.tileX - enemy.tileX);
        const ddy = Math.sign(this.player.tileY - enemy.tileY);

        if (ddx !== 0 && canMoveTo(this.dungeon.grid, enemy.tileX + ddx, enemy.tileY)) {
          moveX = enemy.tileX + ddx;
        } else if (ddy !== 0 && canMoveTo(this.dungeon.grid, enemy.tileX, enemy.tileY + ddy)) {
          moveY = enemy.tileY + ddy;
        }
      }

      const occupied = this.enemies.some(
        (e) => e !== enemy && e.tileX === moveX && e.tileY === moveY,
      );
      const playerOccupies = this.player.tileX === moveX && this.player.tileY === moveY;

      if (!occupied && !playerOccupies && (moveX !== enemy.tileX || moveY !== enemy.tileY)) {
        await enemy.moveTo(this, moveX, moveY, 80);
      }
    }
  }

  private pickupItems() {
    const here = this.items.filter(
      (item) => item.tileX === this.player.tileX && item.tileY === this.player.tileY,
    );

    for (const worldItem of here) {
      const config = worldItem.config;
      const effect = config.effect;

      if (effect.kind === 'gold') {
        this.player.gold += effect.amount;
        this.events.emit('message', `Picked up ${config.name} (+${effect.amount} gold)`);
        this.playSound('sfx-pickup');
        worldItem.destroy();
        this.items = this.items.filter((i) => i !== worldItem);
      } else if (effect.kind === 'heal') {
        const invItem: InventoryItem = {
          id: `${config.type}_${Date.now()}`,
          type: config.type,
          name: config.name,
          description: config.description,
          stackable: true,
          count: 1,
        };
        const result = addItem(this.player.inventory, invItem);
        if (result.success) {
          this.player.inventory = result.inventory;
          this.events.emit('message', `Picked up ${config.name}`);
          this.playSound('sfx-pickup');
          worldItem.destroy();
          this.items = this.items.filter((i) => i !== worldItem);
        } else {
          this.events.emit('message', 'Inventory full!');
        }
      } else if (effect.kind === 'weapon') {
        const currentAtk = this.player.equippedWeapon
          ? (
              ITEM_CONFIGS[this.player.equippedWeapon.type]?.effect as {
                kind: 'weapon';
                attack: number;
              }
            )?.attack || 0
          : 0;
        if (effect.attack > currentAtk) {
          this.player.stats.attack = this.player.stats.attack - currentAtk + effect.attack;
          const invItem: InventoryItem = {
            id: `${config.type}_${Date.now()}`,
            type: config.type,
            name: config.name,
            description: config.description,
            stackable: false,
            count: 1,
          };
          this.player.equippedWeapon = invItem;
          this.events.emit('message', `Equipped ${config.name}! (ATK +${effect.attack})`);
          this.playSound('sfx-pickup');
          worldItem.destroy();
          this.items = this.items.filter((i) => i !== worldItem);
        } else {
          this.events.emit('message', `${config.name} is weaker than current weapon`);
        }
      }
    }

    this.events.emit('inventory-changed', this.player.inventory);
  }

  private useInventoryItem(index: number) {
    if (index >= this.player.inventory.length) return;
    const item = this.player.inventory[index];
    const config = ITEM_CONFIGS[item.type];
    if (!config) return;

    if (config.effect.kind === 'heal') {
      const healed = this.player.heal(config.effect.amount);
      if (healed > 0) {
        this.events.emit('message', `Used ${item.name}. Restored ${healed} HP.`);
        this.playSound('sfx-potion');
        if (item.stackable && item.count > 1) {
          item.count--;
        } else {
          this.player.inventory.splice(index, 1);
        }
        this.events.emit('inventory-changed', this.player.inventory);
        this.events.emit('hp-changed', this.player.stats.hp, this.player.stats.maxHp);
      } else {
        this.events.emit('message', 'Already at full health!');
      }
    }
  }

  private checkStairs() {
    if (
      this.player.tileX === this.dungeon.stairsDown.x &&
      this.player.tileY === this.dungeon.stairsDown.y
    ) {
      this.floor++;
      this.events.emit('message', `Descending to floor ${this.floor}...`);
      this.events.emit('floor-changed', this.floor);
      this.playSound('sfx-stairs');
      this.cleanupFloor();
      this.generateFloor();
    }
  }

  private cleanupFloor() {
    this.enemies.forEach((e) => e.destroy());
    this.enemies = [];
    this.items.forEach((i) => i.destroy());
    this.items = [];
    this.tileGraphics.clear();
    if (this.stairsSprite) this.stairsSprite.destroy();
  }

  private generateFloor() {
    const params = getDungeonParams(this.floor);
    this.dungeon = generateDungeon(params);
    this.visMap = createVisibilityMap(this.dungeon.width, this.dungeon.height);

    if (this.player) {
      this.player.tileX = this.dungeon.playerStart.x;
      this.player.tileY = this.dungeon.playerStart.y;
      this.player.sprite.setPosition(
        this.dungeon.playerStart.x * TILE_SIZE + TILE_SIZE / 2,
        this.dungeon.playerStart.y * TILE_SIZE + TILE_SIZE / 2,
      );
    } else {
      this.player = new Player(this, this.dungeon.playerStart.x, this.dungeon.playerStart.y);
    }

    // Draw stairs
    const stairsX = this.dungeon.stairsDown.x * TILE_SIZE + TILE_SIZE / 2;
    const stairsY = this.dungeon.stairsDown.y * TILE_SIZE + TILE_SIZE / 2;
    if (this.textures.exists('stairs')) {
      this.stairsSprite = this.add
        .image(stairsX, stairsY, 'stairs')
        .setDisplaySize(TILE_SIZE, TILE_SIZE)
        .setDepth(2);
    } else {
      this.stairsSprite = this.add
        .rectangle(stairsX, stairsY, TILE_SIZE - 2, TILE_SIZE - 2, COLORS.STAIRS)
        .setDepth(2);
    }

    this.spawnEnemies();
    this.spawnItems();

    // Camera
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setZoom(2.5);
    this.cameras.main.setBounds(
      0,
      0,
      this.dungeon.width * TILE_SIZE,
      this.dungeon.height * TILE_SIZE,
    );

    this.updateVisibility();
    this.emitUIUpdates();

    this.events.emit('minimap-init', {
      grid: this.dungeon.grid,
      width: this.dungeon.width,
      height: this.dungeon.height,
    });

    this.events.emit('message', `--- Floor ${this.floor} ---`);
  }

  private spawnEnemies() {
    const params = getDungeonParams(this.floor);

    for (let i = 1; i < this.dungeon.rooms.length - 1; i++) {
      const room = this.dungeon.rooms[i];
      const count = randomInt(1, params.maxEnemiesPerRoom);

      for (let j = 0; j < count; j++) {
        const pos = room.getRandomTile();
        if (this.dungeon.grid[pos.y][pos.x] !== TILE_FLOOR) continue;

        const type =
          this.floor < 3 ? randomPick(['slime', 'bat'] as EnemyType[]) : randomPick(ENEMY_TYPES);
        const config = ENEMY_CONFIGS[type](this.floor);
        const enemy = new Enemy(this, pos.x, pos.y, config);
        this.enemies.push(enemy);
      }
    }
  }

  private spawnItems() {
    const params = getDungeonParams(this.floor);

    for (let i = 1; i < this.dungeon.rooms.length; i++) {
      const room = this.dungeon.rooms[i];
      if (Math.random() < 0.6) {
        const count = randomInt(0, params.maxItemsPerRoom);
        for (let j = 0; j < count; j++) {
          const pos = room.getRandomTile();
          if (this.dungeon.grid[pos.y][pos.x] !== TILE_FLOOR) continue;

          const lootType = rollLoot(this.floor);
          if (lootType && ITEM_CONFIGS[lootType]) {
            const worldItem = new WorldItem(this, pos.x, pos.y, ITEM_CONFIGS[lootType]);
            this.items.push(worldItem);
          }
        }
      }
    }
  }

  private updateVisibility() {
    updateFOV(this.dungeon.grid, this.visMap, this.player.tileX, this.player.tileY, FOV_RADIUS);
    this.renderTiles();
    this.updateEntityVisibility();

    this.events.emit('minimap-update', {
      grid: this.dungeon.grid,
      visMap: this.visMap,
      playerX: this.player.tileX,
      playerY: this.player.tileY,
    });
  }

  private renderTiles() {
    this.tileGraphics.clear();

    const cam = this.cameras.main;
    const zoom = cam.zoom;
    const halfW = cam.width / (2 * zoom);
    const halfH = cam.height / (2 * zoom);
    const cx = cam.scrollX + cam.width / (2 * zoom);
    const cy = cam.scrollY + cam.height / (2 * zoom);

    const startX = Math.max(0, Math.floor((cx - halfW) / TILE_SIZE) - 1);
    const endX = Math.min(this.dungeon.width - 1, Math.ceil((cx + halfW) / TILE_SIZE) + 1);
    const startY = Math.max(0, Math.floor((cy - halfH) / TILE_SIZE) - 1);
    const endY = Math.min(this.dungeon.height - 1, Math.ceil((cy + halfH) / TILE_SIZE) + 1);

    for (let y = startY; y <= endY; y++) {
      for (let x = startX; x <= endX; x++) {
        const vis = this.visMap[y][x];
        if (vis === 'hidden') continue;

        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        if (this.dungeon.grid[y][x] === TILE_FLOOR) {
          this.tileGraphics.fillStyle(vis === 'visible' ? COLORS.FLOOR : 0x252540, 1);
        } else {
          this.tileGraphics.fillStyle(vis === 'visible' ? COLORS.WALL : 0x0e1225, 1);
        }
        this.tileGraphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  private updateEntityVisibility() {
    for (const enemy of this.enemies) {
      const vis = this.visMap[enemy.tileY]?.[enemy.tileX];
      enemy.sprite.setVisible(vis === 'visible');
    }

    for (const item of this.items) {
      const vis = this.visMap[item.tileY]?.[item.tileX];
      item.sprite.setVisible(vis === 'visible' || vis === 'seen');
      item.sprite.setAlpha(vis === 'seen' ? 0.4 : 1);
    }

    if (this.stairsSprite) {
      const sVis = this.visMap[this.dungeon.stairsDown.y]?.[this.dungeon.stairsDown.x];
      this.stairsSprite.setVisible(sVis === 'visible' || sVis === 'seen');
      this.stairsSprite.setAlpha(sVis === 'seen' ? 0.4 : 1);
    }
  }

  private emitUIUpdates() {
    this.events.emit('hp-changed', this.player.stats.hp, this.player.stats.maxHp);
    this.events.emit('stats-changed', { level: this.player.level, gold: this.player.gold });
    this.events.emit('inventory-changed', this.player.inventory);
  }

  private gameOver() {
    this.scene.stop('UIScene');
    this.scene.start('GameOverScene', {
      floor: this.floor,
      kills: this.player.kills,
      gold: this.player.gold,
      level: this.player.level,
    });
  }

  private playSound(key: string) {
    try {
      if (this.sound.get(key) || this.cache.audio.exists(key)) {
        this.sound.play(key, { volume: 0.5 });
      }
    } catch {
      // Sound not ready yet, ignore
    }
  }

  private spawnDeathParticles(tileX: number, tileY: number) {
    const px = tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = tileY * TILE_SIZE + TILE_SIZE / 2;

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 30 + Math.random() * 40;

      const particle = this.add.rectangle(px, py, 2, 2, 0xff4444).setDepth(50);

      this.tweens.add({
        targets: particle,
        x: px + Math.cos(angle) * speed,
        y: py + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.5,
        duration: 300 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }
}
