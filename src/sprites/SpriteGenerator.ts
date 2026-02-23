import Phaser from 'phaser';
import { TILE_SIZE } from '../constants';

const T = TILE_SIZE; // 16

export function generateAllSprites(scene: Phaser.Scene): void {
  generateTileset(scene);
  generatePlayerSprite(scene);
  generateEnemySprites(scene);
  generateItemSprites(scene);
  generateStairsSprite(scene);
  generateParticle(scene);
}

function generateTileset(scene: Phaser.Scene): void {
  const canvas = document.createElement('canvas');
  canvas.width = T * 4;
  canvas.height = T * 4;
  const ctx = canvas.getContext('2d')!;

  // Tile 0: Floor (dark stone)
  drawFloor(ctx, 0, 0);
  // Tile 1: Floor variant
  drawFloor(ctx, T, 0);
  drawPixel(ctx, T + 7, 6, '#4a4a6a');
  drawPixel(ctx, T + 3, 11, '#4a4a6a');
  // Tile 2: Wall top
  drawWallTop(ctx, T * 2, 0);
  // Tile 3: Wall face
  drawWallFace(ctx, T * 3, 0);

  scene.textures.addCanvas('tileset', canvas);
}

function drawFloor(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#3d3d5c';
  ctx.fillRect(x, y, T, T);
  // Stone texture
  ctx.fillStyle = '#353550';
  ctx.fillRect(x, y, T, 1);
  ctx.fillRect(x, y + 8, T, 1);
  ctx.fillRect(x + 8, y, 1, T);
  // Subtle highlights
  ctx.fillStyle = '#454566';
  drawPixel(ctx, x + 4, y + 3, '#454566');
  drawPixel(ctx, x + 12, y + 10, '#454566');
}

function drawWallTop(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#16213e';
  ctx.fillRect(x, y, T, T);
  // Brick pattern
  ctx.fillStyle = '#1a2848';
  ctx.fillRect(x + 1, y + 1, 6, 6);
  ctx.fillRect(x + 9, y + 1, 6, 6);
  ctx.fillRect(x + 5, y + 9, 6, 6);
  ctx.fillRect(x + 13, y + 9, 2, 6);
  ctx.fillRect(x, y + 9, 3, 6);
  // Mortar highlights
  ctx.fillStyle = '#0e1830';
  ctx.fillRect(x, y + 7, T, 1);
  ctx.fillRect(x + 8, y, 1, 8);
  ctx.fillRect(x + 4, y + 8, 1, 8);
  ctx.fillRect(x + 12, y + 8, 1, 8);
}

function drawWallFace(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#0f1a33';
  ctx.fillRect(x, y, T, T);
  ctx.fillStyle = '#141f3a';
  ctx.fillRect(x + 1, y + 1, 6, 14);
  ctx.fillRect(x + 9, y + 1, 6, 14);
  // Shadow at bottom
  ctx.fillStyle = '#0a1228';
  ctx.fillRect(x, y + 14, T, 2);
}

function generatePlayerSprite(scene: Phaser.Scene): void {
  const frames = 4; // idle anim frames
  const canvas = document.createElement('canvas');
  canvas.width = T * frames;
  canvas.height = T * 4; // 4 directions
  const ctx = canvas.getContext('2d')!;

  const directions = [
    { row: 0 }, // down
    { row: 1 }, // left
    { row: 2 }, // right
    { row: 3 }, // up
  ];

  for (const dir of directions) {
    for (let f = 0; f < frames; f++) {
      const x = f * T;
      const y = dir.row * T;
      const bob = f % 2 === 0 ? 0 : -1;
      drawPlayer(ctx, x, y + bob);
    }
  }

  scene.textures.addCanvas('player-sheet', canvas);
  // Create spritesheet frames
  const tex = scene.textures.get('player-sheet');
  tex.add('idle-0', 0, 0, 0, T, T);
  tex.add('idle-1', 0, T, 0, T, T);
  tex.add('idle-2', 0, T * 2, 0, T, T);
  tex.add('idle-3', 0, T * 3, 0, T, T);
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Body (green cloak)
  ctx.fillStyle = '#00cc66';
  ctx.fillRect(x + 4, y + 5, 8, 7);
  // Head
  ctx.fillStyle = '#ffcc88';
  ctx.fillRect(x + 5, y + 2, 6, 4);
  // Eyes
  ctx.fillStyle = '#222222';
  drawPixel(ctx, x + 6, y + 3, '#222222');
  drawPixel(ctx, x + 9, y + 3, '#222222');
  // Hair
  ctx.fillStyle = '#884422';
  ctx.fillRect(x + 5, y + 1, 6, 2);
  drawPixel(ctx, x + 4, y + 2, '#884422');
  drawPixel(ctx, x + 10, y + 2, '#884422');
  // Boots
  ctx.fillStyle = '#663300';
  ctx.fillRect(x + 4, y + 12, 3, 2);
  ctx.fillRect(x + 9, y + 12, 3, 2);
  // Sword
  ctx.fillStyle = '#ccccdd';
  ctx.fillRect(x + 13, y + 4, 1, 6);
  ctx.fillStyle = '#ffd700';
  drawPixel(ctx, x + 13, y + 10, '#aa8833');
  drawPixel(ctx, x + 12, y + 10, '#aa8833');
  drawPixel(ctx, x + 14, y + 10, '#aa8833');
}

function generateEnemySprites(scene: Phaser.Scene): void {
  // Slime
  const slimeCanvas = document.createElement('canvas');
  slimeCanvas.width = T * 2;
  slimeCanvas.height = T;
  const slimeCtx = slimeCanvas.getContext('2d')!;
  drawSlime(slimeCtx, 0, 0, 0);
  drawSlime(slimeCtx, T, 0, 1);
  scene.textures.addCanvas('enemy-slime', slimeCanvas);

  // Bat
  const batCanvas = document.createElement('canvas');
  batCanvas.width = T * 2;
  batCanvas.height = T;
  const batCtx = batCanvas.getContext('2d')!;
  drawBat(batCtx, 0, 0, 0);
  drawBat(batCtx, T, 0, 1);
  scene.textures.addCanvas('enemy-bat', batCanvas);

  // Skeleton
  const skelCanvas = document.createElement('canvas');
  skelCanvas.width = T * 2;
  skelCanvas.height = T;
  const skelCtx = skelCanvas.getContext('2d')!;
  drawSkeleton(skelCtx, 0, 0, 0);
  drawSkeleton(skelCtx, T, 0, 1);
  scene.textures.addCanvas('enemy-skeleton', skelCanvas);
}

function drawSlime(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number): void {
  const squish = frame === 1 ? 1 : 0;
  // Body
  ctx.fillStyle = '#44ff44';
  ctx.fillRect(x + 3, y + 6 + squish, 10, 8 - squish);
  ctx.fillRect(x + 5, y + 5 + squish, 6, 1);
  // Highlight
  ctx.fillStyle = '#88ff88';
  ctx.fillRect(x + 4, y + 7 + squish, 2, 2);
  // Eyes
  ctx.fillStyle = '#000000';
  drawPixel(ctx, x + 5, y + 8 + squish, '#000000');
  drawPixel(ctx, x + 9, y + 8 + squish, '#000000');
  // Mouth
  drawPixel(ctx, x + 7, y + 10 + squish, '#228822');
  // Shadow
  ctx.fillStyle = '#22aa22';
  ctx.fillRect(x + 3, y + 13, 10, 1);
}

function drawBat(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number): void {
  const wingUp = frame === 0;
  // Body
  ctx.fillStyle = '#9944cc';
  ctx.fillRect(x + 6, y + 6, 4, 5);
  // Wings
  ctx.fillStyle = '#7733aa';
  if (wingUp) {
    ctx.fillRect(x + 1, y + 4, 5, 3);
    ctx.fillRect(x + 10, y + 4, 5, 3);
    drawPixel(ctx, x + 1, y + 3, '#7733aa');
    drawPixel(ctx, x + 14, y + 3, '#7733aa');
  } else {
    ctx.fillRect(x + 1, y + 8, 5, 3);
    ctx.fillRect(x + 10, y + 8, 5, 3);
  }
  // Eyes
  ctx.fillStyle = '#ff0000';
  drawPixel(ctx, x + 6, y + 7, '#ff0000');
  drawPixel(ctx, x + 9, y + 7, '#ff0000');
  // Fangs
  ctx.fillStyle = '#ffffff';
  drawPixel(ctx, x + 7, y + 10, '#ffffff');
  drawPixel(ctx, x + 8, y + 10, '#ffffff');
}

function drawSkeleton(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number): void {
  const step = frame === 1 ? 1 : 0;
  // Skull
  ctx.fillStyle = '#ddddcc';
  ctx.fillRect(x + 5, y + 1, 6, 5);
  // Eye sockets
  ctx.fillStyle = '#111111';
  ctx.fillRect(x + 6, y + 2, 2, 2);
  ctx.fillRect(x + 9, y + 2, 2, 2);
  // Eye glow
  ctx.fillStyle = '#ff4444';
  drawPixel(ctx, x + 6, y + 3, '#ff4444');
  drawPixel(ctx, x + 9, y + 3, '#ff4444');
  // Jaw
  ctx.fillStyle = '#ccccbb';
  ctx.fillRect(x + 6, y + 5, 4, 1);
  // Spine
  ctx.fillStyle = '#bbbbaa';
  ctx.fillRect(x + 7, y + 6, 2, 3);
  // Ribs
  ctx.fillStyle = '#ccccbb';
  ctx.fillRect(x + 4, y + 7, 8, 1);
  ctx.fillRect(x + 5, y + 9, 6, 1);
  // Legs
  ctx.fillRect(x + 5 - step, y + 10, 2, 4);
  ctx.fillRect(x + 9 + step, y + 10, 2, 4);
  // Sword
  ctx.fillStyle = '#888899';
  ctx.fillRect(x + 13, y + 3, 1, 7);
  ctx.fillStyle = '#666677';
  drawPixel(ctx, x + 12, y + 9, '#666677');
  drawPixel(ctx, x + 14, y + 9, '#666677');
}

function generateItemSprites(scene: Phaser.Scene): void {
  const items: [string, (ctx: CanvasRenderingContext2D, x: number, y: number) => void][] = [
    ['item-health-potion', drawHealthPotion],
    ['item-weapon-rusty', drawRustySword],
    ['item-weapon-iron', drawIronSword],
    ['item-weapon-fire', drawFireBlade],
    ['item-gold', drawGold],
    ['item-gem', drawGem],
  ];

  for (const [name, drawFn] of items) {
    const canvas = document.createElement('canvas');
    canvas.width = T;
    canvas.height = T;
    const ctx = canvas.getContext('2d')!;
    drawFn(ctx, 0, 0);
    scene.textures.addCanvas(name, canvas);
  }
}

function drawHealthPotion(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  // Bottle
  ctx.fillStyle = '#553333';
  ctx.fillRect(x + 6, y + 3, 4, 2);
  ctx.fillStyle = '#ff3344';
  ctx.fillRect(x + 5, y + 5, 6, 7);
  ctx.fillStyle = '#ff6677';
  ctx.fillRect(x + 6, y + 6, 2, 3);
  // Cork
  ctx.fillStyle = '#aa8855';
  ctx.fillRect(x + 6, y + 2, 4, 2);
  // Shine
  drawPixel(ctx, x + 6, y + 6, '#ffaaaa');
}

function drawRustySword(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#aa7744';
  ctx.fillRect(x + 7, y + 2, 2, 8);
  ctx.fillStyle = '#886633';
  ctx.fillRect(x + 5, y + 10, 6, 2);
  ctx.fillStyle = '#664422';
  ctx.fillRect(x + 7, y + 12, 2, 2);
}

function drawIronSword(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#ccccdd';
  ctx.fillRect(x + 7, y + 1, 2, 9);
  ctx.fillStyle = '#aaaacc';
  drawPixel(ctx, x + 7, y + 1, '#eeeeff');
  ctx.fillStyle = '#8888aa';
  ctx.fillRect(x + 4, y + 10, 8, 1);
  ctx.fillStyle = '#553322';
  ctx.fillRect(x + 7, y + 11, 2, 3);
}

function drawFireBlade(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#ff6600';
  ctx.fillRect(x + 7, y + 1, 2, 9);
  ctx.fillStyle = '#ffaa00';
  drawPixel(ctx, x + 7, y + 1, '#ffcc00');
  drawPixel(ctx, x + 8, y + 2, '#ffcc00');
  drawPixel(ctx, x + 6, y + 3, '#ff4400');
  drawPixel(ctx, x + 9, y + 5, '#ff4400');
  ctx.fillStyle = '#ff2200';
  ctx.fillRect(x + 4, y + 10, 8, 1);
  ctx.fillStyle = '#442200';
  ctx.fillRect(x + 7, y + 11, 2, 3);
}

function drawGold(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(x + 4, y + 6, 8, 6);
  ctx.fillStyle = '#ffee44';
  ctx.fillRect(x + 5, y + 7, 3, 2);
  ctx.fillStyle = '#ccaa00';
  ctx.fillRect(x + 4, y + 11, 8, 1);
  // Coin circle
  ctx.fillStyle = '#ffcc00';
  ctx.fillRect(x + 6, y + 4, 4, 2);
}

function drawGem(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = '#44ddff';
  ctx.fillRect(x + 6, y + 4, 4, 8);
  ctx.fillRect(x + 5, y + 5, 6, 6);
  ctx.fillRect(x + 4, y + 7, 8, 2);
  ctx.fillStyle = '#88eeff';
  drawPixel(ctx, x + 6, y + 5, '#aaffff');
  drawPixel(ctx, x + 7, y + 6, '#aaffff');
  ctx.fillStyle = '#22aacc';
  ctx.fillRect(x + 6, y + 10, 4, 2);
}

function generateStairsSprite(scene: Phaser.Scene): void {
  const canvas = document.createElement('canvas');
  canvas.width = T;
  canvas.height = T;
  const ctx = canvas.getContext('2d')!;

  // Dark opening
  ctx.fillStyle = '#0a0a18';
  ctx.fillRect(0, 0, T, T);
  // Steps
  ctx.fillStyle = '#2a2a44';
  ctx.fillRect(2, 2, 12, 3);
  ctx.fillStyle = '#222238';
  ctx.fillRect(3, 6, 10, 3);
  ctx.fillStyle = '#1a1a30';
  ctx.fillRect(4, 10, 8, 3);
  // Border
  ctx.fillStyle = '#3d3d5c';
  ctx.fillRect(0, 0, 1, T);
  ctx.fillRect(T - 1, 0, 1, T);
  ctx.fillRect(0, 0, T, 1);

  scene.textures.addCanvas('stairs', canvas);
}

function generateParticle(scene: Phaser.Scene): void {
  const canvas = document.createElement('canvas');
  canvas.width = 4;
  canvas.height = 4;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(1, 1, 2, 2);
  scene.textures.addCanvas('particle', canvas);
}

function drawPixel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}
