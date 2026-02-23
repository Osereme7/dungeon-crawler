// A* pathfinding on a 2D grid

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

function heuristic(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

const DIRECTIONS = [
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
];

export function findPath(
  grid: number[][],
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  maxSteps = 200,
): { x: number; y: number }[] | null {
  if (startX === endX && startY === endY) return [];

  const height = grid.length;
  const width = grid[0].length;

  if (
    startX < 0 ||
    startX >= width ||
    startY < 0 ||
    startY >= height ||
    endX < 0 ||
    endX >= width ||
    endY < 0 ||
    endY >= height
  ) {
    return null;
  }

  if (grid[endY][endX] !== 0) return null;

  const openSet: Node[] = [];
  const closedSet = new Set<string>();

  const startNode: Node = {
    x: startX,
    y: startY,
    g: 0,
    h: heuristic(startX, startY, endX, endY),
    f: heuristic(startX, startY, endX, endY),
    parent: null,
  };

  openSet.push(startNode);
  let steps = 0;

  while (openSet.length > 0 && steps < maxSteps) {
    steps++;

    // Find node with lowest f score
    let lowestIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIdx].f) {
        lowestIdx = i;
      }
    }
    const current = openSet[lowestIdx];

    if (current.x === endX && current.y === endY) {
      // Reconstruct path
      const path: { x: number; y: number }[] = [];
      let node: Node | null = current;
      while (node && node.parent) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    openSet.splice(lowestIdx, 1);
    const key = `${current.x},${current.y}`;
    closedSet.add(key);

    for (const dir of DIRECTIONS) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      const nKey = `${nx},${ny}`;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
      if (grid[ny][nx] !== 0) continue;
      if (closedSet.has(nKey)) continue;

      const g = current.g + 1;
      const h = heuristic(nx, ny, endX, endY);
      const f = g + h;

      const existing = openSet.find((n) => n.x === nx && n.y === ny);
      if (existing) {
        if (g < existing.g) {
          existing.g = g;
          existing.f = f;
          existing.parent = current;
        }
      } else {
        openSet.push({ x: nx, y: ny, g, h, f, parent: current });
      }
    }
  }

  return null;
}
