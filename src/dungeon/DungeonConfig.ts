export interface DungeonParams {
  width: number;
  height: number;
  roomMinSize: number;
  roomMaxSize: number;
  maxRooms: number;
  maxEnemiesPerRoom: number;
  maxItemsPerRoom: number;
}

export function getDungeonParams(floor: number): DungeonParams {
  return {
    width: 50 + Math.min(floor * 3, 30),
    height: 40 + Math.min(floor * 2, 20),
    roomMinSize: 5,
    roomMaxSize: 12,
    maxRooms: 8 + Math.min(floor * 2, 12),
    maxEnemiesPerRoom: 1 + Math.floor(floor / 2),
    maxItemsPerRoom: Math.max(1, 3 - Math.floor(floor / 3)),
  };
}
