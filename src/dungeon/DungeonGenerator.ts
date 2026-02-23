import { Room } from './Room';
import { DungeonParams } from './DungeonConfig';

export const TILE_WALL = 1;
export const TILE_FLOOR = 0;

export interface DungeonData {
  grid: number[][];
  rooms: Room[];
  width: number;
  height: number;
  stairsDown: { x: number; y: number };
  playerStart: { x: number; y: number };
}

export function generateDungeon(
  params: DungeonParams,
  randomFn: () => number = Math.random,
): DungeonData {
  const { width, height, roomMinSize, roomMaxSize, maxRooms } = params;

  // Initialize grid with walls
  const grid: number[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => TILE_WALL),
  );

  const rooms: Room[] = [];

  for (let attempt = 0; attempt < maxRooms * 10 && rooms.length < maxRooms; attempt++) {
    const w = roomMinSize + Math.floor(randomFn() * (roomMaxSize - roomMinSize + 1));
    const h = roomMinSize + Math.floor(randomFn() * (roomMaxSize - roomMinSize + 1));
    const x = 1 + Math.floor(randomFn() * (width - w - 2));
    const y = 1 + Math.floor(randomFn() * (height - h - 2));

    const newRoom = new Room(x, y, w, h);

    // Check overlap with existing rooms
    let overlaps = false;
    for (const existing of rooms) {
      if (newRoom.intersects(existing, 2)) {
        overlaps = true;
        break;
      }
    }
    if (overlaps) continue;

    // Carve room into grid
    carveRoom(grid, newRoom);
    rooms.push(newRoom);
  }

  // Connect rooms with corridors
  for (let i = 1; i < rooms.length; i++) {
    const prev = rooms[i - 1];
    const curr = rooms[i];

    if (randomFn() < 0.5) {
      carveHorizontalCorridor(grid, prev.centerX, curr.centerX, prev.centerY);
      carveVerticalCorridor(grid, prev.centerY, curr.centerY, curr.centerX);
    } else {
      carveVerticalCorridor(grid, prev.centerY, curr.centerY, prev.centerX);
      carveHorizontalCorridor(grid, prev.centerX, curr.centerX, curr.centerY);
    }
  }

  // Player starts in the first room
  const playerStart = { x: rooms[0].centerX, y: rooms[0].centerY };

  // Stairs in the last room
  const lastRoom = rooms[rooms.length - 1];
  const stairsDown = { x: lastRoom.centerX, y: lastRoom.centerY };

  return { grid, rooms, width, height, stairsDown, playerStart };
}

function carveRoom(grid: number[][], room: Room): void {
  for (let y = room.y; y < room.y + room.height; y++) {
    for (let x = room.x; x < room.x + room.width; x++) {
      if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
        grid[y][x] = TILE_FLOOR;
      }
    }
  }
}

function carveHorizontalCorridor(grid: number[][], x1: number, x2: number, y: number): void {
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);
  for (let x = startX; x <= endX; x++) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      grid[y][x] = TILE_FLOOR;
    }
  }
}

function carveVerticalCorridor(grid: number[][], y1: number, y2: number, x: number): void {
  const startY = Math.min(y1, y2);
  const endY = Math.max(y1, y2);
  for (let y = startY; y <= endY; y++) {
    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
      grid[y][x] = TILE_FLOOR;
    }
  }
}
