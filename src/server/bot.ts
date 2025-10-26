import { PrismaClient } from '@prisma/client';
import { generateBotBoard } from '../domain/bot-placement';
import { BotStrategy, type BotDifficulty } from '../domain/bot-strategy';
import { resolveShot, isGameOver } from '../domain/shoot';
import { serializeBoard, deserializeBoard } from '../domain/board';
import { type ShotResult } from '../types';

const prisma = new PrismaClient();

// Хранение стратегий ботов (в памяти, можно перенести в Redis)
const botStrategies = new Map<string, BotStrategy>();

// Создание игры с ботом
export async function createBotGame(
  userId: string,
  difficulty: BotDifficulty = 'medium'
): Promise<{ gameId: string; botBoardId: string }> {
  // Получение дефолтного ruleset
  const ruleSet = await prisma.ruleSet.findFirst({ where: { name: 'classic' } });

  if (!ruleSet) {
    throw new Error('Rule set not found');
  }

  // Создание пользователя если его нет (для тестирования)
  let user = await prisma.user.findFirst({ where: { telegramId: `test-${userId}` } });
  
  if (!user) {
    console.log('Creating test user:', userId);
    user = await prisma.user.create({
      data: {
        telegramId: `test-${userId}`,
        username: 'Test User',
        displayName: 'Test User',
      },
    });
  }
  
  userId = user.id; // Используем реальный ID пользователя

  // Генерация доски бота
  const botBoard = generateBotBoard(10, 10);
  const botBoardJson = serializeBoard(botBoard);

  // Создание игры
  const game = await prisma.game.create({
    data: {
      p1Id: userId,
      p2Id: null, // Бот не реальный пользователь
      status: 'LOBBY',
      width: 10,
      height: 10,
      ruleSetId: ruleSet.id,
      turnUserId: userId, // Игрок начинает первым
      isVsBot: true, // Помечаем как игру с ботом
      botDifficulty: difficulty.toUpperCase(),
    },
  });

  // Создание доски бота
  const board = await prisma.board.create({
    data: {
      gameId: game.id,
      ownerId: 'bot-' + game.id, // ID бота
      dataJson: botBoardJson,
      ready: true,
    },
  });

  // Создание стратегии бота
  const strategy = new BotStrategy(difficulty);
  botStrategies.set(game.id, strategy);

  return { gameId: game.id, botBoardId: board.id };
}

// Выстрел бота
export async function botMakeTurn(gameId: string): Promise<{
  x: number;
  y: number;
  result: ShotResult;
  gameOver?: boolean;
}> {
  const strategy = botStrategies.get(gameId);
  if (!strategy) {
    throw new Error('Bot strategy not found');
  }

  // Получение доски игрока
  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { boards: true },
  });

  if (!game) {
    throw new Error('Game not found');
  }

  // Получение доски игрока (не бота)
  const playerBoard = game.boards.find((b) => !b.ownerId.includes('-bot'));
  if (!playerBoard) {
    throw new Error('Player board not found');
  }

  const board = deserializeBoard(playerBoard.dataJson);

  // Выстрел бота
  const shot = strategy.getNextShot(10, 10);
  const result = resolveShot(board, shot);

  // Сохранение выстрела
  await prisma.shot.create({
    data: {
      gameId,
      shooterId: game.p1Id + '-bot',
      x: shot.x,
      y: shot.y,
      result: result.type,
    },
  });

  // Обновление стратегии
  strategy.processResult(shot, result);

  // Проверка окончания игры
  const updatedBoard = deserializeBoard(playerBoard.dataJson);
  updatedBoard.hits.push(shot);

  const gameOver = isGameOver({
    ...updatedBoard,
    hits: [...updatedBoard.hits, shot],
  });

  if (gameOver) {
    await prisma.game.update({
      where: { id: gameId },
      data: {
        status: 'FINISHED',
        winnerId: game.p1Id + '-bot', // Бот выиграл
      },
    });
  }

  return { x: shot.x, y: shot.y, result, gameOver };
}

// Удаление стратегии (cleanup)
export function removeBotStrategy(gameId: string): void {
  botStrategies.delete(gameId);
}

