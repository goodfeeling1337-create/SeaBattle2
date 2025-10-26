# Деплой на сервер 94.228.124.97

## 📋 Предварительные требования

- sshpass (для автоматического ввода пароля)
- SSH доступ к серверу

## 🚀 Быстрый деплой

```bash
# Установка sshpass (если еще нет)
brew install hudochenkov/sshpass/sshpass  # macOS
# или
apt-get install sshpass  # Linux

# Запуск деплоя
./deploy.sh
```

## 📝 Что делает скрипт

### 1. Подключение к серверу
- SSH: `root@94.228.124.97`
- Проверка доступности

### 2. Установка зависимостей
- Node.js 20
- PostgreSQL 14+
- PM2 (process manager)
- Nginx
- Git

### 3. Копирование проекта
- Sync всех файлов через rsync
- Исключение `node_modules`, `.git`, `dist`

### 4. Сборка
- `npm install --production`
- `npm run db:generate`
- `npm run build`

### 5. База данных
- Создание БД `seabattle`
- Выполнение миграций
- Заполнение seeds

### 6. Запуск
- PM2 для автозапуска
- Nginx как reverse proxy

### 7. Nginx конфигурация
- Порт 80 → `localhost:3000` (клиент)
- `/api` → `localhost:8080` (API)
- `/ws` → WebSocket на `localhost:8080`

## 🔧 Ручная настройка

Если хотите настроить вручную:

```bash
# Подключиться к серверу
ssh root@94.228.124.97
# Пароль: aWtjU_TzD+@Fp4

# Клонировать проект
cd /var/www
git clone https://github.com/goodfeeling1337-create/SeaBattle2.git seabattle
cd seabattle

# Установить зависимости
npm install
npm run db:generate

# Настроить .env
cp .env.example .env
nano .env  # Отредактировать BOT_TOKEN и другие

# Подготовить БД
createdb seabattle
npm run db:migrate:deploy
npm run db:seed

# Собрать
npm run build

# Запустить
pm2 start npm --name "seabattle" -- start
pm2 save
```

## 📊 Мониторинг

```bash
# Проверить статус приложения
ssh root@94.228.124.97 "pm2 list"

# Логи
ssh root@94.228.124.97 "pm2 logs seabattle"

# Перезапуск
ssh root@94.228.124.97 "pm2 restart seabattle"

# Nginx статус
ssh root@94.228.124.97 "systemctl status nginx"

# Логи Nginx
ssh root@94.228.124.97 "tail -f /var/log/nginx/error.log"
```

## 🔒 Безопасность

### Рекомендации:

1. **Сменить пароль SSH**:
   ```bash
   ssh root@94.228.124.97 "passwd"
   ```

2. **Настроить SSH ключи**:
   ```bash
   ssh-keygen -t rsa
   ssh-copy-id root@94.228.124.97
   ```

3. **Firewall**:
   ```bash
   ufw allow 22/tcp
   ufw allow 80/tcp
   ufw allow 443/tcp
   ufw enable
   ```

4. **БД пароль**:
   - Изменить пароль в `.env`
   - Обновить `pg_hba.conf`

5. **HTTPS/SSL**:
   - Установить Let's Encrypt
   - Настроить SSL в Nginx

## 🐛 Troubleshooting

### Ошибка подключения
```bash
# Проверить доступность
ping 94.228.124.97
telnet 94.228.124.97 22
```

### Ошибки сборки
```bash
# Убедиться что Node.js установлен
ssh root@94.228.124.97 "node -v"
ssh root@94.228.124.97 "npm -v"
```

### БД ошибки
```bash
# Проверить PostgreSQL
ssh root@94.228.124.97 "sudo systemctl status postgresql"
ssh root@94.228.124.97 "sudo -u postgres psql -c '\l'"
```

### PM2 не запускается
```bash
# Проверить логи
ssh root@94.228.124.97 "pm2 logs seabattle --lines 100"
```

## 📈 Обновление

Для обновления приложения:

```bash
# Обновить код
ssh root@94.228.124.97 "cd /var/www/seabattle && git pull"

# Пересобрать
ssh root@94.228.124.97 "cd /var/www/seabattle && npm run build"

# Перезапустить
ssh root@94.228.124.97 "pm2 restart seabattle"
```

## 🎯 Итог

После деплоя:
- Приложение: http://94.228.124.97
- API: http://94.228.124.97/api
- Health: http://94.228.124.97/health

