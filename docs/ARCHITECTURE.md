# Архитектура проекта

## Обзор

SeaBattle MiniApp — это мини-приложение для Telegram с игрой "Морской бой". Проект использует TypeScript, React, Express, WebSocket, и Prisma ORM.

## Структура проекта

```
├── src/
│   ├── client/          # React клиент
│   │   ├── screens/     # Экраны приложения
│   │   ├── components/  # Переиспользуемые компоненты
│   │   └── contexts/     # React контексты
│   ├── server/          # Express сервер
│   │   ├── auth.ts      # Telegram аутентификация
│   │   ├── rest.ts      # REST API endpoints
│   │   └── realtime.ts  # WebSocket обработчик
│   ├── domain/          # Бизнес-логика
│   │   ├── board.ts     # Управление доской
│   │   ├── rules.ts     # Правила игры
│   │   ├── shoot.ts     # Механика стрельбы
│   │   ├── turns.ts     # Управление ходами
│   │   └── matchmaking.ts # Матчмейкинг
│   └── config.ts        # Конфигурация
├── prisma/
│   ├── schema.prisma    # Prisma схема
│   └── seed.ts          # Начальные данные
└── docs/                # Документация
```

## Модули

### Domain (Бизнес-логика)

Чистые функции без зависимостей от фреймворков:

- **rules.ts**: Валидация размещения кораблей по правилам
- **board.ts**: Управление состоянием доски, сериализация
- **shoot.ts**: Обработка выстрелов (HIT/MISS/SINK)
- **turns.ts**: Управление очередностью ходов
- **matchmaking.ts**: Очередь для матчмейкинга

### Server

- **auth.ts**: Telegram Mini App аутентификация
- **realtime.ts**: WebSocket событий для мультиплеера
- **rest.ts**: REST API для внешних интеграций

### Client

React SPA с экранами:

- **HomeScreen**: Главная страница
- **MatchmakingScreen**: Поиск игры
- **PlacementScreen**: Размещение кораблей
- **BattleScreen**: Игровой процесс
- **ResultScreen**: Результаты игры
- **SkinsScreen**: Каталог скинов

## Поток данных

### Инициализация

1. Пользователь открывает Mini App в Telegram
2. Telegram отправляет `initData` (HMAC подписанный)
3. Сервер валидирует через `auth.ts`
4. Создается/обновляется запись в БД
5. Клиент получает WebSocket соединение

### Матчмейкинг

1. Клиент отправляет `game:queue.join`
2. Сервер добавляет в очередь (`matchmakingQueue`)
3. При наличии пары создается `Game`
4. Оба игрока получают `game:started`

### Игра

1. **Placement**: Игроки размещают корабли через `game:board.set`
2. При готовности всех досок статус → `IN_PROGRESS`
3. **Battle**: Игроки стреляют через `game:shot.fire`
4. Сервер валидирует ход, обрабатывает через `shoot.ts`
5. После SINK или победы — статус → `FINISHED`

## База данных

### Основные модели

- **User**: Пользователи Telegram
- **Game**: Игровые сессии
- **Board**: Доски игроков (JSON сериализация)
- **Shot**: История выстрелов
- **RuleSet**: Конфигурация правил
- **Skin**: Косметические скины
- **UserSkin**: Инвентарь пользователя

### Миграции

```bash
npm run db:migrate       # Создать миграцию
npm run db:migrate:deploy # Применить в продакшене
```

## WebSocket Events

### Клиент → Сервер

- `init` - инициализация с `initData`
- `game:queue.join` - вход в очередь
- `game:room.join` - вход в приватную комнату
- `game:board.set` - установка доски
- `game:shot.fire` - выстрел
- `game:state.get` - получение состояния
- `game:forfeit` - сдача

### Сервер → Клиент

- `ready` - успешная аутентификация
- `queue:waiting` - ожидание соперника
- `game:started` - игра начата
- `game:all_ready` - все доски готовы
- `game:shot.result` - результат выстрела
- `game:forfeit` - игрок сдался
- `error` - ошибка

## Безопасность

- **Telegram Auth**: HMAC-SHA256 валидация
- **Rate Limiting**: Защита от спама
- **Turn Validation**: Проверка очереди перед выстрелом
- **Anti-Cheat**: Серверная валидация всех действий
- **Input Validation**: Zod схемы для всех сообщений

## Масштабирование

При росте нагрузки:

1. Добавить Redis для очередей
2. Горизонтальное масштабирование сервера
3. Database connection pooling
4. WebSocket sticky sessions

## Тестирование

```bash
npm test              # Unit тесты
npm run test:watch    # Watch mode
npm run test:ui       # UI тестового раннера
```

Области покрытия:

- Domain logic (rules, board, shoot)
- API endpoints
- Auth flows
- Skins system

