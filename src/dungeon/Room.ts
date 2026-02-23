export interface RoomBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Room {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get centerX(): number {
    return Math.floor(this.x + this.width / 2);
  }

  get centerY(): number {
    return Math.floor(this.y + this.height / 2);
  }

  get right(): number {
    return this.x + this.width - 1;
  }

  get bottom(): number {
    return this.y + this.height - 1;
  }

  intersects(other: Room, padding = 1): boolean {
    return (
      this.x - padding < other.x + other.width &&
      this.x + this.width + padding > other.x &&
      this.y - padding < other.y + other.height &&
      this.y + this.height + padding > other.y
    );
  }

  contains(tileX: number, tileY: number): boolean {
    return tileX >= this.x && tileX <= this.right && tileY >= this.y && tileY <= this.bottom;
  }

  getRandomTile(randomFn: () => number = Math.random): { x: number; y: number } {
    const x = this.x + 1 + Math.floor(randomFn() * (this.width - 2));
    const y = this.y + 1 + Math.floor(randomFn() * (this.height - 2));
    return { x, y };
  }
}
