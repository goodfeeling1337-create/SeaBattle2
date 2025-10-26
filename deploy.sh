#!/bin/bash

# SeaBattle MiniApp - Deploy Script
# Target: root@94.228.124.97

set -e

echo "🚀 Starting deployment..."

# SSH connection details
SSH_HOST="root@94.228.124.97"
SSH_KEY=""
DEPLOY_PATH="/var/www/seabattle"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check SSH connection
info "Checking SSH connection..."
sshpass -p 'aWtjU_TzD+@Fp4' ssh -o StrictHostKeyChecking=no $SSH_HOST "echo 'Connected'" || {
    error "Cannot connect to server"
    exit 1
}

# Install dependencies on server
info "Installing server dependencies..."
sshpass -p 'aWtjU_TzD+@Fp4' ssh $SSH_HOST << 'ENDSSH'
    # Update system
    apt-get update -y
    
    # Install Node.js 20
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    
    # Install PostgreSQL
    if ! command -v psql &> /dev/null; then
        apt-get install -y postgresql postgresql-contrib
    fi
    
    # Install PM2
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    # Install nginx
    if ! command -v nginx &> /dev/null; then
        apt-get install -y nginx
    fi
    
    # Install git
    if ! command -v git &> /dev/null; then
        apt-get install -y git
    fi
    
    info "Dependencies installed"
ENDSSH

# Create deployment directory
info "Creating deployment directory..."
sshpass -p 'aWtjU_TzD+@Fp4' ssh $SSH_HOST "mkdir -p $DEPLOY_PATH"

# Copy files to server
info "Copying project files..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
    -e "sshpass -p 'aWtjU_TzD+@Fp4' ssh" \
    ./ $SSH_HOST:$DEPLOY_PATH/

# Build and deploy on server
info "Building and deploying on server..."
sshpass -p 'aWtjU_TzD+@Fp4' ssh $SSH_HOST << ENDSSH
    cd $DEPLOY_PATH
    
    # Install npm dependencies
    npm install --production
    
    # Generate Prisma Client
    npm run db:generate
    
    # Build the application
    npm run build
    
    # Setup environment (create .env if not exists)
    if [ ! -f .env ]; then
        cat > .env << 'EOF'
DATABASE_URL="postgresql://seabattle:password@localhost:5432/seabattle?schema=public"
BOT_TOKEN="YOUR_BOT_TOKEN_HERE"
APP_URL="https://94.228.124.97"
ADMIN_IDS=""
NODE_ENV="production"
PORT="8080"
EOF
        info ".env file created"
    fi
    
    # Setup PostgreSQL database
    sudo -u postgres psql << 'SQL'
CREATE DATABASE seabattle;
CREATE USER seabattle WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE seabattle TO seabattle;
\q
SQL
    
    # Run migrations
    npm run db:migrate:deploy || true
    
    # Seed database
    npm run db:seed || true
    
    # Start with PM2
    pm2 delete seabattle || true
    pm2 start npm --name "seabattle" -- start
    pm2 save
    
    info "Application deployed and started"
ENDSSH

# Setup nginx
info "Configuring nginx..."
sshpass -p 'aWtjU_TzD+@Fp4' ssh $SSH_HOST << 'ENDSSH'
    cat > /etc/nginx/sites-available/seabattle << 'EOF'
server {
    listen 80;
    server_name 94.228.124.97;
    
    # Client
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/seabattle /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t && systemctl reload nginx
    
    info "Nginx configured"
ENDSSH

info "✅ Deployment completed!"
info "Visit: http://94.228.124.97"

