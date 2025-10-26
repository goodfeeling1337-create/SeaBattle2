import type { BoardState, Position, Ship } from '../types';

// Конфигурация размещения кораблей
const SHIPS_CONFIG = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];

// Генерация случайной доски для бота
export function generateBotBoard(width: number, height: number): BoardState {
  const board: BoardState = {
    width,
    height,
    ships: [],
    hits: [],
    misses: [],
    sunkenShips: [],
  };

  for (const size of SHIPS_CONFIG) {
    const ship = tryPlaceShip(board, size, width, height);
    if (ship) {
      board.ships.push(ship);
    }
  }

  return board;
}

// Попытка разместить корабль на доске
function tryPlaceShip(
  board: BoardState,
  size: number,
  width: number,
  height: number,
  maxAttempts = 100
): Ship | null {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Случайная ориентация
    const horizontal = Math.random() > 0.5;

    // Случайная позиция
    const maxX = horizontal ? width - size : width - 1;
    const maxY = horizontal ? height - 1 : height - size;

    if (maxX < 0 || maxY < 0) {
      continue;
    }

    const x = Math.floor(Math.random() * maxX);
    const y = Math.floor(Math.random() * maxY);

    // Генерация позиций корабля
    const positions: Position[] = [];
    for (let i = 0; i < size; i++) {
      positions.push({
        x: horizontal ? x + i : x,
        y: horizontal ? y : y + i,
      });
    }

    const ship: Ship = {
      id: `bot-ship-${Date.now()}-${Math.random()}`,
      size,
      positions,
    };

    // Проверка валидности размещения
    if (isValidShipPlacement(board, ship)) {
      return ship;
    }
  }

  return null;
}

// Проверка валидности размещения корабля
function isValidShipPlacement(board: BoardState, ship: Ship): boolean {
  // Проверка границ
  for (const pos of ship.positions) {
    if (pos.x < 0 || pos.x >= board.width || pos.y < 0 || pos.y >= board.height) {
      return false;
    }

    // Проверка на наличие другого корабля
    for (const existingShip of board.ships) {
      for (const existingPos of existingShip.positions) {
        if (pos.x === existingPos.x && pos.y === existingPos.y) {
          return false;
        }
      }
    }

    // Проверка касаний (запрещено)
    for (const existingShip of board.ships) {
      if (shipsTouch(ship, existingShip)) {
        return false;
      }
    }
  }

  return true;
}

// Проверка касаются ли корабли
function shipsTouch(ship1: Ship, ship2: Ship): boolean {
  for (const pos1 of ship1.positions) {
    for (const pos2 of ship2.positions) {
      const dx = Math.abs(pos1.x - pos2.x);
      const dy = Math.abs(pos1.y - pos2.y);

      // Прилегающие клетки или диагональные углы
      if (dx <= 1 && dy <= 1) {
        return true;
      }
    }
  }
  return false;
}

