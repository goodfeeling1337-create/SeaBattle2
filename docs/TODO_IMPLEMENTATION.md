# TODO: Что еще нужно реализовать

Список незавершенных фич и функций для полноценной работы приложения.

## 🔴 Критичные (для работы)

### 1. WebSocket клиент-сервер интеграция

**Проблема**: Клиент не подключается к WebSocket серверу.

**Где**: `src/client/screens/MatchmakingScreen.tsx:13`

**Нужно**:
- Создать WebSocket хук (`useWebSocket.ts`)
- Автоматическое подключение при монтировании приложения
- Обработка всех событий (`ready`, `queue:waiting`, `game:started`, etc.)
- Переподключение при обрыве соединения
- Интеграция с `GameContext`

**Файлы для создания**:
```
src/client/hooks/useWebSocket.ts
src/client/services/websocket.ts
```

---

### 2. Логика размещения кораблей

**Проблема**: UI есть, но функционала нет.

**Где**: `src/client/screens/PlacementScreen.tsx:24`

**Нужно**:
- Интерактивная доска 10x10
- Drag & Drop или click-to-place для кораблей
- Валидация позиций (размеры кораблей, нет касаний)
- Визуальное отображение размещенных кораблей
- Кнопка "Авторазмещение" (random)
- Отправка доски на сервер через WebSocket (`game:board.set`)
- Интеграция с domain/rules.ts для валидации

**Компоненты**:
```tsx
src/client/components/GameBoard.tsx
src/client/components/ShipSelector.tsx
```

---

### 3. Игровой процесс (стрельба)

**Проблема**: Доска отображается, но стрелять нельзя.

**Где**: `src/client/screens/BattleScreen.tsx:28`

**Нужно**:
- Отображение доски противника
- Fog of war (скрывать неподсвеченные клетки)
- Обработка кликов для выстрела
- Отправка через WebSocket (`game:shot.fire`)
- Обновление UI при получении результатов
- Визуальное отображение:
  - 🔴 Промахи (белые кружки)
  - 🔴 Попадания (красные крестики)
  - 🔵 Потопленные корабли (обведены)
- Переключение хода между игроками
- Отображение "Ваш ход" / "Ход противника"

---

### 4. Валидация доски на сервере

**Проблема**: Сервер принимает любую доску без проверки.

**Где**: `src/server/realtime.ts:190`

**Нужно**:
- Парсить JSON доски
- Проверить количество кораблей каждого размера
- Проверить валидность позиций через `domain/rules.ts`
- Вернуть ошибку если доска невалидна
- Логировать попытки читерства

**Код**:
```typescript
import { validateBoard, parseShipConfig } from '../domain/rules';
import { deserializeBoard } from '../domain/board';

// В handleBoardSet
const ruleSet = await prisma.ruleSet.findFirst({ where: { id: game.ruleSetId } });
if (!validateBoard(deserializeBoard(payload.board), ruleSet)) {
  return ws.send(JSON.stringify({ type: 'error', error: 'Invalid board' }));
}
```

---

### 5. Приватные комнаты

**Проблема**: Не реализован функционал игры по коду.

**Где**: `src/server/realtime.ts:178`

**Нужно**:
- Создать таблицу `PrivateRoom` или использовать временное хранилище
- Генерация и валидация кодов комнат (4 символа)
- Событие `game:room.join` { roomCode }
- Хранение `roomCode → gameId` маппинга
- Проверка что комната существует и свободна
- Ограничение на 2 игрока

**Структура**:
```prisma
model PrivateRoom {
  id        String   @id @default(cuid())
  code      String   @unique
  gameId    String
  createdAt DateTime @default(now())
  expiresAt DateTime
}
```

---

### 6. Получение скинов через API

**Проблема**: Клиент не загружает скины.

**Где**: `src/client/screens/SkinsScreen.tsx:14`

**Нужно**:
- Создать API клиент (`src/client/api/client.ts`)
- Fetch на `/api/skins`
- Обработка состояний (loading, error, success)
- Парсинг ответа и обновление состояния

**Код**:
```typescript
const response = await fetch('/api/skins', {
  headers: {
    'X-Telegram-Init-Data': window.Telegram?.WebApp.initData || '',
  },
});
const skins = await response.json();
```

---

### 7. Экипировка скинов

**Проблема**: Кнопка не делает ничего.

**Где**: `src/client/screens/SkinsScreen.tsx:48`

**Нужно**:
- POST на `/api/skins/equip` { skinId }
- Обновление UI (визуальное отображение экипированного)
- Toast уведомление
- Сохранение в `GameContext.currentSkin`

---

### 8. Broadcast к конкретным пользователям

**Проблема**: Не реализована рассылка по userId.

**Где**: `src/server/realtime.ts:373`

**Нужно**:
- Сохранять маппинг `userId → WebSocket[]`
- Функция `broadcastToUser(userId, message)`
- Хранение активных соединений в `activeConnections`

**Код**:
```typescript
const activeConnections = new Map<string, Set<ClientConnection>>();

// При подключении
if (ws.userId) {
  const userConnections = activeConnections.get(ws.userId) || new Set();
  userConnections.add(ws);
  activeConnections.set(ws.userId, userConnections);
}

function broadcastToUser(userId: string, message: any) {
  const connections = activeConnections.get(userId);
  if (!connections) return;
  connections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}
```

---

## 🟡 Важные (для UX)

### 9. Система уведомлений

**Нужно**:
- Toast компонент для успешных действий
- Error banner для ошибок
- Loading spinner для загрузки

**Компоненты**:
```tsx
src/client/components/Toast.tsx
src/client/components/Banner.tsx
src/client/contexts/NotificationContext.tsx
```

---

### 10. Обработка ошибок

**Нужно**:
- Try-catch во всех местах сетевых запросов
- Fallback UI при ошибках
- Error boundary для React

---

### 11. Оптимистичные обновления

**Нужно**:
- Мгновенное обновление UI
- При ошибке - откат к предыдущему состоянию

---

### 12. Responsive дизайн

**Нужно**:
- Адаптация под маленькие экраны (compact mode)
- Оптимизация для portrait/landscape
- Telegram Viewport API

---

## 🟢 Желательно (для продакшена)

### 13. Аналитика и логирование

**Нужно**:
- Структурированные логи (Pino/Winston)
- Request ID tracking
- Метрики (игры/минуту, средняя длительность)
- Отправка в Sentry при ошибках

---

### 14. Rate Limiting

**Нужно**:
- Защита от спама выстрелов
- Ограничение попыток подключения
- Express-rate-limit middleware

---

### 15. Тесты

**Нужно**:
```typescript
// Unit тесты
src/domain/__tests__/board.test.ts
src/domain/__tests__/shoot.test.ts
src/domain/__tests__/rules.test.ts

// Integration тесты
src/server/__tests__/auth.test.ts
src/api/__tests__/game.test.ts
```

---

### 16. i18n (интернационализация)

**Нужно**:
- react-i18next или похожее
- Поддержка русского и английского
- Выбор языка пользователем

---

### 17. Монетизация

**Нужно**:
- Интеграция с Telegram Stars или криптоплатежами
- Покупка скинов
- Бонусы за победы

---

### 18. Компоненты для доски

**Нужно**:
- `Board.tsx` - отображение доски
- `Cell.tsx` - одна клетка
- `Ship.tsx` - визуализация корабля
- `FogOfWar.tsx` - туман войны

---

## 📋 Чеклист реализации

### Клиент
- [ ] WebSocket подключение
- [ ] Размещение кораблей
- [ ] Игровой процесс (стрельба)
- [ ] Получение скинов из API
- [ ] Экипировка скинов
- [ ] Toast уведомления
- [ ] Error handling
- [ ] Optimistic updates

### Сервер
- [ ] Валидация доски
- [ ] Приватные комнаты
- [ ] Broadcast к пользователям
- [ ] Rate limiting
- [ ] Логирование

### Тесты
- [ ] Unit тесты для domain
- [ ] Integration тесты для API
- [ ] E2E тесты для игры

### Дополнительно
- [ ] i18n
- [ ] Аналитика
- [ ] Монетизация
- [ ] Оптимизация bundle size

---

**Приоритет реализации**:
1. WebSocket клиент → размещение → игровой процесс (минимальный playable)
2. Валидация на сервере + приватные комнаты (полноценный функционал)
3. Скины + ошибки + UX (polish)
4. Тесты + аналитика + монетизация (продакшн)

