# Troubleshooting - Игра против бота

## Текущая проблема

Пользователь видит ошибку "Не удалось создать игру с ботом" в Telegram MiniApp.

## Что проверено

✅ Новая сборка клиента деплоится (`index-SThe9X3A.js`)
✅ Nginx конфигурация правильная
✅ Сервер запущен через PM2
✅ SSL сертификат работает

## Возможные причины

### 1. Проблема с Telegram initData
- MiniApp передает невалидный `initData`
- Нужно проверить, что Telegram WebApp правильно настроен

### 2. Проблема с аутентификацией на сервере
- Auth middleware отклоняет запросы
- Нужно проверить логи сервера на наличие ошибок

### 3. Проблема с CORS/proxy
- Запросы не доходят до API
- Нужно проверить, что `/api/game/bot` доступен

## Следующие шаги

1. Проверить логи сервера на ошибки при POST /api/game/bot
2. Проверить, что auth middleware получает корректный initData
3. Добавить больше логирования в rest.ts для debug

## Логирование

```bash
# На сервере
pm2 logs seabattle --lines 100

# Тест создания игры с ботом
curl -X POST https://qualityagency.ru/api/game/bot \
  -H "Content-Type: application/json" \
  -H "X-Telegram-Init-Data: <valid_telegram_data>" \
  -d '{"difficulty":"medium"}'
```

