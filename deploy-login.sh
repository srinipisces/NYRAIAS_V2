#!/bin/bash

# === Config ===
APP_NAME=login-app
PEM_FILE=./SamCarbon.pem       # 🔁 Update this path
SERVER_USER=ubuntu                    # ✅ Ubuntu confirmed
SERVER_IP=ec2-13-53-148-190.eu-north-1.compute.amazonaws.com  # 🔁 Update this
SERVER_PATH=/home/ubuntu/NYRAIAS_V2/tenants/root
NGINX_CONTAINER=multi_tenant_nginx          # Docker container name

# === Validations ===
if [ ! -f "$PEM_FILE" ]; then
  echo "❌ PEM file not found at $PEM_FILE"
  exit 1
fi

if [ ! -d "$APP_NAME" ]; then
  echo "❌ $APP_NAME folder not found"
  exit 1
fi

cd "$APP_NAME" || exit 1

if [ ! -f .env.production ]; then
  echo "❌ .env.production not found in $APP_NAME"
  exit 1
fi

echo "🏗 Building $APP_NAME..."

# Temporarily override .env
cp .env.production .env

pnpm install
pnpm run build || { echo "❌ Build failed"; exit 1; }

# Restore .env
git checkout .env

cd ..

echo "📤 Uploading built login-app to server..."

# Ensure root folder exists on server
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH"

# Copy dist to /root/
scp -i "$PEM_FILE" -r "$APP_NAME/dist/"* "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"

# Reload NGINX
echo "♻️ Reloading NGINX..."
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" "docker exec $NGINX_CONTAINER nginx -s reload"

echo "✅ $APP_NAME deployed at http://$SERVER_IP/"
