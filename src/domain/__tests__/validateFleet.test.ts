import { describe, it, expect } from 'vitest';
import type { Ship, BoardState } from '../../types';
import { validateBoard } from '../rules';
import type { RuleSet } from '../rules';

describe('validateBoard - касания запрещены', () => {
  const rules: RuleSet = {
    width: 10,
    height: 10,
    ships: [
      { size: 4, count: 1 },
      { size: 3, count: 2 },
      { size: 2, count: 3 },
      { size: 1, count: 4 },
    ],
    allowDiagonal: false,
    touchProhibited: true,
  };

  it('должна отклонять корабли которые касаются углами', () => {
    const board: BoardState = {
      width: 10,
      height: 10,
      ships: [
        {
          id: 'ship1',
          size: 3,
          positions: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
          ],
        },
        {
          id: 'ship2',
          size: 2,
          positions: [
            { x: 2, y: 1 }, // Соседняя клетка сверху
            { x: 3, y: 1 },
          ],
        },
      ],
      hits: [],
      misses: [],
      sunkenShips: [],
    };

    expect(validateBoard(board, rules)).toBe(false);
  });

  it('должна отклонять корабли которые касаются сбоку', () => {
    const board: BoardState = {
      width: 10,
      height: 10,
      ships: [
        {
          id: 'ship1',
          size: 3,
          positions: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
          ],
        },
        {
          id: 'ship2',
          size: 2,
          positions: [
            { x: 3, y: 0 }, // Примыкает сбоку
            { x: 4, y: 0 },
          ],
        },
      ],
      hits: [],
      misses: [],
      sunkenShips: [],
    };

    expect(validateBoard(board, rules)).toBe(false);
  });

  it('должна разрешать корабли с промежутком в 1 клетку', () => {
    // Создаем полный набор кораблей согласно правилам
    const board: BoardState = {
      width: 10,
      height: 10,
      ships: [
        // Размер 4: 1 корабль
        {
          id: 'ship-size4',
          size: 4,
          positions: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
          ],
        },
        // Размер 3: 2 корабля
        {
          id: 'ship-size3-1',
          size: 3,
          positions: [
            { x: 0, y: 3 },
            { x: 1, y: 3 },
            { x: 2, y: 3 },
          ],
        },
        {
          id: 'ship-size3-2',
          size: 3,
          positions: [
            { x: 5, y: 3 },
            { x: 6, y: 3 },
            { x: 7, y: 3 },
          ],
        },
        // Размер 2: 3 корабля
        {
          id: 'ship-size2-1',
          size: 2,
          positions: [
            { x: 0, y: 6 },
            { x: 1, y: 6 },
          ],
        },
        {
          id: 'ship-size2-2',
          size: 2,
          positions: [
            { x: 4, y: 6 },
            { x: 5, y: 6 },
          ],
        },
        {
          id: 'ship-size2-3',
          size: 2,
          positions: [
            { x: 8, y: 6 },
            { x: 9, y: 6 },
          ],
        },
        // Размер 1: 4 корабля
        {
          id: 'ship-size1-1',
          size: 1,
          positions: [{ x: 0, y: 9 }],
        },
        {
          id: 'ship-size1-2',
          size: 1,
          positions: [{ x: 2, y: 9 }],
        },
        {
          id: 'ship-size1-3',
          size: 1,
          positions: [{ x: 5, y: 9 }],
        },
        {
          id: 'ship-size1-4',
          size: 1,
          positions: [{ x: 7, y: 9 }],
        },
      ],
      hits: [],
      misses: [],
      sunkenShips: [],
    };

    expect(validateBoard(board, rules)).toBe(true);
  });

  it('должна проверять количество кораблей каждого размера', () => {
    const board: BoardState = {
      width: 10,
      height: 10,
      ships: [
        // Только 1 корабль размера 4, нужно 1
        {
          id: 'ship1',
          size: 4,
          positions: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
          ],
        },
        // Только 2 корабля размера 3, нужно 2
        {
          id: 'ship2',
          size: 3,
          positions: [
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
          ],
        },
        {
          id: 'ship3',
          size: 3,
          positions: [
            { x: 5, y: 2 },
            { x: 6, y: 2 },
            { x: 7, y: 2 },
          ],
        },
        // Отсутствуют корабли размера 2 и 1
      ],
      hits: [],
      misses: [],
      sunkenShips: [],
    };

    expect(validateBoard(board, rules)).toBe(false);
  });
});

describe('validateBoard - касания разрешены', () => {
  const rules: RuleSet = {
    width: 10,
    height: 10,
    ships: [
      { size: 3, count: 1 },
      { size: 2, count: 1 },
    ],
    allowDiagonal: false,
    touchProhibited: false, // Разрешены касания
  };

  it('должна разрешать касающиеся корабли', () => {
    const board: BoardState = {
      width: 10,
      height: 10,
      ships: [
        {
          id: 'ship1',
          size: 3,
          positions: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
          ],
        },
        {
          id: 'ship2',
          size: 2,
          positions: [
            { x: 2, y: 1 }, // Соседняя клетка сверху
            { x: 3, y: 1 },
          ],
        },
      ],
      hits: [],
      misses: [],
      sunkenShips: [],
    };

    expect(validateBoard(board, rules)).toBe(true);
  });
});

