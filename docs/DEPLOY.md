# Deployment Guide

## Production Checklist

### 1. Environment Variables

Убедитесь, что все переменные установлены:

```bash
DATABASE_URL="postgresql://..."
BOT_TOKEN="..."
APP_URL="https://your-domain.com"
ADMIN_IDS="..."
NODE_ENV="production"
```

### 2. Database

```bash
# Применить миграции
npm run db:migrate:deploy

# Повторное заполнение (если нужно)
npm run db:seed
```

### 3. Build

```bash
npm run build
```

### 4. Health Check

```bash
curl https://your-domain.com/health
```

Должен вернуть:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## Платформы

### Vercel

1. Подключите GitHub репозиторий
2. Установите переменные окружения
3. Deploy автоматически

Рекомендуется для клиентской части.

### Railway

1. `railway login`
2. `railway init`
3. Добавьте PostgreSQL addon
4. `railway up`

Подходит для full-stack.

### DigitalOcean App Platform

1. Создайте приложение из GitHub
2. Добавьте PostgreSQL database
3. Установите env variables
4. Deploy

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
```

Build & Run:

```bash
docker build -t seabattle .
docker run -p 8080:8080 --env-file .env seabattle
```

## Мониторинг

### Logs

```bash
# Railway
railway logs

# Vercel
vercel logs

# Docker
docker logs <container-id>
```

### Metrics

Добавьте endpoint для метрик (опционально):

```typescript
app.get('/metrics', (req, res) => {
  res.json({
    activeGames: activeGames.size,
    connectedUsers: wss.clients.size,
  });
});
```

## Troubleshooting

### Database Connection

Проверьте `DATABASE_URL`:

```bash
psql $DATABASE_URL -c "SELECT 1"
```

### WebSocket Issues

Убедитесь что поддерживается WebSocket upgrade:

- Vercel: requires custom setup
- Railway: работает из коробки
- Docker: работает из коробки

### SSL/TLS

Telegram требует HTTPS. Автоматические сертификаты:

- Vercel: автоматически
- Railway: автоматически
- DigitalOcean: автоматически

## Rollback

При проблемах:

```bash
# Railway
railway rollback

# Vercel
vercel rollback

# Docker
docker tag seabattle:previous seabattle:latest
```

## CI/CD

Пример `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway/railway-action@v1
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
```

