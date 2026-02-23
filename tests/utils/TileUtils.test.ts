import { describe, it, expect } from 'vitest';
import { tileToPixel, pixelToTile, manhattanDistance } from '../../src/utils/TileUtils';
import { TILE_SIZE } from '../../src/constants';

describe('TileUtils', () => {
  describe('tileToPixel', () => {
    it('should convert tile (0,0) to center of first tile', () => {
      const result = tileToPixel(0, 0);
      expect(result.x).toBe(TILE_SIZE / 2);
      expect(result.y).toBe(TILE_SIZE / 2);
    });

    it('should convert tile position to pixel center', () => {
      const result = tileToPixel(3, 5);
      expect(result.x).toBe(3 * TILE_SIZE + TILE_SIZE / 2);
      expect(result.y).toBe(5 * TILE_SIZE + TILE_SIZE / 2);
    });
  });

  describe('pixelToTile', () => {
    it('should convert pixel at tile center back to tile coords', () => {
      const result = pixelToTile(TILE_SIZE / 2, TILE_SIZE / 2);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should floor pixel coordinates to tile', () => {
      const result = pixelToTile(TILE_SIZE * 3 + 5, TILE_SIZE * 7 + 10);
      expect(result.x).toBe(3);
      expect(result.y).toBe(7);
    });

    it('should be the inverse of tileToPixel', () => {
      const pixel = tileToPixel(4, 6);
      const tile = pixelToTile(pixel.x, pixel.y);
      expect(tile.x).toBe(4);
      expect(tile.y).toBe(6);
    });
  });

  describe('manhattanDistance', () => {
    it('should return 0 for same point', () => {
      expect(manhattanDistance(3, 4, 3, 4)).toBe(0);
    });

    it('should return correct horizontal distance', () => {
      expect(manhattanDistance(0, 0, 5, 0)).toBe(5);
    });

    it('should return correct vertical distance', () => {
      expect(manhattanDistance(0, 0, 0, 7)).toBe(7);
    });

    it('should return sum of horizontal and vertical distance', () => {
      expect(manhattanDistance(1, 2, 4, 6)).toBe(7);
    });

    it('should handle negative coordinates', () => {
      expect(manhattanDistance(-2, -3, 2, 3)).toBe(10);
    });
  });
});
