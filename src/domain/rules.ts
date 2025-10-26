import type { Position, Ship } from '../types';

// Конфигурация правил для размещения кораблей
export interface ShipConfig {
  size: number;
  count: number;
}

export interface RuleSet {
  width: number;
  height: number;
  ships: ShipConfig[];
  allowDiagonal: boolean;
  touchProhibited: boolean;
}

// Валидация размещения корабля на доске
export function isValidShipPlacement(
  ship: Ship,
  board: { width: number; height: number },
  existingShips: Ship[],
  rules: RuleSet
): boolean {
  // Проверка границ доски
  for (const pos of ship.positions) {
    if (pos.x < 0 || pos.x >= board.width || pos.y < 0 || pos.y >= board.height) {
      return false;
    }
  }

  // Проверка на допустимость диагоналей
  if (!rules.allowDiagonal && ship.positions.length > 1) {
    const dx = ship.positions[1].x - ship.positions[0].x;
    const dy = ship.positions[1].y - ship.positions[0].y;

    // Корабль должен быть прямой линией (горизонтальной или вертикальной)
    if (dx !== 0 && dy !== 0) {
      return false;
    }

    // Проверка что все клетки идут подряд
    for (let i = 1; i < ship.positions.length; i++) {
      const prev = ship.positions[i - 1];
      const curr = ship.positions[i];

      if (Math.abs(curr.x - prev.x) + Math.abs(curr.y - prev.y) !== 1) {
        return false;
      }
    }
  }

  // Проверка на отсутствие касаний (если запрещены)
  if (rules.touchProhibited) {
    for (const existingShip of existingShips) {
      if (shipsTouch(ship, existingShip)) {
        return false;
      }
    }
  }

  // Проверка что позиции уникальны
  const unique = new Set(ship.positions.map((p) => `${p.x},${p.y}`));
  if (unique.size !== ship.positions.length) {
    return false;
  }

  return true;
}

// Проверка касаются ли корабли
function shipsTouch(ship1: Ship, ship2: Ship): boolean {
  for (const pos1 of ship1.positions) {
    for (const pos2 of ship2.positions) {
      const dx = Math.abs(pos1.x - pos2.x);
      const dy = Math.abs(pos1.y - pos2.y);

      // Прилегающие клетки (вертикально или горизонтально)
      if (dx === 1 && dy === 0) return true;
      if (dx === 0 && dy === 1) return true;
      // Диагональные углы
      if (dx === 1 && dy === 1) return true;
    }
  }
  return false;
}

// Парсинг JSON конфигурации кораблей
export function parseShipConfig(json: string): ShipConfig[] {
  try {
    const parsed = JSON.parse(json);
    if (parsed.ships && Array.isArray(parsed.ships)) {
      return parsed.ships;
    }
    throw new Error('Invalid ship config format');
  } catch {
    throw new Error('Failed to parse ship config');
  }
}

// Валидация полной доски (все корабли размещены корректно)
export function validateBoard(board: { ships: Ship[] }, rules: RuleSet): boolean {
  const configs = parseShipConfig(rules.touchProhibited ? JSON.stringify({ ships: rules.ships }) : JSON.stringify({ ships: rules.ships }));

  // Счетчик кораблей по размерам
  const shipCounts = new Map<number, number>();
  for (const ship of board.ships) {
    shipCounts.set(ship.size, (shipCounts.get(ship.size) || 0) + 1);
  }

  // Проверка количества кораблей каждого размера
  for (const config of configs) {
    const count = shipCounts.get(config.size) || 0;
    if (count !== config.count) {
      return false;
    }
  }

  // Проверка размещения каждого корабля
  for (let i = 0; i < board.ships.length; i++) {
    const ship = board.ships[i];
    const otherShips = board.ships.filter((_, idx) => idx !== i);

    if (!isValidShipPlacement(ship, { width: rules.width, height: rules.height }, otherShips, rules)) {
      return false;
    }
  }

  return true;
}

