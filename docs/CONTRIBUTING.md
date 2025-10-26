# Contributing Guide

Спасибо за интерес к проекту SeaBattle MiniApp!

## Процесс разработки

### Правила коммитов

Используйте конвенцию:

```
<type>: <subject>

[optional body]
```

Типы:
- `feat`: Новая функциональность
- `fix`: Исправление бага
- `chore`: Конфигурация, скрипты, зависимости
- `docs`: Изменения в документации
- `refactor`: Рефакторинг кода
- `test`: Тесты
- `style`: Форматирование

Примеры:

```
feat(auth): add Telegram validation
fix(game): prevent duplicate shots
chore: update dependencies
docs: add setup guide
```

### Git Flow

1. Создайте feature branch:
```bash
git checkout -b feature/my-feature
```

2. Внесите изменения, закоммитьте
3. Push в remote:
```bash
git push origin feature/my-feature
```

4. Создайте Pull Request в GitHub

### Code Style

- Используйте TypeScript strict mode
- Включайте ESLint перед коммитом
- Пишите комментарии на русском
- Следуйте SOLID принципам
- Prettier форматирует автоматически

### Тестирование

Все новые фичи должны иметь тесты:

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

### PR Checklist

Перед созданием PR убедитесь:

- [ ] `npm run typecheck` проходит
- [ ] `npm run lint` не выдает ошибок
- [ ] Тесты добавлены и проходят
- [ ] Документация обновлена
- [ ] Миграции корректны
- [ ] Нет hardcoded secrets

## Структура кода

### Добавление нового экрана

1. Создайте файл в `src/client/screens/`
2. Импортируйте в `App.tsx`
3. Добавьте навигацию

### Добавление нового API endpoint

1. Добавьте функцию в `src/server/rest.ts`
2. Добавьте валидацию через Zod
3. Протестируйте

### Добавление domain логики

1. Добавьте функцию в `src/domain/`
2. Она должна быть чистой (pure function)
3. Напишите unit тесты
4. Импортируйте в server/client

## Вопросы

Если возникли вопросы:
- Откройте issue в GitHub
- Свяжитесь с мейнтейнерами

Спасибо за вклад! 🚀

