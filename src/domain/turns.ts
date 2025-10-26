import type { GameStatus, User } from '@prisma/client';

// Интерфейс игры для управления ходами
export interface TurnGame {
  id: string;
  status: GameStatus;
  p1Id: string;
  p2Id: string | null;
  turnUserId: string | null;
}

// Получение ID игрока, который должен ходить
export function getNextTurnPlayer(game: TurnGame): string | null {
  if (!game.p2Id) {
    return null; // Игра еще не началась
  }

  if (!game.turnUserId) {
    return game.p1Id; // Первый ход
  }

  // Переключение хода
  return game.turnUserId === game.p1Id ? game.p2Id : game.p1Id;
}

// Установка следующего хода
export function setNextTurn(game: TurnGame): string | null {
  return getNextTurnPlayer(game);
}

// Проверка чей сейчас ход
export function isCurrentPlayerTurn(game: TurnGame, userId: string): boolean {
  if (game.status !== 'IN_PROGRESS') {
    return false;
  }

  return game.turnUserId === userId;
}

// Проверка может ли игрок сделать ход
export function canPlayerMakeMove(game: TurnGame, userId: string): boolean {
  if (game.status !== 'IN_PROGRESS') {
    return false;
  }

  if (!game.p2Id) {
    return false;
  }

  return isCurrentPlayerTurn(game, userId);
}

// Переключение хода после промаха
export function switchTurnAfterMiss(game: TurnGame): string | null {
  return setNextTurn(game);
}

