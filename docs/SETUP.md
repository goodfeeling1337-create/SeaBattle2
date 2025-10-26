# Setup Guide

Данный документ описывает процесс настройки проекта SeaBattle MiniApp.

## Требования

- Node.js 20+ (установка через [nvm](https://github.com/nvm-sh/nvm))
- PostgreSQL 14+
- Telegram Bot Token

## Установка

1. **Клонирование репозитория**

```bash
git clone <repo-url>
cd seabattle
```

2. **Установка зависимостей**

```bash
npm install
```

3. **Настройка базы данных**

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните переменные:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/seabattle?schema=public"
BOT_TOKEN="YOUR_BOT_TOKEN"
APP_URL="https://your-miniapp-url.com"
ADMIN_IDS="123456789"
NODE_ENV="development"
```

4. **Инициализация базы данных**

```bash
# Генерация Prisma Client
npm run db:generate

# Применение миграций
npm run db:migrate

# Заполнение начальными данными
npm run db:seed
```

## Разработка

Запуск сервера разработки (клиент + сервер):

```bash
npm run dev
```

Отдельные серверы:

```bash
# Клиент (порт 3000)
npm run dev:client

# Сервер (порт 8080)
npm run dev:server
```

## Прочее

### Проверка типов

```bash
npm run typecheck
```

### Линтинг

```bash
npm run lint
npm run lint:fix
```

### Тестирование

```bash
npm test
npm run test:watch
```

### Форматирование

```bash
npm run format
```

## Получение BOT_TOKEN

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен
3. Добавьте токен в `.env`

## Telegram InitData

Для локальной разработки используйте тестовые данные из Telegram WebApp. В продакшене данные будут автоматически предоставлены Telegram.

Пример тестовых данных:

```javascript
window.Telegram.WebApp.initData = "user=%7B%22id%22%3A123456789%7D&auth_date=1234567890&hash=...";
```

## Troubleshooting

### Ошибка подключения к БД

Убедитесь, что PostgreSQL запущен и `DATABASE_URL` корректен:

```bash
psql $DATABASE_URL -c "SELECT 1"
```

### Проблемы с миграциями

Сброс и повторная миграция:

```bash
# Осторожно: удалит все данные
npm run db:push
npm run db:seed
```

