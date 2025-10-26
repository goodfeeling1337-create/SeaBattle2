import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// Валидация конфигурации
const ConfigSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Telegram Bot
  BOT_TOKEN: z.string().min(1),
  APP_URL: z.string().url(),

  // Admin
  ADMIN_IDS: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((id) => id.trim()) : [])),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Server
  PORT: z.string().default('8080'),
});

export type Config = z.infer<typeof ConfigSchema>;

let config: Config | null = null;

// Безопасный парсинг конфигурации
export function getConfig(): Config {
  if (!config) {
    try {
      config = ConfigSchema.parse(process.env);
    } catch (error) {
      console.error('❌ Invalid configuration:', error);
      throw new Error('Invalid environment configuration. Check .env file.');
    }
  }
  return config;
}

// Проверка, является ли пользователь админом
export function isAdmin(telegramId: string): boolean {
  const cfg = getConfig();
  return cfg.ADMIN_IDS?.includes(telegramId) ?? false;
}

