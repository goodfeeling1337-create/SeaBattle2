# Quick Start Guide

Быстрый старт за 5 минут.

## Шаг 1: Предварительные требования

- Node.js 20+ ([nvm](https://github.com/nvm-sh/nvm))
- PostgreSQL 14+
- Telegram Bot Token (через [@BotFather](https://t.me/BotFather))

## Шаг 2: Клонирование и установка

```bash
# Клонируйте репозиторий
git clone <repo-url>
cd seabattle

# Установите зависимости
npm install
```

## Шаг 3: Настройка окружения

```bash
cp .env.example .env
```

Отредактируйте `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/seabattle?schema=public"
BOT_TOKEN="YOUR_BOT_TOKEN_HERE"
APP_URL="http://localhost:3000"
ADMIN_IDS="YOUR_TELEGRAM_ID"
NODE_ENV="development"
PORT="8080"
```

### Как получить BOT_TOKEN

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям
4. Скопируйте токен в `.env`

## Шаг 4: База данных

```bash
# Генерация Prisma Client
npm run db:generate

# Создание таблиц
npm run db:migrate

# Заполнение начальными данными
npm run db:seed
```

## Шаг 5: Запуск

```bash
npm run dev
```

Откройте:
- Клиент: http://localhost:3000
- Сервер API: http://localhost:8080
- Health check: http://localhost:8080/health

## Проверка работы

```bash
# Health check
curl http://localhost:8080/health

# Должно вернуть:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## Дальше

- [Подробная установка](SETUP.md)
- [Архитектура проекта](ARCHITECTURE.md)
- [Деплой](DEPLOY.md)

## Troubleshooting

### Ошибка подключения к БД

```bash
# Проверьте что PostgreSQL запущен
psql postgres

# Проверьте DATABASE_URL в .env
psql $DATABASE_URL
```

### Port уже занят

Измените `PORT` в `.env` или убить процесс:

```bash
lsof -ti:8080 | xargs kill -9
```

### Ошибки миграций

```bash
# Сброс и повторная миграция
npm run db:push
npm run db:seed
```

## Telegram тестирование

Для тестирования без Telegram:

```javascript
// В браузерной консоли
window.Telegram = {
  WebApp: {
    ready: () => console.log('ready'),
    expand: () => {},
    initData: "user={...}&auth_date=123&hash=..."
  }
}
```

## Готово! 🎉

Ваш проект запущен и готов к разработке.

