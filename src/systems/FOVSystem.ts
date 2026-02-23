import { TILE_WALL } from '../dungeon/DungeonGenerator';

export type Visibility = 'hidden' | 'seen' | 'visible';

export function createVisibilityMap(width: number, height: number): Visibility[][] {
  return Array.from({ length: height }, () => Array.from({ length: width }, () => 'hidden'));
}

export function updateFOV(
  grid: number[][],
  visMap: Visibility[][],
  playerX: number,
  playerY: number,
  radius: number,
): void {
  const height = grid.length;
  const width = grid[0].length;

  // Mark all currently visible as just seen
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visMap[y][x] === 'visible') {
        visMap[y][x] = 'seen';
      }
    }
  }

  // Simple raycasting FOV
  const steps = 360;
  for (let i = 0; i < steps; i++) {
    const angle = (i * Math.PI * 2) / steps;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);

    let cx = playerX + 0.5;
    let cy = playerY + 0.5;

    for (let step = 0; step < radius; step++) {
      const tileX = Math.floor(cx);
      const tileY = Math.floor(cy);

      if (tileX < 0 || tileX >= width || tileY < 0 || tileY >= height) break;

      visMap[tileY][tileX] = 'visible';

      if (grid[tileY][tileX] === TILE_WALL) break;

      cx += dx * 0.5;
      cy += dy * 0.5;
    }
  }
}

export function isVisible(visMap: Visibility[][], x: number, y: number): boolean {
  if (y < 0 || y >= visMap.length || x < 0 || x >= visMap[0].length) return false;
  return visMap[y][x] === 'visible';
}

export function wasSeen(visMap: Visibility[][], x: number, y: number): boolean {
  if (y < 0 || y >= visMap.length || x < 0 || x >= visMap[0].length) return false;
  return visMap[y][x] === 'seen' || visMap[y][x] === 'visible';
}
