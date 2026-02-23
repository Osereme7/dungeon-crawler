import { describe, it, expect } from 'vitest';
import { createRng, randomInt, randomPick, shuffle } from '../../src/utils/Random';

describe('Random', () => {
  describe('createRng', () => {
    it('should produce deterministic sequences', () => {
      const rng1 = createRng(12345);
      const rng2 = createRng(12345);
      for (let i = 0; i < 100; i++) {
        expect(rng1()).toBe(rng2());
      }
    });

    it('should produce values between 0 and 1', () => {
      const rng = createRng(42);
      for (let i = 0; i < 1000; i++) {
        const val = rng();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('should produce different sequences for different seeds', () => {
      const rng1 = createRng(1);
      const rng2 = createRng(2);
      let allSame = true;
      for (let i = 0; i < 10; i++) {
        if (rng1() !== rng2()) {
          allSame = false;
          break;
        }
      }
      expect(allSame).toBe(false);
    });
  });

  describe('randomInt', () => {
    it('should produce values in range', () => {
      for (let i = 0; i < 100; i++) {
        const val = randomInt(5, 10);
        expect(val).toBeGreaterThanOrEqual(5);
        expect(val).toBeLessThanOrEqual(10);
      }
    });

    it('should return min when min equals max', () => {
      expect(randomInt(7, 7, () => 0)).toBe(7);
      expect(randomInt(7, 7, () => 0.99)).toBe(7);
    });
  });

  describe('randomPick', () => {
    it('should return an element from the array', () => {
      const arr = ['a', 'b', 'c'];
      for (let i = 0; i < 50; i++) {
        expect(arr).toContain(randomPick(arr));
      }
    });
  });

  describe('shuffle', () => {
    it('should preserve all elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr);
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('should not modify the original array', () => {
      const arr = [1, 2, 3];
      shuffle(arr);
      expect(arr).toEqual([1, 2, 3]);
    });
  });
});
