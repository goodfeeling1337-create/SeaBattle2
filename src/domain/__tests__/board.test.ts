import { describe, it, expect } from 'vitest';
import { createEmptyBoard, addHit, addMiss, isShipSunken, getShipAt, serializeBoard, deserializeBoard, isBoardCleared } from '../board';
import type { Position, Ship, BoardState } from '../../types';

describe('board', () => {
  describe('createEmptyBoard', () => {
    it('should create 10x10 empty board', () => {
      const board = createEmptyBoard(10, 10);

      expect(board.width).toBe(10);
      expect(board.height).toBe(10);
      expect(board.ships).toEqual([]);
      expect(board.hits).toEqual([]);
      expect(board.misses).toEqual([]);
    });
  });

  describe('addHit', () => {
    it('should add hit to board', () => {
      const board = createEmptyBoard(10, 10);
      const updated = addHit(board, { x: 5, y: 5 });

      expect(updated.hits).toHaveLength(1);
      expect(updated.hits[0]).toEqual({ x: 5, y: 5 });
    });

    it('should not add duplicate hits', () => {
      const board = createEmptyBoard(10, 10);
      const hit1 = addHit(board, { x: 5, y: 5 });
      const hit2 = addHit(hit1, { x: 5, y: 5 });

      expect(hit2.hits).toHaveLength(1);
    });
  });

  describe('addMiss', () => {
    it('should add miss to board', () => {
      const board = createEmptyBoard(10, 10);
      const updated = addMiss(board, { x: 3, y: 3 });

      expect(updated.misses).toHaveLength(1);
      expect(updated.misses[0]).toEqual({ x: 3, y: 3 });
    });
  });

  describe('getShipAt', () => {
    it('should find ship at position', () => {
      const ship: Ship = {
        id: 'ship-1',
        size: 2,
        positions: [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
        ],
      };

      const board = createEmptyBoard(10, 10);
      board.ships.push(ship);

      expect(getShipAt(board, { x: 5, y: 5 })).toEqual(ship);
      expect(getShipAt(board, { x: 6, y: 5 })).toEqual(ship);
    });

    it('should return undefined if no ship at position', () => {
      const board = createEmptyBoard(10, 10);
      expect(getShipAt(board, { x: 5, y: 5 })).toBeUndefined();
    });
  });

  describe('isShipSunken', () => {
    it('should detect sunken ship', () => {
      const ship: Ship = {
        id: 'ship-1',
        size: 2,
        positions: [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
        ],
      };

      const board: BoardState = {
        width: 10,
        height: 10,
        ships: [ship],
        hits: [{ x: 5, y: 5 }, { x: 6, y: 5 }],
        misses: [],
        sunkenShips: [],
      };

      expect(isShipSunken(board, ship)).toBe(true);
    });

    it('should detect non-sunken ship', () => {
      const ship: Ship = {
        id: 'ship-1',
        size: 2,
        positions: [
          { x: 5, y: 5 },
          { x: 6, y: 5 },
        ],
      };

      const board: BoardState = {
        width: 10,
        height: 10,
        ships: [ship],
        hits: [{ x: 5, y: 5 }],
        misses: [],
        sunkenShips: [],
      };

      expect(isShipSunken(board, ship)).toBe(false);
    });
  });

  describe('serializeBoard / deserializeBoard', () => {
    it('should serialize and deserialize board', () => {
      const board: BoardState = {
        width: 10,
        height: 10,
        ships: [
          {
            id: 'ship-1',
            size: 4,
            positions: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
          },
        ],
        hits: [{ x: 0, y: 0 }],
        misses: [{ x: 5, y: 5 }],
        sunkenShips: ['ship-1'],
      };

      const serialized = serializeBoard(board);
      const deserialized = deserializeBoard(serialized);

      expect(deserialized).toEqual(board);
    });
  });

  describe('isBoardCleared', () => {
    it('should detect cleared board', () => {
      const board: BoardState = {
        width: 10,
        height: 10,
        ships: [
          { id: 'ship-1', size: 1, positions: [{ x: 0, y: 0 }] },
          { id: 'ship-2', size: 1, positions: [{ x: 1, y: 1 }] },
        ],
        hits: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
        misses: [],
        sunkenShips: ['ship-1', 'ship-2'],
      };

      expect(isBoardCleared(board)).toBe(true);
    });

    it('should detect non-cleared board', () => {
      const board: BoardState = {
        width: 10,
        height: 10,
        ships: [
          { id: 'ship-1', size: 1, positions: [{ x: 0, y: 0 }] },
        ],
        hits: [],
        misses: [],
        sunkenShips: [],
      };

      expect(isBoardCleared(board)).toBe(false);
    });
  });
});

