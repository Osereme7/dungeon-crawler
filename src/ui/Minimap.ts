import Phaser from 'phaser';
import { Visibility } from '../systems/FOVSystem';

export class Minimap {
  private graphics: Phaser.GameObjects.Graphics;
  private x: number;
  private y: number;
  private size: number;
  private scale: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    size: number,
    dungeonWidth: number,
    dungeonHeight: number,
  ) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.scale = Math.min(size / dungeonWidth, size / dungeonHeight);

    this.graphics = scene.add.graphics().setDepth(200);
  }

  update(grid: number[][], visMap: Visibility[][], playerX: number, playerY: number): void {
    this.graphics.clear();

    // Background
    this.graphics.fillStyle(0x000000, 0.7);
    this.graphics.fillRect(this.x, this.y, this.size, this.size);

    // Draw explored tiles
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const vis = visMap[y][x];
        if (vis === 'hidden') continue;

        const px = this.x + x * this.scale;
        const py = this.y + y * this.scale;

        if (grid[y][x] === 0) {
          this.graphics.fillStyle(vis === 'visible' ? 0x3d3d5c : 0x222244, 1);
          this.graphics.fillRect(px, py, this.scale, this.scale);
        }
      }
    }

    // Draw player
    const ppx = this.x + playerX * this.scale;
    const ppy = this.y + playerY * this.scale;
    this.graphics.fillStyle(0x00ff88, 1);
    this.graphics.fillRect(ppx - 1, ppy - 1, 3, 3);
  }
}
