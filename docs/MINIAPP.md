# Telegram Mini App Setup

## Обзор

SeaBattle MiniApp интегрирован с Telegram через Mini Apps API.

## Инициализация

При загрузке приложения Telegram предоставляет:

```javascript
window.Telegram.WebApp.ready()
window.Telegram.WebApp.initData // для аутентификации
```

## WebApp Options

В BotFather при создании мини-приложения укажите:

```
https://your-domain.com/
```

Опубликуйте по ссылке:
```
https://t.me/YOUR_BOT?startapp=SEABATTLE
```

## Деплой

### Vercel

```bash
npm i -g vercel
vercel --prod
```

Укажите переменные окружения в Vercel Dashboard.

### Railway

```bash
railway login
railway init
railway up
```

Настройте `.env` через Railway UI.

### Docker

```bash
docker build -t seabattle .
docker run -p 8080:8080 --env-file .env seabattle
```

## Окружение

Мини-приложение должно быть доступно по HTTPS.

Для разработки:
- Используйте ngrok: `ngrok http 3000`
- Добавьте URL в BotFather

## Безопасность

- `initData` обязательно валидируется на сервере
- Используется HMAC-SHA256 с BOT_TOKEN
- Проверяется `auth_date` (не старше 24ч)
- Валидация координат на сервере
- Защита от replay-атак

## Локальная разработка

Для тестирования локально:

1. Получите `initData` из Telegram
2. Скопируйте в браузер консоль
3. Имитируйте `window.Telegram.WebApp`

```javascript
window.Telegram = {
  WebApp: {
    ready: () => {},
    expand: () => {},
    initData: "user=...&auth_date=...&hash=...",
    MainButton: { show: () => {}, hide: () => {}, onClick: () => {} },
  }
}
```

