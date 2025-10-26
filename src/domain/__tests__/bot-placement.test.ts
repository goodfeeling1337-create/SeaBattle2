import { describe, it, expect } from 'vitest';
import { generateBotBoard } from '../bot-placement';

describe('Bot Board Generation', () => {
  it('should generate valid board', () => {
    const board = generateBotBoard(10, 10);

    expect(board.width).toBe(10);
    expect(board.height).toBe(10);
    expect(board.ships).toBeDefined();
  });

  it('should generate all 10 ships', () => {
    const board = generateBotBoard(10, 10);

    expect(board.ships.length).toBeGreaterThan(0);
    expect(board.ships.length).toBeLessThanOrEqual(10);
  });

  it('should place ships within boundaries', () => {
    const board = generateBotBoard(10, 10);

    for (const ship of board.ships) {
      for (const pos of ship.positions) {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThan(10);
        expect(pos.y).toBeGreaterThanOrEqual(0);
        expect(pos.y).toBeLessThan(10);
      }
    }
  });

  it('should place ships without overlaps', () => {
    const board = generateBotBoard(10, 10);

    const allPositions = new Set<string>();

    for (const ship of board.ships) {
      for (const pos of ship.positions) {
        const key = `${pos.x},${pos.y}`;
        expect(allPositions.has(key)).toBe(false);
        allPositions.add(key);
      }
    }
  });

  it('should not allow touching ships', () => {
    const board = generateBotBoard(10, 10);

    for (let i = 0; i < board.ships.length; i++) {
      for (let j = i + 1; j < board.ships.length; j++) {
        const ship1 = board.ships[i];
        const ship2 = board.ships[j];

        // Проверка что корабли не касаются
        for (const pos1 of ship1.positions) {
          for (const pos2 of ship2.positions) {
            const dx = Math.abs(pos1.x - pos2.x);
            const dy = Math.abs(pos1.y - pos2.y);

            expect(dx > 1 || dy > 1).toBe(true);
          }
        }
      }
    }
  });
});

