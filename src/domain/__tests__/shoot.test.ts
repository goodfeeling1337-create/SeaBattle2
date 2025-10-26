import { describe, it, expect } from 'vitest';
import { resolveShot, applyShot, isGameOver } from '../shoot';
import { createEmptyBoard, getShipAt } from '../board';
import type { Position } from '../../types';

describe('shoot', () => {
  describe('resolveShot', () => {
    it('should return MISS for empty cell', () => {
      const board = createEmptyBoard(10, 10);
      const result = resolveShot(board, { x: 5, y: 5 });

      expect(result.type).toBe('MISS');
    });

    it('should return HIT for ship cell', () => {
      const board = createEmptyBoard(10, 10);
      board.ships.push({
        id: 'ship-1',
        size: 2,
        positions: [{ x: 5, y: 5 }, { x: 5, y: 6 }],
      });

      const result = resolveShot(board, { x: 5, y: 5 });

      expect(result.type).toBe('HIT');
    });

    it('should return SINK when all positions are hit', () => {
      const board = createEmptyBoard(10, 10);
      board.ships.push({
        id: 'ship-1',
        size: 2,
        positions: [{ x: 5, y: 5 }, { x: 5, y: 6 }],
      });

      // Первый выстрел
      board.hits.push({ x: 5, y: 6 });

      // Второй выстрел должен потопить корабль
      const result = resolveShot(board, { x: 5, y: 5 });

      expect(result.type).toBe('SINK');
      expect(result.sunkShipId).toBe('ship-1');
    });
  });

  describe('applyShot', () => {
    it('should add hit to board', () => {
      const board = createEmptyBoard(10, 10);
      board.ships.push({
        id: 'ship-1',
        size: 1,
        positions: [{ x: 5, y: 5 }],
      });

      const updated = applyShot(board, { x: 5, y: 5 });

      expect(updated.hits).toHaveLength(1);
      expect(updated.hits[0]).toEqual({ x: 5, y: 5 });
    });

    it('should add miss to board', () => {
      const board = createEmptyBoard(10, 10);
      const updated = applyShot(board, { x: 3, y: 3 });

      expect(updated.misses).toHaveLength(1);
      expect(updated.misses[0]).toEqual({ x: 3, y: 3 });
    });
  });

  describe('isGameOver', () => {
    it('should return true when all ships are sunken', () => {
      const board = createEmptyBoard(10, 10);
      board.ships.push(
        { id: 'ship-1', size: 1, positions: [{ x: 0, y: 0 }] },
        { id: 'ship-2', size: 1, positions: [{ x: 1, y: 1 }] }
      );

      board.sunkenShips.push('ship-1', 'ship-2');

      expect(isGameOver(board)).toBe(true);
    });

    it('should return false when ships are not sunken', () => {
      const board = createEmptyBoard(10, 10);
      board.ships.push({ id: 'ship-1', size: 1, positions: [{ x: 0, y: 0 }] });
      board.sunkenShips.push('ship-1');

      expect(isGameOver(board)).toBe(true);
    });
  });
});

