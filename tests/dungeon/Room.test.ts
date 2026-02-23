import { describe, it, expect } from 'vitest';
import { Room } from '../../src/dungeon/Room';

describe('Room', () => {
  it('should calculate center correctly', () => {
    const room = new Room(10, 20, 8, 6);
    expect(room.centerX).toBe(14);
    expect(room.centerY).toBe(23);
  });

  it('should calculate right and bottom edges', () => {
    const room = new Room(5, 5, 10, 8);
    expect(room.right).toBe(14);
    expect(room.bottom).toBe(12);
  });

  it('should detect intersection', () => {
    const room1 = new Room(0, 0, 10, 10);
    const room2 = new Room(8, 8, 10, 10);
    expect(room1.intersects(room2)).toBe(true);
  });

  it('should detect non-intersection', () => {
    const room1 = new Room(0, 0, 5, 5);
    const room2 = new Room(20, 20, 5, 5);
    expect(room1.intersects(room2)).toBe(false);
  });

  it('should detect intersection with padding', () => {
    const room1 = new Room(0, 0, 5, 5);
    const room2 = new Room(5, 0, 5, 5); // adjacent, not overlapping
    expect(room1.intersects(room2, 0)).toBe(false); // not touching
    expect(room1.intersects(room2, 1)).toBe(true); // with padding they overlap
  });

  it('should correctly check contains', () => {
    const room = new Room(5, 5, 10, 10);
    expect(room.contains(5, 5)).toBe(true);
    expect(room.contains(14, 14)).toBe(true);
    expect(room.contains(10, 10)).toBe(true);
    expect(room.contains(4, 5)).toBe(false);
    expect(room.contains(15, 5)).toBe(false);
  });

  it('should generate random tiles within bounds', () => {
    const room = new Room(5, 5, 10, 10);
    for (let i = 0; i < 100; i++) {
      const tile = room.getRandomTile();
      expect(tile.x).toBeGreaterThanOrEqual(room.x + 1);
      expect(tile.x).toBeLessThan(room.x + room.width - 1);
      expect(tile.y).toBeGreaterThanOrEqual(room.y + 1);
      expect(tile.y).toBeLessThan(room.y + room.height - 1);
    }
  });
});
