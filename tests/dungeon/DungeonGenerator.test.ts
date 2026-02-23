import { describe, it, expect } from 'vitest';
import { generateDungeon, TILE_FLOOR, TILE_WALL } from '../../src/dungeon/DungeonGenerator';
import { DungeonParams } from '../../src/dungeon/DungeonConfig';

const DEFAULT_PARAMS: DungeonParams = {
  width: 50,
  height: 40,
  roomMinSize: 5,
  roomMaxSize: 10,
  maxRooms: 8,
  maxEnemiesPerRoom: 2,
  maxItemsPerRoom: 1,
};

describe('DungeonGenerator', () => {
  it('should generate a dungeon with the correct dimensions', () => {
    const dungeon = generateDungeon(DEFAULT_PARAMS);
    expect(dungeon.width).toBe(50);
    expect(dungeon.height).toBe(40);
    expect(dungeon.grid.length).toBe(40);
    expect(dungeon.grid[0].length).toBe(50);
  });

  it('should generate at least 2 rooms', () => {
    const dungeon = generateDungeon(DEFAULT_PARAMS);
    expect(dungeon.rooms.length).toBeGreaterThanOrEqual(2);
  });

  it('should have rooms within grid bounds', () => {
    const dungeon = generateDungeon(DEFAULT_PARAMS);
    for (const room of dungeon.rooms) {
      expect(room.x).toBeGreaterThanOrEqual(0);
      expect(room.y).toBeGreaterThanOrEqual(0);
      expect(room.right).toBeLessThan(dungeon.width);
      expect(room.bottom).toBeLessThan(dungeon.height);
    }
  });

  it('should place player start in the first room', () => {
    const dungeon = generateDungeon(DEFAULT_PARAMS);
    const firstRoom = dungeon.rooms[0];
    expect(firstRoom.contains(dungeon.playerStart.x, dungeon.playerStart.y)).toBe(true);
  });

  it('should place stairs in the last room', () => {
    const dungeon = generateDungeon(DEFAULT_PARAMS);
    const lastRoom = dungeon.rooms[dungeon.rooms.length - 1];
    expect(lastRoom.contains(dungeon.stairsDown.x, dungeon.stairsDown.y)).toBe(true);
  });

  it('should have floor tiles at player start position', () => {
    const dungeon = generateDungeon(DEFAULT_PARAMS);
    expect(dungeon.grid[dungeon.playerStart.y][dungeon.playerStart.x]).toBe(TILE_FLOOR);
  });

  it('should have walls around the border', () => {
    const dungeon = generateDungeon(DEFAULT_PARAMS);
    // Top and bottom rows should be all walls
    for (let x = 0; x < dungeon.width; x++) {
      expect(dungeon.grid[0][x]).toBe(TILE_WALL);
      expect(dungeon.grid[dungeon.height - 1][x]).toBe(TILE_WALL);
    }
  });

  it('should produce deterministic results with the same seed function', () => {
    let s1 = 42;
    const rngA = () => {
      s1 = (s1 * 16807) % 2147483647;
      return (s1 - 1) / 2147483646;
    };

    let s2 = 42;
    const rngB = () => {
      s2 = (s2 * 16807) % 2147483647;
      return (s2 - 1) / 2147483646;
    };

    const d1 = generateDungeon(DEFAULT_PARAMS, rngA);
    const d2 = generateDungeon(DEFAULT_PARAMS, rngB);
    expect(d1.rooms.length).toBe(d2.rooms.length);
  });
});
