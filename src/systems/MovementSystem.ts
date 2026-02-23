import { TILE_FLOOR } from '../dungeon/DungeonGenerator';

export interface Position {
  x: number;
  y: number;
}

export function canMoveTo(grid: number[][], x: number, y: number): boolean {
  if (y < 0 || y >= grid.length || x < 0 || x >= grid[0].length) {
    return false;
  }
  return grid[y][x] === TILE_FLOOR;
}

export function getDirection(dx: number, dy: number): 'up' | 'down' | 'left' | 'right' | 'none' {
  if (dy < 0) return 'up';
  if (dy > 0) return 'down';
  if (dx < 0) return 'left';
  if (dx > 0) return 'right';
  return 'none';
}
