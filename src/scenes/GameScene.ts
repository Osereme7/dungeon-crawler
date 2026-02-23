import Phaser from 'phaser';
import { TILE_SIZE, GAME_WIDTH, COLORS } from '../constants';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private walls: Phaser.GameObjects.Rectangle[] = [];
  private floors: Phaser.GameObjects.Rectangle[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private isMoving = false;
  private dungeonWidth = 40;
  private dungeonHeight = 30;
  private grid: number[][] = [];
  private playerTileX = 0;
  private playerTileY = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Generate a simple dungeon
    this.generateDungeon();
    this.renderDungeon();

    // Create player at starting position
    const startRoom = this.findOpenTile();
    this.playerTileX = startRoom.x;
    this.playerTileY = startRoom.y;

    this.player = this.add.rectangle(
      this.playerTileX * TILE_SIZE + TILE_SIZE / 2,
      this.playerTileY * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE - 2,
      TILE_SIZE - 2,
      COLORS.PLAYER,
    );

    // Camera follows player
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(
      0,
      0,
      this.dungeonWidth * TILE_SIZE,
      this.dungeonHeight * TILE_SIZE,
    );

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as Record<string, Phaser.Input.Keyboard.Key>;

    // Floor indicator
    this.add
      .text(GAME_WIDTH / 2, 16, 'Floor 1 - Use WASD to explore', {
        fontSize: '12px',
        color: COLORS.UI_TEXT,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(100);
  }

  update() {
    if (this.isMoving) return;

    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) dx = -1;
    else if (this.cursors.right.isDown || this.wasd.right.isDown) dx = 1;
    else if (this.cursors.up.isDown || this.wasd.up.isDown) dy = -1;
    else if (this.cursors.down.isDown || this.wasd.down.isDown) dy = 1;

    if (dx === 0 && dy === 0) return;

    const newX = this.playerTileX + dx;
    const newY = this.playerTileY + dy;

    // Check bounds and walls
    if (
      newX < 0 ||
      newX >= this.dungeonWidth ||
      newY < 0 ||
      newY >= this.dungeonHeight ||
      this.grid[newY][newX] === 1
    ) {
      return;
    }

    // Move player
    this.isMoving = true;
    this.playerTileX = newX;
    this.playerTileY = newY;

    this.tweens.add({
      targets: this.player,
      x: newX * TILE_SIZE + TILE_SIZE / 2,
      y: newY * TILE_SIZE + TILE_SIZE / 2,
      duration: 100,
      ease: 'Power2',
      onComplete: () => {
        this.isMoving = false;
      },
    });
  }

  private generateDungeon() {
    // Initialize grid with walls (1 = wall, 0 = floor)
    this.grid = Array.from({ length: this.dungeonHeight }, () =>
      Array.from({ length: this.dungeonWidth }, () => 1),
    );

    // Simple BSP-like room generation
    const rooms: { x: number; y: number; w: number; h: number }[] = [];
    const numRooms = 8;

    for (let i = 0; i < numRooms; i++) {
      const w = Phaser.Math.Between(5, 10);
      const h = Phaser.Math.Between(4, 8);
      const x = Phaser.Math.Between(1, this.dungeonWidth - w - 1);
      const y = Phaser.Math.Between(1, this.dungeonHeight - h - 1);

      // Check overlap
      let overlaps = false;
      for (const room of rooms) {
        if (
          x < room.x + room.w + 1 &&
          x + w + 1 > room.x &&
          y < room.y + room.h + 1 &&
          y + h + 1 > room.y
        ) {
          overlaps = true;
          break;
        }
      }
      if (overlaps) continue;

      // Carve room
      for (let ry = y; ry < y + h; ry++) {
        for (let rx = x; rx < x + w; rx++) {
          this.grid[ry][rx] = 0;
        }
      }
      rooms.push({ x, y, w, h });
    }

    // Connect rooms with corridors
    for (let i = 1; i < rooms.length; i++) {
      const prev = rooms[i - 1];
      const curr = rooms[i];
      const prevCenterX = Math.floor(prev.x + prev.w / 2);
      const prevCenterY = Math.floor(prev.y + prev.h / 2);
      const currCenterX = Math.floor(curr.x + curr.w / 2);
      const currCenterY = Math.floor(curr.y + curr.h / 2);

      // Horizontal corridor then vertical
      const startX = Math.min(prevCenterX, currCenterX);
      const endX = Math.max(prevCenterX, currCenterX);
      for (let x = startX; x <= endX; x++) {
        this.grid[prevCenterY][x] = 0;
      }

      const startY = Math.min(prevCenterY, currCenterY);
      const endY = Math.max(prevCenterY, currCenterY);
      for (let y = startY; y <= endY; y++) {
        this.grid[y][currCenterX] = 0;
      }
    }
  }

  private renderDungeon() {
    for (let y = 0; y < this.dungeonHeight; y++) {
      for (let x = 0; x < this.dungeonWidth; x++) {
        const posX = x * TILE_SIZE + TILE_SIZE / 2;
        const posY = y * TILE_SIZE + TILE_SIZE / 2;

        if (this.grid[y][x] === 1) {
          const wall = this.add.rectangle(posX, posY, TILE_SIZE, TILE_SIZE, COLORS.WALL);
          this.walls.push(wall);
        } else {
          const floor = this.add.rectangle(posX, posY, TILE_SIZE, TILE_SIZE, COLORS.FLOOR);
          this.floors.push(floor);
        }
      }
    }
  }

  private findOpenTile(): { x: number; y: number } {
    for (let y = 0; y < this.dungeonHeight; y++) {
      for (let x = 0; x < this.dungeonWidth; x++) {
        if (this.grid[y][x] === 0) {
          return { x, y };
        }
      }
    }
    return { x: 1, y: 1 };
  }
}
