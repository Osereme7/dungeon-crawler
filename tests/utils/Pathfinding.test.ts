import { describe, it, expect } from 'vitest';
import { findPath } from '../../src/utils/Pathfinding';

describe('Pathfinding', () => {
  // Simple 5x5 grid: 0 = walkable, 1 = wall
  const openGrid = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
  ];

  it('should find a path in an open grid', () => {
    const path = findPath(openGrid, 1, 1, 3, 3);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
    // Should end at target
    expect(path![path!.length - 1]).toEqual({ x: 3, y: 3 });
  });

  it('should find the shortest path', () => {
    const path = findPath(openGrid, 1, 1, 3, 1);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(2); // (2,1) then (3,1)
  });

  it('should return empty array for same start and end', () => {
    const path = findPath(openGrid, 1, 1, 1, 1);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(0);
  });

  it('should return null when path is blocked', () => {
    const blockedGrid = [
      [1, 1, 1, 1, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 0, 1, 0, 1],
      [1, 1, 1, 1, 1],
    ];
    const path = findPath(blockedGrid, 1, 1, 3, 1);
    expect(path).toBeNull();
  });

  it('should return null for out-of-bounds target', () => {
    const path = findPath(openGrid, 1, 1, 10, 10);
    expect(path).toBeNull();
  });

  it('should return null for wall target', () => {
    const path = findPath(openGrid, 1, 1, 0, 0);
    expect(path).toBeNull();
  });

  it('should navigate around obstacles', () => {
    const mazeGrid = [
      [1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1],
    ];
    const path = findPath(mazeGrid, 1, 1, 5, 1);
    expect(path).not.toBeNull();
    // Path must go through row 3 to get around the walls
    const goesThrough3 = path!.some((p) => p.y === 3);
    expect(goesThrough3).toBe(true);
  });
});
