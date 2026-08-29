#!/bin/bash
# Tiflis Kod — VPS Fix & Deploy Script
# ubuntu user, tifliskz.com domain
set -e

DOMAIN="tifliskz.com"
APP_DIR="/var/www/tifliskod"
API_URL="http://${DOMAIN}/api"

echo "🚀 Tiflis Kod deploy başlayır... Domain: $DOMAIN"

# ---- 1. SİSTEM ----
sudo apt-get update -y
sudo apt-get install -y curl git nginx

# ---- 2. NODE.JS 20 ----
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "✅ Node: $(node -v)"

# ---- 3. PM2 ----
sudo npm install -g pm2 2>/dev/null || npm install -g pm2

# ---- 4. REPO ----
if [ -d "$APP_DIR/.git" ]; then
    echo "🔄 Repo yenilənir..."
    sudo git -C "$APP_DIR" fetch --all
    sudo git -C "$APP_DIR" reset --hard origin/main
else
    echo "📥 Repo klonlanır..."
    sudo rm -rf "$APP_DIR"
    sudo git clone https://github.com/usrr12887-oss/tifliskznew.git "$APP_DIR"
fi

sudo chown -R $USER:$USER "$APP_DIR"

# ---- 5. BACKEND ----
echo "⚙️  Backend qurulur..."
cd "$APP_DIR/server"
npm install --production

cat > "$APP_DIR/server/.env" << EOF
TELEGRAM_BOT_TOKEN=8858509631:AAGhgTZ_Sv01hIOHeY5z1qYDLPpTlPfGq9s
TELEGRAM_GROUP_ID=-5282032333
PORT=3001
ALLOWED_ORIGIN=http://${DOMAIN}
ADMIN_PASSWORD=admin123
VAPID_PUBLIC_KEY=BLumTeeeXjXGxmFO-O_owjfXfKy7ZCrgfEofNz4IlduVy_6jzk2p6JAei8pqN_dHfSvgK8sGOK0zR9qjFM9Tick
VAPID_PRIVATE_KEY=q9sdAetwfUJihGRVy_5llIht2V-pRhm1qu-v_1_UCLE
VAPID_EMAIL=mailto:admin@${DOMAIN}
EOF

# ---- 6. FRONTEND BUILD ----
echo "🏗️  Frontend build edilir..."
cd "$APP_DIR"
npm install

# .env.production yarad (build zamanı API URL)
cat > "$APP_DIR/.env.production" << EOF
GENERATE_SOURCEMAP=false
REACT_APP_API_URL=http://${DOMAIN}/api
EOF

npm run build
echo "✅ Build tamamlandı: $(ls build/ | head -3)..."

# ---- 7. PM2 BACKEND ----
cd "$APP_DIR/server"
pm2 delete tifliskod-backend 2>/dev/null || true
pm2 start index.js --name tifliskod-backend
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME 2>/dev/null | grep sudo | bash 2>/dev/null || true

# ---- 8. NGINX ----
echo "🌐 Nginx konfiqurasiya edilir..."

sudo tee /etc/nginx/sites-available/tifliskod > /dev/null << NGINXEOF
server {
    listen 80 default_server;
    server_name ${DOMAIN} www.${DOMAIN} 145.239.73.172;

    root ${APP_DIR}/build;
    index index.html;

    # React SPA
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }

    # Service Worker - no cache
    location = /sw.js {
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Static assets - long cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 15M;
}
NGINXEOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/tifliskod /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx && sudo systemctl enable nginx

# ---- NƏTİCƏ ----
echo ""
echo "================================================"
echo "✅ DEPLOY TAMAMLANDI!"
echo "================================================"
echo "🌐 Sayt:  http://${DOMAIN}"
echo "🌐 Sayt:  http://145.239.73.172"
echo "⚙️  Admin: http://${DOMAIN}/admin"
echo ""
echo "📋 PM2 status:"
pm2 list
echo ""
echo "📋 Nginx:"
sudo systemctl status nginx --no-pager | grep -E "Active|running"
echo ""
echo "📋 Build qovluğu:"
ls $APP_DIR/build/ | head -5
