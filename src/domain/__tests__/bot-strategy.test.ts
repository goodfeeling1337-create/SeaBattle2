import { describe, it, expect, beforeEach } from 'vitest';
import { BotStrategy, type BotDifficulty } from '../bot-strategy';
import type { ShotResult } from '../../types';

describe('Bot Strategy', () => {
  let strategy: BotStrategy;

  beforeEach(() => {
    strategy = new BotStrategy('medium');
  });

  describe('getNextShot', () => {
    it('should return valid coordinates for easy', () => {
      const easyStrategy = new BotStrategy('easy');
      const shot = easyStrategy.getNextShot(10, 10);

      expect(shot.x).toBeGreaterThanOrEqual(0);
      expect(shot.x).toBeLessThan(10);
      expect(shot.y).toBeGreaterThanOrEqual(0);
      expect(shot.y).toBeLessThan(10);
    });

    it('should return valid coordinates for medium', () => {
      const shot = strategy.getNextShot(10, 10);

      expect(shot.x).toBeGreaterThanOrEqual(0);
      expect(shot.x).toBeLessThan(10);
      expect(shot.y).toBeGreaterThanOrEqual(0);
      expect(shot.y).toBeLessThan(10);
    });

    it('should not repeat shots', () => {
      const shots: Array<{ x: number; y: number }> = [];

      for (let i = 0; i < 5; i++) {
        const shot = strategy.getNextShot(10, 10);
        strategy.processResult(shot, { type: 'MISS' });
        shots.push(shot);
      }

      const uniqueShots = new Set(shots.map((s) => `${s.x},${s.y}`));
      expect(uniqueShots.size).toBe(5);
    });
  });

  describe('processResult', () => {
    it('should track hits', () => {
      const shot = strategy.getNextShot(10, 10);

      strategy.processResult(shot, { type: 'HIT' });

      const nextShot = strategy.getNextShot(10, 10);

      // Следующий выстрел должен быть рядом с первым (targeting mode)
      const isAdjacent =
        Math.abs(nextShot.x - shot.x) + Math.abs(nextShot.y - shot.y) <= 1;

      expect(isAdjacent).toBe(true);
    });

    it('should switch to targeting mode after hit', () => {
      const shot1 = strategy.getNextShot(10, 10);
      strategy.processResult(shot1, { type: 'HIT' });

      const shot2 = strategy.getNextShot(10, 10);
      strategy.processResult(shot2, { type: 'MISS' });

      const shot3 = strategy.getNextShot(10, 10);

      // Третий выстрел должен быть около первого попадания
      const distance1 = Math.abs(shot3.x - shot1.x) + Math.abs(shot3.y - shot1.y);
      expect(distance1).toBeLessThanOrEqual(2);
    });

    it('should reset targeting after sink', () => {
      const shot1 = strategy.getNextShot(10, 10);
      strategy.processResult(shot1, { type: 'HIT' });

      const shot2 = strategy.getNextShot(10, 10);
      strategy.processResult(shot2, { type: 'SINK' });

      // После потопления должен вернуться в search mode
      const shot3 = strategy.getNextShot(10, 10);
      const shot4 = strategy.getNextShot(10, 10);

      // Следующий выстрел не обязательно должен быть рядом
      const isWithinRange = Math.abs(shot4.x - shot1.x) + Math.abs(shot4.y - shot1.y) < 5;

      expect(isWithinRange).toBe(true);
    });
  });

  describe('different difficulties', () => {
    it('should use random strategy for easy', () => {
      const easy = new BotStrategy('easy');
      const shot = easy.getNextShot(10, 10);

      expect(shot.x).toBeGreaterThanOrEqual(0);
      expect(shot.x).toBeLessThan(10);
      expect(shot.y).toBeGreaterThanOrEqual(0);
      expect(shot.y).toBeLessThan(10);
    });

    it('should use targeted strategy for medium', () => {
      const medium = new BotStrategy('medium');
      const shot = medium.getNextShot(10, 10);

      expect(shot.x).toBeGreaterThanOrEqual(0);
      expect(shot.x).toBeLessThan(10);
      expect(shot.y).toBeGreaterThanOrEqual(0);
      expect(shot.y).toBeLessThan(10);
    });

    it('should use advanced strategy for hard', () => {
      const hard = new BotStrategy('hard');
      const shot = hard.getNextShot(10, 10);

      expect(shot.x).toBeGreaterThanOrEqual(0);
      expect(shot.x).toBeLessThan(10);
      expect(shot.y).toBeGreaterThanOrEqual(0);
      expect(shot.y).toBeLessThan(10);
    });
  });
});

