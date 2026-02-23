import { describe, it, expect } from 'vitest';
import { createVisibilityMap, updateFOV, isVisible, wasSeen } from '../../src/systems/FOVSystem';

describe('FOVSystem', () => {
  // Simple 10x10 grid: walls around border, floor inside
  function makeGrid(): number[][] {
    const grid: number[][] = [];
    for (let y = 0; y < 10; y++) {
      grid[y] = [];
      for (let x = 0; x < 10; x++) {
        grid[y][x] = x === 0 || x === 9 || y === 0 || y === 9 ? 1 : 0;
      }
    }
    return grid;
  }

  it('should create a visibility map of correct size', () => {
    const visMap = createVisibilityMap(10, 10);
    expect(visMap.length).toBe(10);
    expect(visMap[0].length).toBe(10);
    expect(visMap[5][5]).toBe('hidden');
  });

  it('should mark player position as visible', () => {
    const grid = makeGrid();
    const visMap = createVisibilityMap(10, 10);
    updateFOV(grid, visMap, 5, 5, 6);
    expect(isVisible(visMap, 5, 5)).toBe(true);
  });

  it('should mark nearby open tiles as visible', () => {
    const grid = makeGrid();
    const visMap = createVisibilityMap(10, 10);
    updateFOV(grid, visMap, 5, 5, 6);
    expect(isVisible(visMap, 4, 5)).toBe(true);
    expect(isVisible(visMap, 6, 5)).toBe(true);
  });

  it('should mark previously visible tiles as seen after moving', () => {
    const grid = makeGrid();
    const visMap = createVisibilityMap(10, 10);

    // First update at (3, 3)
    updateFOV(grid, visMap, 3, 3, 4);
    expect(isVisible(visMap, 3, 3)).toBe(true);

    // Move to (7, 7), original position should now be "seen"
    updateFOV(grid, visMap, 7, 7, 4);
    expect(wasSeen(visMap, 3, 3)).toBe(true);
  });

  it('should not mark tiles beyond walls as visible', () => {
    // Grid with a wall in the middle
    const grid = makeGrid();
    grid[5][5] = 1; // wall in center

    const visMap = createVisibilityMap(10, 10);
    updateFOV(grid, visMap, 3, 5, 4);

    // The wall itself should be visible (we see it)
    expect(isVisible(visMap, 5, 5)).toBe(true);
    // But tiles behind the wall might not be (depending on angle)
    // At least some tiles beyond should be hidden
    expect(isVisible(visMap, 7, 5)).toBe(false);
  });

  it('should handle out-of-bounds gracefully', () => {
    const visMap = createVisibilityMap(10, 10);
    expect(isVisible(visMap, -1, 0)).toBe(false);
    expect(isVisible(visMap, 0, -1)).toBe(false);
    expect(isVisible(visMap, 10, 0)).toBe(false);
    expect(wasSeen(visMap, -1, -1)).toBe(false);
  });
});
