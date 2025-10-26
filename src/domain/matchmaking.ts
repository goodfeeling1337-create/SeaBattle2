import type { Game, User } from '@prisma/client';
import { randomBytes } from 'crypto';

// Простая очередь матчмейкинга
export class MatchmakingQueue {
  private queue: Array<{ userId: string; joinedAt: Date }> = [];

  // Добавление игрока в очередь
  addPlayer(userId: string): boolean {
    // Проверка что игрок не в очереди
    if (this.queue.some((p) => p.userId === userId)) {
      return false;
    }

    this.queue.push({
      userId,
      joinedAt: new Date(),
    });

    return true;
  }

  // Удаление игрока из очереди
  removePlayer(userId: string): void {
    this.queue = this.queue.filter((p) => p.userId !== userId);
  }

  // Попытка создать пару (извлекает двоих первых игроков)
  tryMatch(): [string, string] | null {
    if (this.queue.length < 2) {
      return null;
    }

    const p1 = this.queue.shift()!;
    const p2 = this.queue.shift()!;

    return [p1.userId, p2.userId];
  }

  // Проверка находится ли игрок в очереди
  isInQueue(userId: string): boolean {
    return this.queue.some((p) => p.userId === userId);
  }

  // Получение позиции в очереди
  getQueuePosition(userId: string): number {
    const index = this.queue.findIndex((p) => p.userId === userId);
    return index >= 0 ? index : -1;
  }
}

// Генерация кода приватной комнаты
export function generateRoomCode(): string {
  return randomBytes(2).toString('hex').toUpperCase();
}

// Проверка валидности кода комнаты
export function isValidRoomCode(code: string): boolean {
  return /^[A-F0-9]{4}$/.test(code);
}

// Ожидаемую структуру игры после создания
export interface GameToCreate {
  p1Id: string;
  p2Id: string | null;
  status: 'LOBBY' | 'IN_PROGRESS';
  width: number;
  height: number;
  ruleSetId: string;
}

// Создание новой игры
export function createGameData(
  p1Id: string,
  p2Id: string | null,
  ruleSetId: string
): GameToCreate {
  return {
    p1Id,
    p2Id: p2Id || null,
    status: p2Id ? 'IN_PROGRESS' : 'LOBBY',
    width: 10,
    height: 10,
    ruleSetId,
  };
}

