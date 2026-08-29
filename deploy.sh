#!/bin/bash
# Tiflis Kod — VPS Deploy Script
# ubuntu user, sudo ilə
set -e

echo "🚀 Tiflis Kod deploy başlayır..."

# ---- 1. SİSTEM YENİLƏ ----
sudo apt-get update -y
sudo apt-get install -y curl git nginx

# ---- 2. NODE.JS 20 QURAŞDIR ----
if ! command -v node &> /dev/null; then
    echo "📦 Node.js qurulur..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo "✅ Node: $(node -v) | NPM: $(npm -v)"

# ---- 3. PM2 QURAŞDIR ----
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# ---- 4. LAYİHƏNİ KLONLA ----
APP_DIR="/var/www/tifliskod"

if [ -d "$APP_DIR" ]; then
    echo "🔄 Mövcud repo yenilənir..."
    sudo git -C "$APP_DIR" pull origin main
else
    echo "📥 Repo klonlanır..."
    sudo git clone https://github.com/usrr12887-oss/tifliskznew.git "$APP_DIR"
fi

sudo chown -R $USER:$USER "$APP_DIR"

# ---- 5. BACKEND QURAŞDIR ----
echo "⚙️  Backend qurulur..."
cd "$APP_DIR/server"
npm install --production

# Backend .env
cat > "$APP_DIR/server/.env" << 'EOF'
TELEGRAM_BOT_TOKEN=8858509631:AAGhgTZ_Sv01hIOHeY5z1qYDLPpTlPfGq9s
TELEGRAM_GROUP_ID=-5282032333
PORT=3001
ALLOWED_ORIGIN=http://145.239.73.172
ADMIN_PASSWORD=admin123
VAPID_PUBLIC_KEY=BLumTeeeXjXGxmFO-O_owjfXfKy7ZCrgfEofNz4IlduVy_6jzk2p6JAei8pqN_dHfSvgK8sGOK0zR9qjFM9Tick
VAPID_PRIVATE_KEY=q9sdAetwfUJihGRVy_5llIht2V-pRhm1qu-v_1_UCLE
VAPID_EMAIL=mailto:admin@tifliskz.com
EOF

# ---- 6. FRONTEND BUILD ----
echo "🏗️  Frontend build edilir..."
cd "$APP_DIR"
npm install
REACT_APP_API_URL=http://145.239.73.172/api npm run build
echo "✅ Build tamamlandı"

# ---- 7. PM2 İLƏ BACKEND BAŞLAT ----
echo "🤖 Backend PM2 ilə başladılır..."
cd "$APP_DIR/server"
pm2 delete tifliskod-backend 2>/dev/null || true
pm2 start index.js --name tifliskod-backend
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME | grep "sudo" | bash || true

# ---- 8. NGINX KONFİQURASİYA ----
echo "🌐 Nginx konfiqurasiya edilir..."

sudo tee /etc/nginx/sites-available/tifliskod > /dev/null << NGINXEOF
server {
    listen 80 default_server;
    server_name _;

    root /var/www/tifliskod/build;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_cache_bypass \$http_upgrade;
    }

    location /sw.js {
        add_header Cache-Control "no-cache";
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}
NGINXEOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/tifliskod /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ""
echo "============================================"
echo "✅ DEPLOY TAMAMLANDI!"
echo "============================================"
echo "🌐 Sayt:  http://145.239.73.172"
echo "⚙️  Admin: http://145.239.73.172/admin"
echo ""
pm2 list
