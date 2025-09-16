#!/bin/bash

# === Required Config ===
TENANT_NAME=$1
PEM_FILE=./SamCarbon.pem       # 🔁 Update this path
SERVER_USER=ubuntu                    # ✅ Ubuntu confirmed
SERVER_IP=ec2-13-53-148-190.eu-north-1.compute.amazonaws.com  # 🔁 Update this
SERVER_PATH=/home/ubuntu/NYRAIAS_V2/tenants
NGINX_CONTAINER=multi_tenant_nginx    # your nginx Docker container name

# === Validations ===
if [ -z "$TENANT_NAME" ]; then
  echo "Usage: ./deploy.sh <tenant-name>"
  exit 1
fi

if [ ! -f "$PEM_FILE" ]; then
  echo "❌ PEM file not found at $PEM_FILE"
  exit 1
fi

echo "🏗 Building tenant: $TENANT_NAME"

cd "$TENANT_NAME" || { echo "❌ Tenant folder '$TENANT_NAME' not found"; exit 1; }

if [ ! -f .env.production ]; then
  echo "❌ .env.production not found in $TENANT_NAME"
  exit 1
fi

# Use .env.production temporarily
cp .env.production .env

# Build the Vite app
pnpm install
pnpm run build || { echo "❌ Build failed"; exit 1; }

# Restore original .env (safe reset)
git checkout .env

cd ..

echo "📤 Copying dist/* to $SERVER_USER@$SERVER_IP..."

# Create tenant folder on remote server
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH/$TENANT_NAME"

# Copy built files to server
scp -i "$PEM_FILE" -r "$TENANT_NAME/dist/"* "$SERVER_USER@$SERVER_IP:$SERVER_PATH/$TENANT_NAME/"

# Reload nginx inside docker
echo "♻️ Reloading NGINX..."
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" "docker exec $NGINX_CONTAINER nginx -s reload"

echo "✅ $TENANT_NAME deployed at http://$SERVER_IP/$TENANT_NAME/"
