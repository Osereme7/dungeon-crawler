import { describe, it, expect } from 'vitest';
import { getDungeonParams } from '../../src/dungeon/DungeonConfig';

describe('DungeonConfig', () => {
  it('should return valid params for floor 1', () => {
    const params = getDungeonParams(1);
    expect(params.width).toBe(53);
    expect(params.height).toBe(42);
    expect(params.maxRooms).toBe(10);
    expect(params.roomMinSize).toBe(5);
    expect(params.roomMaxSize).toBe(12);
  });

  it('should scale dungeon size with floor', () => {
    const floor1 = getDungeonParams(1);
    const floor5 = getDungeonParams(5);
    expect(floor5.width).toBeGreaterThan(floor1.width);
    expect(floor5.height).toBeGreaterThan(floor1.height);
    expect(floor5.maxRooms).toBeGreaterThan(floor1.maxRooms);
  });

  it('should cap dungeon size at high floors', () => {
    const floor50 = getDungeonParams(50);
    expect(floor50.width).toBe(80); // 50 + min(150, 30) = 80
    expect(floor50.height).toBe(60); // 40 + min(100, 20) = 60
    expect(floor50.maxRooms).toBe(20); // 8 + min(100, 12) = 20
  });

  it('should scale enemies per room with floor', () => {
    const floor1 = getDungeonParams(1);
    const floor6 = getDungeonParams(6);
    expect(floor6.maxEnemiesPerRoom).toBeGreaterThan(floor1.maxEnemiesPerRoom);
  });

  it('should reduce items per room on higher floors', () => {
    const floor1 = getDungeonParams(1);
    const floor10 = getDungeonParams(10);
    expect(floor10.maxItemsPerRoom).toBeLessThanOrEqual(floor1.maxItemsPerRoom);
  });
});
