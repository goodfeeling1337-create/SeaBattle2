# AI Bot - Режим игры против бота

## 📋 Предложение

Добавить возможность играть против ИИ-бота для:
- Тренировки
- Быстрой игры без ожидания
- Оффлайн режима

## 🎯 Требования

### Основные функции бота

1. **Автоматическое размещение кораблей**
   - Случайная генерация позиций
   - Соблюдение всех правил
   - Быстрое размещение

2. **AI для стрельбы**
   - **Режим 1: Random** - случайные выстрелы
   - **Режим 2: Targeted** - логика охоты после попадания
   - **Режим 3: Advanced** - поиск паттернов

3. **Сложности**
   - Easy: Random стрельба
   - Medium: Targeted после попадания
   - Hard: Advanced с запоминанием

## 🏗 Реализация

### Структура файлов

```
src/server/bot/
├── index.ts           # Основной бот
├── placement.ts       # Генерация позиций
├── strategy.ts        # Стратегии стрельбы
└── __tests__/
    └── bot.test.ts
```

### API

```typescript
// Создание игры с ботом
POST /api/game/bot
Body: { difficulty: 'easy' | 'medium' | 'hard' }
Response: { gameId, isMyTurn: true }

// Ход бота (вызывается автоматически после хода игрока)
POST /api/game/:gameId/bot/turn
```

### WebSocket события

```typescript
// Клиент отправляет
{ type: 'game:bot.create', payload: { difficulty } }

// Сервер отправляет
{ type: 'game:bot.turn', payload: { x, y, result } }
{ type: 'game:bot.response', payload: { ... } }
```

## 📐 Алгоритм бота

### Размещение кораблей

```typescript
function generateShips(): Ship[] {
  const ships = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1];
  const board = createEmptyBoard(10, 10);
  
  for (const size of ships) {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 100) {
      const horizontal = Math.random() > 0.5;
      const x = Math.floor(Math.random() * (10 - (horizontal ? size : 0)));
      const y = Math.floor(Math.random() * (10 - (horizontal ? 0 : size)));
      
      const ship = createShip(size, {x, y}, horizontal);
      
      if (isValidPlacement(ship, board)) {
        board.ships.push(ship);
        placed = true;
      }
      attempts++;
    }
  }
  
  return board.ships;
}
```

### Стратегия стрельбы (Medium)

```typescript
class BotStrategy {
  private shots: Position[] = [];
  private hits: Position[] = [];
  private pendingTargets: Position[] = [];
  
  // После попадания - охотиться вокруг
  getNextShot(): Position {
    // Если есть pendingTargets - стрелять туда
    if (this.pendingTargets.length > 0) {
      return this.pendingTargets.shift()!;
    }
    
    // Если был hit - искать рядом
    if (this.hits.length > 0) {
      const lastHit = this.hits[this.hits.length - 1];
      const adjacent = getAdjacentCells(lastHit);
      const unexplored = adjacent.filter(cell => !this.shots.includes(cell));
      
      if (unexplored.length > 0) {
        return unexplored[0];
      }
    }
    
    // Random необстрелянная клетка
    return this.getRandomUnexplored();
  }
  
  processResult(pos: Position, result: ShotResult) {
    this.shots.push(pos);
    
    if (result.type === 'HIT' || result.type === 'SINK') {
      this.hits.push(pos);
      
      // Добавить соседние клетки в pending
      if (result.type === 'HIT') {
        const adjacent = getAdjacentCells(pos);
        this.pendingTargets.push(...adjacent.filter(c => !this.shots.includes(c)));
      }
    }
  }
}
```

## 🔧 Интеграция

### Изменения в БД

```prisma
model Game {
  ...
  isVsBot      Boolean @default(false)
  botDifficulty String?  // null для PvP
  botStrategy   String?  // JSON стратегии
}
```

### Изменения в клиенте

```typescript
// HomeScreen.tsx
<Button onClick={() => navigateTo('matchmaking')} fullWidth>
  Играть онлайн
</Button>
<Button onClick={() => navigateTo('bot-game')} fullWidth>
  Играть против бота
</Button>
```

## 🧪 Тестирование

```typescript
describe('Bot AI', () => {
  it('should place ships validly', () => {
    const ships = generateShips();
    expect(validateBoard({ ships })).toBe(true);
  });
  
  it('should target adjacent cells after hit', () => {
    const bot = new BotStrategy();
    bot.processResult({x:5,y:5}, {type: 'HIT'});
    const next = bot.getNextShot();
    expect(isAdjacent({x:5,y:5}, next)).toBe(true);
  });
});
```

## 📊 Приоритет

- **Важность**: Высокая (расширяет аудиторию)
- **Сложность**: Средняя (2-3 дня)
- **Зависимости**: Базовый функционал работает

## 🎯 Roadmap

1. ✅ День 1: Placement + Basic random AI
2. ✅ День 2: Targeted strategy
3. ✅ День 3: Advanced + UI
4. ✅ День 4: Тесты + Полька

## 💡 Бонусы

- Режим "Быстрая игра" (1 клик)
- Статистика против бота
- Разблокировка скинов за победы

