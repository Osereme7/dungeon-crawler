import { describe, it, expect } from 'vitest';
import {
  resolveAttack,
  calculateXpReward,
  calculateLevelUp,
  CombatStats,
} from '../../src/systems/CombatSystem';

describe('CombatSystem', () => {
  const attacker: CombatStats = { hp: 100, maxHp: 100, attack: 10, defense: 3 };
  const defender: CombatStats = { hp: 50, maxHp: 50, attack: 5, defense: 2 };

  it('should deal at least 1 damage', () => {
    const heavyDefender: CombatStats = { hp: 50, maxHp: 50, attack: 5, defense: 100 };
    const result = resolveAttack(attacker, heavyDefender, () => 0.5);
    expect(result.damage).toBeGreaterThanOrEqual(1);
  });

  it('should calculate normal damage correctly', () => {
    // Non-crit (random >= 0.1)
    const result = resolveAttack(attacker, defender, () => 0.5);
    expect(result.isCritical).toBe(false);
    expect(result.damage).toBe(Math.max(1, attacker.attack - defender.defense));
  });

  it('should calculate critical damage', () => {
    // Crit (random < 0.1)
    const result = resolveAttack(attacker, defender, () => 0.05);
    expect(result.isCritical).toBe(true);
    expect(result.damage).toBe(Math.max(1, attacker.attack * 2 - defender.defense));
  });

  it('should detect kills', () => {
    const weakDefender: CombatStats = { hp: 1, maxHp: 50, attack: 5, defense: 0 };
    const result = resolveAttack(attacker, weakDefender, () => 0.5);
    expect(result.isKill).toBe(true);
    expect(result.remainingHp).toBe(0);
  });

  it('should not kill if defender has enough HP', () => {
    const result = resolveAttack(attacker, defender, () => 0.5);
    expect(result.isKill).toBe(false);
    expect(result.remainingHp).toBeGreaterThan(0);
  });

  it('should calculate XP reward scaling with floor', () => {
    expect(calculateXpReward(1)).toBe(15);
    expect(calculateXpReward(5)).toBe(35);
    expect(calculateXpReward(1)).toBeLessThan(calculateXpReward(10));
  });

  it('should calculate level-up thresholds', () => {
    expect(calculateLevelUp(1)).toBe(80);
    expect(calculateLevelUp(2)).toBe(110);
    expect(calculateLevelUp(1)).toBeLessThan(calculateLevelUp(5));
  });
});
