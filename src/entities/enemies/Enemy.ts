import Phaser from 'phaser';
import { CombatStats } from '../../systems/CombatSystem';
import { Entity } from '../Entity';

export type EnemyType = 'slime' | 'bat' | 'skeleton';

export interface EnemyConfig {
  type: EnemyType;
  name: string;
  color: number;
  texture: string;
  stats: CombatStats;
  detectionRange: number;
  xpReward: number;
  usesPathfinding: boolean;
}

export class Enemy extends Entity {
  readonly enemyType: EnemyType;
  readonly name: string;
  readonly detectionRange: number;
  readonly xpReward: number;
  readonly usesPathfinding: boolean;

  constructor(scene: Phaser.Scene, tileX: number, tileY: number, config: EnemyConfig) {
    super(scene, tileX, tileY, config.texture, config.color, config.stats);
    this.enemyType = config.type;
    this.name = config.name;
    this.detectionRange = config.detectionRange;
    this.xpReward = config.xpReward;
    this.usesPathfinding = config.usesPathfinding;
  }
}

export const ENEMY_CONFIGS: Record<EnemyType, (floor: number) => EnemyConfig> = {
  slime: (floor) => ({
    type: 'slime',
    name: 'Slime',
    color: 0x44ff44,
    texture: 'enemy-slime',
    stats: {
      hp: 15 + floor * 3,
      maxHp: 15 + floor * 3,
      attack: 3 + floor,
      defense: 0,
    },
    detectionRange: 4,
    xpReward: 10 + floor * 2,
    usesPathfinding: false,
  }),

  bat: (floor) => ({
    type: 'bat',
    name: 'Bat',
    color: 0x9944cc,
    texture: 'enemy-bat',
    stats: {
      hp: 10 + floor * 2,
      maxHp: 10 + floor * 2,
      attack: 5 + floor,
      defense: 1,
    },
    detectionRange: 6,
    xpReward: 15 + floor * 3,
    usesPathfinding: false,
  }),

  skeleton: (floor) => ({
    type: 'skeleton',
    name: 'Skeleton',
    color: 0xcccccc,
    texture: 'enemy-skeleton',
    stats: {
      hp: 25 + floor * 5,
      maxHp: 25 + floor * 5,
      attack: 7 + floor * 2,
      defense: 2 + Math.floor(floor / 2),
    },
    detectionRange: 8,
    xpReward: 25 + floor * 5,
    usesPathfinding: true,
  }),
};
