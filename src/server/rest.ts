import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateTelegramAuth, getOrCreateUser } from './auth';
import { isAdmin } from '../config';
import { serializeBoard, deserializeBoard } from '../domain/board';
import { validateBoard } from '../domain/rules';

const prisma = new PrismaClient();

// Расширение типов для Express
interface AuthRequest extends Request {
  userId?: string;
  telegramId?: string;
}

export function setupRestRoutes(app: express.Application): void {
  // Middleware для извлечения и валидации Telegram auth
  app.use(async (req: AuthRequest, res, next) => {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      return res.status(401).json({ error: 'Missing auth header' });
    }

    const auth = await validateTelegramAuth(initData, process.env.BOT_TOKEN!);

    if (!auth) {
      return res.status(401).json({ error: 'Invalid auth' });
    }

    const userId = await getOrCreateUser(auth.user);

    req.userId = userId;
    req.telegramId = auth.user.id;

    next();
  });

  // Получение профиля пользователя
  app.get('/api/me', async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          equippedSkin: true,
          inventory: {
            include: {
              skin: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        softCurrency: user.softCurrency,
        equippedSkin: user.equippedSkin,
        inventory: user.inventory.map((item) => item.skin),
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Получение каталога скинов
  app.get('/api/skins', async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;

      const [skins, userInventory] = await Promise.all([
        prisma.skin.findMany({
          orderBy: [
            { rarity: 'asc' },
            { name: 'asc' },
          ],
        }),
        prisma.userSkin.findMany({
          where: { userId },
          select: { skinId: true },
        }),
      ]);

      const inventorySet = new Set(userInventory.map((i) => i.skinId));

      const equippedSkin = await prisma.user.findUnique({
        where: { id: userId },
        select: { equippedSkinId: true },
      });

      const enrichedSkins = skins.map((skin) => ({
        ...skin,
        owned: inventorySet.has(skin.id),
        equipped: skin.id === equippedSkin?.equippedSkinId,
      }));

      res.json(enrichedSkins);
    } catch (error) {
      console.error('Error fetching skins:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Экипировка скина
  app.post('/api/skins/equip', async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { skinId } = req.body;

      if (!skinId) {
        return res.status(400).json({ error: 'skinId required' });
      }

      // Проверка владения
      const owned = await prisma.userSkin.findUnique({
        where: { userId_skinId: { userId, skinId } },
      });

      if (!owned) {
        return res.status(403).json({ error: 'Skin not owned' });
      }

      // Обновление экипированного скина
      await prisma.user.update({
        where: { id: userId },
        data: { equippedSkinId: skinId },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error equipping skin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Выдача скина (только админам)
  app.post('/api/skins/grant', async (req: AuthRequest, res: Response) => {
    try {
      const telegramId = req.telegramId;

      if (!isAdmin(telegramId)) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const { skinKey } = req.body;

      if (!skinKey) {
        return res.status(400).json({ error: 'skinKey required' });
      }

      const skin = await prisma.skin.findUnique({
        where: { key: skinKey },
      });

      if (!skin) {
        return res.status(404).json({ error: 'Skin not found' });
      }

      // TODO: Grant to specific user or all users
      res.json({ success: true });
    } catch (error) {
      console.error('Error granting skin:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Создание игры с ботом
  app.post('/api/game/bot', async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { difficulty = 'medium' } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { createBotGame } = await import('./bot');
      const { gameId } = await createBotGame(userId, difficulty);

      res.json({ gameId });
    } catch (error) {
      console.error('Error creating bot game:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Ход бота
  app.post('/api/game/:gameId/bot/turn', async (req: AuthRequest, res: Response) => {
    try {
      const { gameId } = req.params;

      if (!gameId) {
        return res.status(400).json({ error: 'gameId required' });
      }

      const { botMakeTurn } = await import('./bot');
      const botTurn = await botMakeTurn(gameId);

      res.json(botTurn);
    } catch (error) {
      console.error('Error making bot turn:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Получение состояния игры
  app.get('/api/game/:gameId/state', async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { gameId } = req.params;

      const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
          boards: true,
          shots: true,
          p1: true,
          p2: true,
        },
      });

      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }

      // Проверка доступа
      if (game.p1Id !== userId && game.p2Id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      res.json({
        game: {
          id: game.id,
          status: game.status,
          turnUserId: game.turnUserId,
          winnerId: game.winnerId,
          players: {
            p1: {
              id: game.p1.id,
              username: game.p1.username,
              ready: game.boards.some((b) => b.ownerId === game.p1Id && b.ready),
            },
            p2: game.p2
              ? {
                  id: game.p2.id,
                  username: game.p2.username,
                  ready: game.boards.some((b) => b.ownerId === game.p2Id && b.ready),
                }
              : null,
          },
        },
      });
    } catch (error) {
      console.error('Error fetching game state:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}

