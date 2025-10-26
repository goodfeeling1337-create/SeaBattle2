import type { BoardState, Position, ShotResult } from '../types';
import { getShipAt, addHit, addMiss, isShipSunken } from './board';

// Обработка выстрела
export function resolveShot(board: BoardState, shot: Position): ShotResult {
  const ship = getShipAt(board, shot);

  if (!ship) {
    // Промах
    return {
      type: 'MISS',
    };
  }

  // Попадание
  const updatedBoard = addHit(board, shot);
  const isSunken = isShipSunken(updatedBoard, ship);

  if (isSunken) {
    // Корабль потоплен
    return {
      type: 'SINK',
      sunkShipId: ship.id,
    };
  }

  // Просто попадание
  return {
    type: 'HIT',
  };
}

// Применение выстрела к доске
export function applyShot(board: BoardState, shot: Position): BoardState {
  const ship = getShipAt(board, shot);

  if (ship) {
    return addHit(board, shot);
  }

  return addMiss(board, shot);
}

// Проверка окончания игры (все корабли противника потоплены)
export function isGameOver(board: BoardState): boolean {
  if (board.ships.length === 0) {
    return false;
  }

  return board.sunkenShips.length === board.ships.length;
}

