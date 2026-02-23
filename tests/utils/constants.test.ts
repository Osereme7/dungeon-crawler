import { describe, it, expect } from 'vitest';
import { TILE_SIZE, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../../src/constants';

describe('Game Constants', () => {
  it('should have a valid tile size', () => {
    expect(TILE_SIZE).toBe(16);
    expect(TILE_SIZE).toBeGreaterThan(0);
  });

  it('should have valid game dimensions', () => {
    expect(GAME_WIDTH).toBe(800);
    expect(GAME_HEIGHT).toBe(600);
    expect(GAME_WIDTH % TILE_SIZE).toBe(0);
  });

  it('should have color definitions', () => {
    expect(COLORS.PLAYER).toBeDefined();
    expect(COLORS.ENEMY).toBeDefined();
    expect(COLORS.FLOOR).toBeDefined();
    expect(COLORS.WALL).toBeDefined();
  });
});
