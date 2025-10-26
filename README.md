# SeaBattle MiniApp

Морской бой — классическая игра для Telegram Mini App.

## 🎮 Описание

Играйте в "Морской бой" прямо в Telegram! Разместите свои корабли, стреляйте по противнику и потопите все его корабли первым.

### Особенности

- ✅ Реалистичная механика "Морского боя"
- ✅ Автоматический матчмейкинг
- ✅ Система косметических скинов
- ✅ Безопасная аутентификация через Telegram
- ✅ Поддержка мини-приложения Telegram

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 20+
- PostgreSQL 14+
- Telegram Bot Token

### Установка

```bash
# Клонирование репозитория
git clone <repo-url>
cd seabattle

# Установка зависимостей
npm install

# Настройка окружения
cp .env.example .env
# Отредактируйте .env

# Инициализация базы данных
npm run db:generate
npm run db:migrate
npm run db:seed

# Запуск разработки
npm run dev
```

Откройте http://localhost:3000 в браузере или настройте Telegram Mini App.

## 📖 Документация

- [Настройка проекта](docs/SETUP.md)
- [Архитектура](docs/ARCHITECTURE.md)
- [Контрибьютинг](docs/CONTRIBUTING.md)
- [Telegram Mini App](docs/MINIAPP.md)
- [Правила игры](docs/GAME_RULES.md)
- [Деплой](docs/DEPLOY.md)
- [Release Notes](docs/RELEASE_NOTES.md)

## 🛠 Скрипты

```bash
npm run dev          # Разработка (клиент + сервер)
npm run build        # Сборка для продакшена
npm start            # Запуск продакшн сборки
npm run lint         # Проверка кода
npm run typecheck    # Проверка типов
npm test             # Тесты
npm run db:migrate   # Применить миграции
npm run db:seed      # Заполнить начальными данными
```

## 🏗 Технологии

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express, WebSocket (ws)
- **Database**: PostgreSQL, Prisma ORM
- **Build**: Vite, ESBuild
- **Testing**: Vitest
- **Linting**: ESLint, Prettier

## 📁 Структура проекта

```
├── src/
│   ├── client/      # React клиент
│   ├── server/      # Express сервер
│   ├── domain/      # Бизнес-логика
│   └── types.ts     # Общие типы
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docs/            # Документация
└── public/          # Статические файлы
```

## 🎯 Дорожная карта

- [x] Базовая игровая механика
- [x] Система скинов
- [x] Telegram интеграция
- [ ] Монетизация
- [ ] Рейтинг и лидерборды
- [ ] Чаты
- [ ] Режим кампании

## 🤝 Контрибьютинг

См. [CONTRIBUTING.md](docs/CONTRIBUTING.md)

## 📄 Лицензия

MIT

## 👥 Контакты

Если у вас есть вопросы или предложения, откройте issue в GitHub.

---

Сделано с ❤️ для Telegram Mini Apps

