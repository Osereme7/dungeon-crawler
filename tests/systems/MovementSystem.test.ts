import { describe, it, expect } from 'vitest';
import { canMoveTo, getDirection } from '../../src/systems/MovementSystem';
import { TILE_FLOOR, TILE_WALL } from '../../src/dungeon/DungeonGenerator';

function createGrid(width: number, height: number, fill: number): number[][] {
  return Array.from({ length: height }, () => Array(width).fill(fill));
}

describe('MovementSystem', () => {
  describe('canMoveTo', () => {
    it('should allow movement to floor tiles', () => {
      const grid = createGrid(5, 5, TILE_WALL);
      grid[2][2] = TILE_FLOOR;
      expect(canMoveTo(grid, 2, 2)).toBe(true);
    });

    it('should block movement to wall tiles', () => {
      const grid = createGrid(5, 5, TILE_WALL);
      expect(canMoveTo(grid, 2, 2)).toBe(false);
    });

    it('should block movement out of bounds (negative x)', () => {
      const grid = createGrid(5, 5, TILE_FLOOR);
      expect(canMoveTo(grid, -1, 2)).toBe(false);
    });

    it('should block movement out of bounds (negative y)', () => {
      const grid = createGrid(5, 5, TILE_FLOOR);
      expect(canMoveTo(grid, 2, -1)).toBe(false);
    });

    it('should block movement out of bounds (x too large)', () => {
      const grid = createGrid(5, 5, TILE_FLOOR);
      expect(canMoveTo(grid, 5, 2)).toBe(false);
    });

    it('should block movement out of bounds (y too large)', () => {
      const grid = createGrid(5, 5, TILE_FLOOR);
      expect(canMoveTo(grid, 2, 5)).toBe(false);
    });
  });

  describe('getDirection', () => {
    it('should return up for negative dy', () => {
      expect(getDirection(0, -1)).toBe('up');
    });

    it('should return down for positive dy', () => {
      expect(getDirection(0, 1)).toBe('down');
    });

    it('should return left for negative dx', () => {
      expect(getDirection(-1, 0)).toBe('left');
    });

    it('should return right for positive dx', () => {
      expect(getDirection(1, 0)).toBe('right');
    });

    it('should return none for no movement', () => {
      expect(getDirection(0, 0)).toBe('none');
    });
  });
});
