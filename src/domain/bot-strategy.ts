import type { Position, ShotResult } from '../types';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export class BotStrategy {
  private shots: Position[] = [];
  private hits: Position[] = [];
  private pendingTargets: Position[] = [];
  private lastHit: Position | null = null;
  private huntingMode: 'search' | 'target' = 'search';

  constructor(private difficulty: BotDifficulty) {}

  // Получение следующего выстрела
  getNextShot(boardWidth: number, boardHeight: number): Position {
    switch (this.difficulty) {
      case 'easy':
        return this.getRandomShot(boardWidth, boardHeight);
      case 'medium':
        return this.getTargetedShot(boardWidth, boardHeight);
      case 'hard':
        return this.getAdvancedShot(boardWidth, boardHeight);
      default:
        return this.getRandomShot(boardWidth, boardHeight);
    }
  }

  // Случайный выстрел (Easy)
  private getRandomShot(boardWidth: number, boardHeight: number): Position {
    let x: number, y: number;
    let attempts = 0;

    do {
      x = Math.floor(Math.random() * boardWidth);
      y = Math.floor(Math.random() * boardHeight);
      attempts++;
    } while (this.isAlreadyShot(x, y) && attempts < 100);

    return { x, y };
  }

  // Целевой выстрел (Medium)
  private getTargetedShot(boardWidth: number, boardHeight: number): Position {
    // Если есть pendingTargets - стрелять туда
    if (this.pendingTargets.length > 0) {
      const target = this.pendingTargets.shift()!;
      if (!this.isAlreadyShot(target.x, target.y)) {
        return target;
      }
    }

    // Если была попадание - охотиться вокруг
    if (this.lastHit) {
      const adjacent = this.getAdjacentCells(this.lastHit, boardWidth, boardHeight);
      const unexplored = adjacent.filter(
        (cell) => !this.isAlreadyShot(cell.x, cell.y)
      );

      if (unexplored.length > 0) {
        const target = unexplored[0];
        return target;
      }
    }

    // Иначе random
    return this.getRandomShot(boardWidth, boardHeight);
  }

  // Продвинутый выстрел (Hard)
  private getAdvancedShot(boardWidth: number, boardHeight: number): Position {
    // Приоритет pendingTargets
    if (this.pendingTargets.length > 0) {
      const target = this.pendingTargets.shift()!;
      if (!this.isAlreadyShot(target.x, target.y)) {
        return target;
      }
    }

    // Множественное нацеливание
    if (this.hits.length >= 2) {
      const patterns = this.findShipPatterns();
      if (patterns.length > 0) {
        return patterns[0];
      }
    }

    // Одиночный таргет
    if (this.lastHit) {
      const adjacent = this.getAdjacentCells(this.lastHit, boardWidth, boardHeight);
      const unexplored = adjacent.filter(
        (cell) => !this.isAlreadyShot(cell.x, cell.y)
      );

      if (unexplored.length > 0) {
        return unexplored[0];
      }
    }

    return this.getRandomShot(boardWidth, boardHeight);
  }

  // Обработка результата выстрела
  processResult(pos: Position, result: ShotResult): void {
    this.shots.push(pos);

    if (result.type === 'HIT' || result.type === 'SINK') {
      this.hits.push(pos);
      this.lastHit = pos;
      this.huntingMode = 'target';

      if (result.type === 'SINK') {
        this.lastHit = null;
        this.huntingMode = 'search';
      } else if (result.type === 'HIT') {
        // Добавить соседние клетки в pending
        const adjacent = this.getAdjacentCells(pos, 10, 10);
        this.pendingTargets.push(...adjacent.filter((c) => !this.isAlreadyShot(c.x, c.y)));
      }
    }
  }

  // Проверка уже выстреляно
  private isAlreadyShot(x: number, y: number): boolean {
    return this.shots.some((shot) => shot.x === x && shot.y === y);
  }

  // Получение соседних клеток
  private getAdjacentCells(pos: Position, width: number, height: number): Position[] {
    const adjacent: Position[] = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        if (dx !== 0 && dy !== 0) continue; // Только горизонтально/вертикально

        const x = pos.x + dx;
        const y = pos.y + dy;

        if (x >= 0 && x < width && y >= 0 && y < height) {
          adjacent.push({ x, y });
        }
      }
    }

    return adjacent;
  }

  // Поиск паттернов кораблей
  private findShipPatterns(): Position[] {
    // Поиск линий из попаданий
    const lines: Position[] = [];

    for (const hit of this.hits) {
      // Проверка горизонтальной линии
      const hasHorizontalNeighbor = this.hits.some(
        (h) => h.y === hit.y && Math.abs(h.x - hit.x) === 1
      );
      if (hasHorizontalNeighbor) {
        const potentialTargets = [
          { x: hit.x - 1, y: hit.y },
          { x: hit.x + 1, y: hit.y },
        ].filter((p) => p.x >= 0 && p.x < 10 && p.y >= 0 && p.y < 10);

        for (const target of potentialTargets) {
          if (!this.isAlreadyShot(target.x, target.y)) {
            lines.push(target);
          }
        }
      }

      // Проверка вертикальной линии
      const hasVerticalNeighbor = this.hits.some(
        (h) => h.x === hit.x && Math.abs(h.y - hit.y) === 1
      );
      if (hasVerticalNeighbor) {
        const potentialTargets = [
          { x: hit.x, y: hit.y - 1 },
          { x: hit.x, y: hit.y + 1 },
        ].filter((p) => p.x >= 0 && p.x < 10 && p.y >= 0 && p.y < 10);

        for (const target of potentialTargets) {
          if (!this.isAlreadyShot(target.x, target.y)) {
            lines.push(target);
          }
        }
      }
    }

    return lines;
  }
}

