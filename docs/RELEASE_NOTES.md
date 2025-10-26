# Release Notes

## v0.1.0 - Initial Release

### ✨ Новые функции

#### 🎮 Игровой процесс
- Классический "Морской бой" на двое
- Автоматический матчмейкинг через WebSocket
- Размещение кораблей с валидацией правил
- Реалистичная система стрельбы (HIT/MISS/SINK)
- Управление очередью ходов

#### 🎨 Система скинов
- Три дефолтных скина (Classic Blue, Dark Minimal, Neon Grid)
- Редкости: Common, Rare, Epic, Legendary
- Экипировка и применение скинов в игре
- Инвентарь пользователя

#### 🔐 Безопасность
- Telegram Mini App аутентификация
- HMAC-SHA256 валидация initData
- Серверная валидация всех действий
- Защита от читерства

### 🛠 Технологии

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Express, WebSocket
- **Database**: PostgreSQL, Prisma ORM
- **Build**: Vite, ESBuild
- **Testing**: Vitest

### 📝 Документация

- Полная документация архитектуры
- Гайды по настройке и разработке
- Описание правил игры
- Инструкции по деплою

### 🚀 Быстрый старт

```bash
# Установка
npm install

# База данных
cp .env.example .env
npm run db:generate
npm run db:migrate
npm run db:seed

# Запуск
npm run dev
```

### 📊 Архитектура

```
Client (React) → WebSocket → Server (Express)
                              ↓
                        Domain Logic
                              ↓
                          PostgreSQL
```

### 🎯 Что дальше

- [ ] Монетизация скинов
- [ ] Режим кампании
- [ ] Рейтинг и лидерборды
- [ ] Чаты между игроками
- [ ] Реклама и бонусы

### 🐛 Известные ограничения

- Нет replay защит для WebSocket
- Базовый матчмейкинг (FIFO)
- Нет поддержки комнат по коду
- Один язык интерфейса (русский)

### 👥 Благодарности

Спасибо всем, кто участвовал в разработке!

---

**Следующая версия**: v0.2.0 (Realtime improvements, advanced matchmaking)

