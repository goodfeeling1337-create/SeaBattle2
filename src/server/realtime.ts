import { WebSocketServer, WebSocket } from 'ws';
import { PrismaClient } from '@prisma/client';
import { getConfig } from '../config';
import { validateTelegramAuth, getOrCreateUser } from './auth';
import { resolveShot, isGameOver } from '../domain/shoot';
import { deserializeBoard, serializeBoard } from '../domain/board';
import { switchTurnAfterMiss } from '../domain/turns';
import { MatchmakingQueue } from '../domain/matchmaking';

const prisma = new PrismaClient();
const config = getConfig();

// Глобальная очередь матчмейкинга
const matchmakingQueue = new MatchmakingQueue();

// Хранилище активных соединений
interface ClientConnection extends WebSocket {
  userId?: string;
  gameId?: string;
}

const activeGames = new Map<string, Set<ClientConnection>>();

// Инициализация WebSocket сервера
export function setupRealtimeHandler(wss: WebSocketServer): void {
  wss.on('connection', (ws: ClientConnection) => {
    console.log('📡 New WebSocket connection');

    // Обработка входящих сообщений
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'init') {
          await handleInit(ws, message.initData);
        } else if (ws.userId) {
          await handleGameMessage(ws, message);
        } else {
          ws.send(JSON.stringify({ type: 'error', error: 'Not authenticated' }));
        }
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        );
      }
    });

    // Обработка отключения
    ws.on('close', () => {
      console.log('📡 WebSocket disconnected');
      if (ws.userId && ws.gameId) {
        const gameClients = activeGames.get(ws.gameId);
        if (gameClients) {
          gameClients.delete(ws);
          if (gameClients.size === 0) {
            activeGames.delete(ws.gameId);
          }
        }
      }
    });
  });
}

// Инициализация подключения с Telegram auth
async function handleInit(ws: ClientConnection, initData: string): Promise<void> {
  const auth = await validateTelegramAuth(initData, config.BOT_TOKEN);

  if (!auth) {
    ws.send(JSON.stringify({ type: 'error', error: 'Invalid auth' }));
    ws.close();
    return;
  }

  const userId = await getOrCreateUser(auth.user);

  ws.userId = userId;

  ws.send(JSON.stringify({ type: 'ready', userId }));

  console.log(`✅ User authenticated: ${userId}`);
}

// Обработка игровых сообщений
async function handleGameMessage(ws: ClientConnection, message: any): Promise<void> {
  const { type, payload } = message;

  switch (type) {
    case 'game:queue.join':
      await handleQueueJoin(ws);
      break;

    case 'game:room.join':
      await handleRoomJoin(ws, payload?.roomCode);
      break;

    case 'game:board.set':
      await handleBoardSet(ws, payload);
      break;

    case 'game:shot.fire':
      await handleShotFire(ws, payload);
      break;

    case 'game:state.get':
      await handleStateGet(ws);
      break;

    case 'game:forfeit':
      await handleForfeit(ws);
      break;

    default:
      ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
  }
}

// Присоединение к очереди
async function handleQueueJoin(ws: ClientConnection): Promise<void> {
  if (!ws.userId) return;

  matchmakingQueue.addPlayer(ws.userId);

  const matched = matchmakingQueue.tryMatch();

  if (!matched) {
    ws.send(JSON.stringify({ type: 'queue:waiting' }));
    return;
  }

  const [p1Id, p2Id] = matched;

  // Создание игры
  const game = await prisma.game.create({
    data: {
      p1Id,
      p2Id,
      status: 'IN_PROGRESS',
      width: 10,
      height: 10,
      turnUserId: p1Id,
    },
    include: {
      p1: true,
      p2: true,
    },
  });

  // Отправка уведомлений
  broadcastToUser(p1Id, {
    type: 'game:started',
    payload: {
      gameId: game.id,
      opponent: {
        id: game.p2?.id,
        username: game.p2?.username,
      },
    },
  });

  broadcastToUser(p2Id, {
    type: 'game:started',
    payload: {
      gameId: game.id,
      opponent: {
        id: game.p1?.id,
        username: game.p1?.username,
      },
    },
  });
}

// Присоединение к приватной комнате
async function handleRoomJoin(ws: ClientConnection, roomCode: string): Promise<void> {
  // TODO: Implement room matching
  ws.send(JSON.stringify({ type: 'error', error: 'Not implemented' }));
}

// Установка доски
async function handleBoardSet(ws: ClientConnection, payload: any): Promise<void> {
  if (!ws.userId || !ws.gameId) {
    return ws.send(JSON.stringify({ type: 'error', error: 'Not in game' }));
  }

  const { board } = payload;

  // TODO: Validate board against rules

  // Обновление доски в БД
  await prisma.board.upsert({
    where: { gameId_ownerId: { gameId: ws.gameId, ownerId: ws.userId } },
    create: {
      gameId: ws.gameId,
      ownerId: ws.userId,
      dataJson: serializeBoard(board),
      ready: true,
    },
    update: {
      dataJson: serializeBoard(board),
      ready: true,
    },
  });

  // Проверка обе ли доски готовы
  const boards = await prisma.board.findMany({
    where: { gameId: ws.gameId },
  });

  if (boards.length === 2 && boards.every((b) => b.ready)) {
    await prisma.game.update({
      where: { id: ws.gameId },
      data: { status: 'IN_PROGRESS' },
    });

    broadcastToGame(ws.gameId, {
      type: 'game:all_ready',
    });
  }

  ws.send(JSON.stringify({ type: 'board:set' }));
}

// Выстрел
async function handleShotFire(ws: ClientConnection, payload: any): Promise<void> {
  if (!ws.userId || !ws.gameId) return;

  const { x, y } = payload;

  // Получение игры
  const game = await prisma.game.findUnique({
    where: { id: ws.gameId },
    include: { boards: true },
  });

  if (!game) {
    return ws.send(JSON.stringify({ type: 'error', error: 'Game not found' }));
  }

  // Проверка хода
  if (game.turnUserId !== ws.userId) {
    return ws.send(JSON.stringify({ type: 'error', error: 'Not your turn' }));
  }

  // Проверка дубликатов
  const existingShot = await prisma.shot.findUnique({
    where: { gameId_x_y: { gameId: ws.gameId, x, y } },
  });

  if (existingShot) {
    return ws.send(JSON.stringify({ type: 'error', error: 'Already shot here' }));
  }

  // Получение доски противника
  const opponentBoard = game.boards.find((b) => b.ownerId !== ws.userId);
  if (!opponentBoard) {
    return ws.send(JSON.stringify({ type: 'error', error: 'Opponent board not found' }));
  }

  const board = deserializeBoard(opponentBoard.dataJson);
  const result = resolveShot(board, { x, y });

  // Сохранение выстрела
  await prisma.shot.create({
    data: {
      gameId: ws.gameId,
      shooterId: ws.userId,
      x,
      y,
      result: result.type,
    },
  });

  // Переключение хода после промаха
  if (result.type === 'MISS') {
    const nextTurnUserId = switchTurnAfterMiss(game);
    await prisma.game.update({
      where: { id: ws.gameId },
      data: { turnUserId: nextTurnUserId },
    });
  }

  // Проверка окончания игры
  const updatedBoard = deserializeBoard(opponentBoard.dataJson);
  const gameOver = isGameOver({ ...updatedBoard, hits: [...updatedBoard.hits, { x, y }] });
  
  if (gameOver) {
    await prisma.game.update({
      where: { id: ws.gameId },
      data: {
        status: 'FINISHED',
        winnerId: ws.userId,
      },
    });
    
    result.gameOver = true;
  }

  // Отправка результата
  broadcastToGame(ws.gameId, {
    type: 'game:shot.result',
    payload: { x, y, result },
  });
}

// Получение состояния игры
async function handleStateGet(ws: ClientConnection): Promise<void> {
  if (!ws.userId || !ws.gameId) {
    return;
  }

  const game = await prisma.game.findUnique({
    where: { id: ws.gameId },
    include: {
      boards: true,
      shots: true,
    },
  });

  if (!game) {
    return ws.send(JSON.stringify({ type: 'error', error: 'Game not found' }));
  }

  ws.send(
    JSON.stringify({
      type: 'game:state',
      payload: {
        game: {
          id: game.id,
          status: game.status,
          turnUserId: game.turnUserId,
        },
      },
    })
  );
}

// Сдача
async function handleForfeit(ws: ClientConnection): Promise<void> {
  if (!ws.userId || !ws.gameId) {
    return;
  }

  // Определение противника
  const game = await prisma.game.findUnique({
    where: { id: ws.gameId },
  });

  if (!game || !game.p2Id) {
    return;
  }

  const winnerId = ws.userId === game.p1Id ? game.p2Id : game.p1Id;

  await prisma.game.update({
    where: { id: ws.gameId },
    data: {
      status: 'FINISHED',
      winnerId,
    },
  });

  broadcastToGame(ws.gameId, {
    type: 'game:forfeit',
    payload: { forfeiterId: ws.userId },
  });
}

// Утилиты для рассылки
function broadcastToUser(userId: string, message: any): void {
  // TODO: Implement user-specific broadcast
}

function broadcastToGame(gameId: string, message: any): void {
  const clients = activeGames.get(gameId);
  if (!clients) return;

  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}

