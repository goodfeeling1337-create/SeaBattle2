#!/bin/bash
# Скопируйте этот файл на сервер и выполните там

echo "🚀 Starting SeaBattle deployment..."

# 1. Проверка и удаление старых проектов
echo "Checking for existing projects..."
ls -la /var/www/
rm -rf /var/www/seabattle /var/www/seabattle2 /var/www/*battle* 2>/dev/null
echo "✅ Old projects removed"

# 2. Установка пакетов
echo "Installing packages..."
apt-get update -y
apt-get install -y nodejs npm postgresql postgresql-contrib git nginx

# 3. Создание директории
echo "Creating project directory..."
mkdir -p /var/www/seabattle
cd /var/www/seabattle

# 4. Клонирование проекта
echo "Cloning repository..."
git clone https://github.com/goodfeeling1337-create/SeaBattle2.git .

# 5. Установка зависимостей
echo "Installing dependencies..."
npm install

# 6. Настройка PostgreSQL
echo "Setting up database..."
sudo -u postgres createdb seabattle 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER seabattle WITH PASSWORD 'seabattle123';" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE seabattle TO seabattle;" 2>/dev/null || true

# 7. Создание .env
echo "Creating .env file..."
cat > .env << 'EOF'
DATABASE_URL="postgresql://seabattle:seabattle123@localhost:5432/seabattle?schema=public"
BOT_TOKEN=""
APP_URL="http://94.228.124.97"
ADMIN_IDS=""
NODE_ENV="production"
PORT="8080"
EOF

# 8. Prisma
echo "Generating Prisma client..."
npm run db:generate
npm run db:push

# 9. Сборка
echo "Building application..."
npm run build

# 10. PM2
echo "Installing PM2..."
npm install -g pm2

# 11. Запуск
echo "Starting application..."
pm2 delete seabattle 2>/dev/null || true
pm2 start npm --name "seabattle" -- start
pm2 save
pm2 startup

# 12. Nginx
echo "Configuring Nginx..."
cat > /etc/nginx/sites-available/seabattle << 'NGINXEOF'
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
NGINXEOF

ln -sf /etc/nginx/sites-available/seabattle /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

echo "✅ Deployment complete!"
echo "Check status with: pm2 list"
echo "View logs with: pm2 logs seabattle"
echo "Access at: http://94.228.124.97"

