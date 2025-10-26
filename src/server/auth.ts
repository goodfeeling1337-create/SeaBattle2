import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { getConfig } from '../config';

const prisma = new PrismaClient();

export interface TelegramUser {
  id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
}

export interface ParsedInitData {
  user: TelegramUser;
  auth_date: string;
  hash: string;
  query_id?: string;
}

// Валидация initData от Telegram Mini App
export async function validateTelegramAuth(
  initData: string,
  botToken: string
): Promise<ParsedInitData | null> {
  try {
    // Парсинг строки initData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return null;
    }

    params.delete('hash');

    // Создание строки для проверки
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создание секретного ключа
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисление хеша
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Проверка хеша
    if (calculatedHash !== hash) {
      return null;
    }

    // Проверка даты
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);

    if (now - authDate > 86400) {
      return null; // Данные старше 24 часов
    }

    // Парсинг пользователя
    const userStr = params.get('user');
    if (!userStr) {
      return null;
    }

    const user = JSON.parse(userStr) as TelegramUser;

    return {
      user,
      auth_date: authDate.toString(),
      hash,
    };
  } catch {
    return null;
  }
}

// Получение или создание пользователя
export async function getOrCreateUser(telegramUser: TelegramUser): Promise<string> {
  const config = getConfig();

  const user = await prisma.user.findUnique({
    where: { telegramId: telegramUser.id },
    include: { equippedSkin: true, inventory: { include: { skin: true } } },
  });

  if (user) {
    return user.id;
  }

  // Получение дефолтного скина
  const defaultSkin = await prisma.skin.findFirst({
    where: { isDefault: true },
  });

  const newUser = await prisma.user.create({
    data: {
      telegramId: telegramUser.id,
      username: telegramUser.username,
      displayName: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(' ') || undefined,
      avatarUrl: telegramUser.photo_url,
      equippedSkinId: defaultSkin?.id,
    },
  });

  // Выдача дефолтного скина
  if (defaultSkin) {
    await prisma.userSkin.create({
      data: {
        userId: newUser.id,
        skinId: defaultSkin.id,
        source: 'starter',
      },
    });
  }

  return newUser.id;
}

// Контекст запроса с пользователем
export interface RequestContext {
  userId: string;
  telegramId: string;
}

