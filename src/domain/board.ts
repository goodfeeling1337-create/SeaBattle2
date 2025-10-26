import type { BoardState, Position, Ship } from '../types';

// Создание пустой доски
export function createEmptyBoard(width: number, height: number): BoardState {
  return {
    width,
    height,
    ships: [],
    hits: [],
    misses: [],
    sunkenShips: [],
  };
}

// Проверка попадания по кораблю
export function getShipAt(board: BoardState, pos: Position): Ship | undefined {
  return board.ships.find((ship) =>
    ship.positions.some((p) => p.x === pos.x && p.y === pos.y)
  );
}

// Проверка затоплен ли корабль
export function isShipSunken(board: BoardState, ship: Ship): boolean {
  return ship.positions.every((pos) =>
    board.hits.some((hit) => hit.x === pos.x && hit.y === pos.y)
  );
}

// Добавление попадания
export function addHit(board: BoardState, pos: Position): BoardState {
  if (board.hits.some((h) => h.x === pos.x && h.y === pos.y)) {
    return board; // Уже стреляли сюда
  }

  const newHits = [...board.hits, pos];
  const ship = getShipAt(board, pos);
  const newSunkenShips = [...board.sunkenShips];

  // Проверка затоплен ли корабль
  if (ship && isShipSunken({ ...board, hits: newHits }, ship) && !newSunkenShips.includes(ship.id)) {
    newSunkenShips.push(ship.id);
  }

  return {
    ...board,
    hits: newHits,
    sunkenShips: newSunkenShips,
  };
}

// Добавление промаха
export function addMiss(board: BoardState, pos: Position): BoardState {
  if (board.misses.some((m) => m.x === pos.x && m.y === pos.y)) {
    return board;
  }

  return {
    ...board,
    misses: [...board.misses, pos],
  };
}

// Сериализация доски в JSON
export function serializeBoard(board: BoardState): string {
  return JSON.stringify(board);
}

// Десериализация доски из JSON
export function deserializeBoard(dataJson: string): BoardState {
  try {
    return JSON.parse(dataJson);
  } catch {
    throw new Error('Invalid board data');
  }
}

// Получение маски для тумана войны (соседние клетки потопленных кораблей)
export function getFogOfWarMask(board: BoardState): Position[] {
  const mask: Position[] = [];

  for (const shipId of board.sunkenShips) {
    const ship = board.ships.find((s) => s.id === shipId);
    if (!ship) continue;

    // Добавляем клетки вокруг потопленного корабля
    for (const pos of ship.positions) {
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const x = pos.x + dx;
          const y = pos.y + dy;

          if (
            x >= 0 &&
            x < board.width &&
            y >= 0 &&
            y < board.height &&
            !board.hits.some((h) => h.x === x && h.y === y) &&
            !board.misses.some((m) => m.x === x && m.y === y) &&
            !mask.some((m) => m.x === x && m.y === y)
          ) {
            mask.push({ x, y });
          }
        }
      }
    }
  }

  return mask;
}

// Проверка победы (все корабли потоплены)
export function isBoardCleared(board: BoardState): boolean {
  return board.ships.length > 0 && board.sunkenShips.length === board.ships.length;
}

