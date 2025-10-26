# Ручная установка на сервер 94.228.124.97

## Инструкция для подключения

Так как sshpass не доступен, нужно подключиться вручную:

```bash
ssh root@94.228.124.97
# Пароль: aWtjU_TzD+@Fp4
```

## Команды для выполнения на сервере

```bash
# 1. Проверка и удаление старых проектов
ls -la /var/www/
rm -rf /var/www/seabattle /var/www/seabattle2 /var/www/*battle*

# 2. Установка необходимых пакетов
apt-get update -y
apt-get install -y nodejs npm postgresql postgresql-contrib git nginx

# 3. Создание директории проекта
mkdir -p /var/www/seabattle
cd /var/www/seabattle

# 4. Клонирование проекта (или ручное копирование)
git clone https://github.com/goodfeeling1337-create/SeaBattle2.git .

# 5. Установка зависимостей
npm install

# 6. Настройка базы данных
sudo -u postgres createdb seabattle
sudo -u postgres psql -c "CREATE USER seabattle WITH PASSWORD 'seabattle123';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE seabattle TO seabattle;"

# 7. Настройка .env
cat > .env << 'EOF'
DATABASE_URL="postgresql://seabattle:seabattle123@localhost:5432/seabattle?schema=public"
BOT_TOKEN=""
APP_URL="https://94.228.124.97"
ADMIN_IDS=""
NODE_ENV="production"
PORT="8080"
EOF

# 8. Генерация Prisma и миграции
npm run db:generate
npm run db:push

# 9. Сборка проекта
npm run build

# 10. Установка PM2
npm install -g pm2

# 11. Запуск приложения
pm2 start npm --name "seabattle" -- start
pm2 save
pm2 startup

# 12. Настройка Nginx
cat > /etc/nginx/sites-available/seabattle << 'EOF'
server {
    listen 80;
    server_name 94.228.124.97;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
EOF

ln -sf /etc/nginx/sites-available/seabattle /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# 13. Проверка
pm2 list
pm2 logs seabattle
```

## Проверка работоспособности

```bash
# Проверить что приложение запущено
curl http://localhost:8080/health

# Проверить логи
pm2 logs seabattle

# Проверить веб-сервер
curl http://94.228.124.97
```

## Полезные команды

```bash
# Перезапуск приложения
pm2 restart seabattle

# Логи
pm2 logs seabattle

# Статус
pm2 list

# Nginx статус
systemctl status nginx

# Nginx логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

