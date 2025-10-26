import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Генерация кода комнаты (4 символа)
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Интерфейс для приватной комнаты
export interface RoomData {
  id: string;
  code: string;
  gameId: string | null;
  full: boolean;
  expiresAt: Date;
}

// Создание приватной комнаты
export async function createPrivateRoom(): Promise<RoomData> {
  const code = await generateUniqueRoomCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 минут

  const room = await prisma.privateRoom.create({
    data: {
      code,
      expiresAt,
      full: false,
    },
  });

  return room;
}

// Получение комнаты по коду
export async function getPrivateRoom(code: string): Promise<RoomData | null> {
  const room = await prisma.privateRoom.findUnique({
    where: { code },
  });

  if (!room) {
    return null;
  }

  // Проверка истечения срока
  if (room.expiresAt < new Date()) {
    await prisma.privateRoom.delete({ where: { code } });
    return null;
  }

  return room;
}

// Присоединение к комнате
export async function joinPrivateRoom(
  code: string,
  userId: string,
  gameId: string
): Promise<{ success: boolean; message?: string }> {
  const room = await getPrivateRoom(code);

  if (!room) {
    return { success: false, message: 'Room not found or expired' };
  }

  if (room.full) {
    return { success: false, message: 'Room is full' };
  }

  if (room.gameId) {
    return { success: false, message: 'Room already has a game' };
  }

  // Обновляем комнату
  await prisma.privateRoom.update({
    where: { code },
    data: {
      gameId,
      full: true,
    },
  });

  return { success: true };
}

// Генерация уникального кода комнаты
async function generateUniqueRoomCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateRoomCode();
    const existing = await prisma.privateRoom.findUnique({ where: { code } });

    if (!existing) {
      return code;
    }

    attempts++;
  }

  throw new Error('Failed to generate unique room code');
}

// Удаление истекших комнат (cleanup task)
export async function cleanupExpiredRooms(): Promise<void> {
  const now = new Date();

  await prisma.privateRoom.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });
}

// Получение информации о комнате
export async function getRoomInfo(code: string): Promise<{
  exists: boolean;
  full: boolean;
  hasGame: boolean;
  expiresAt: Date | null;
} | null> {
  const room = await getPrivateRoom(code);

  if (!room) {
    return { exists: false, full: false, hasGame: false, expiresAt: null };
  }

  return {
    exists: true,
    full: room.full,
    hasGame: room.gameId !== null,
    expiresAt: room.expiresAt,
  };
}

