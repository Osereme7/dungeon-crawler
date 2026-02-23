export interface CombatStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
}

export interface AttackResult {
  damage: number;
  isCritical: boolean;
  isKill: boolean;
  remainingHp: number;
}

export function resolveAttack(
  attacker: CombatStats,
  defender: CombatStats,
  randomFn: () => number = Math.random,
): AttackResult {
  const isCritical = randomFn() < 0.1;
  const baseDamage = attacker.attack;
  const rawDamage = isCritical ? baseDamage * 2 : baseDamage;
  const damage = Math.max(1, rawDamage - defender.defense);
  const remainingHp = defender.hp - damage;

  return {
    damage,
    isCritical,
    isKill: remainingHp <= 0,
    remainingHp: Math.max(0, remainingHp),
  };
}

export function calculateXpReward(enemyLevel: number): number {
  return 10 + enemyLevel * 5;
}

export function calculateLevelUp(currentLevel: number): number {
  return 50 + currentLevel * 30;
}
