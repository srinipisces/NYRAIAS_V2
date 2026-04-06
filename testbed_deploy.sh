#!/bin/bash

# === Required Config ===
TENANT_NAME=$1
PEM_FILE=./SamCarbon.pem       # 🔁 Update this path
SERVER_USER=ubuntu                    # ✅ Ubuntu confirmed
SERVER_IP=ec2-16-171-240-125.eu-north-1.compute.amazonaws.com  # 🔁 Update this
SERVER_PATH=/home/ubuntu/testbed/tenants/testbed-activatedcarbon
NGINX_CONTAINER=testbed-nginx    # your nginx Docker container name

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

if [ ! -f .env.testbed ]; then
  echo "❌ .env.testbed not found in $TENANT_NAME"
  exit 1
fi

# Use .env.production temporarily
cp .env.testbed .env
#cp vite.config.testbed.js vite.config.js

# Build the Vite app
pnpm install
pnpm run build:testbed || { echo "❌ Build failed"; exit 1; }

# Restore original .env (safe reset)


cd ..

echo "📤 Copying dist/* to $SERVER_USER@$SERVER_IP..."

# Create tenant folder on remote server
#ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH/$TENANT_NAME"

# Copy built files to server
scp -i "$PEM_FILE" -r "$TENANT_NAME/dist/"* "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"

# Reload nginx inside docker
echo "♻️ Reloading NGINX..."
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" "docker exec $NGINX_CONTAINER nginx -s reload"

echo "✅ $TENANT_NAME deployed at https://nyraias.com/testbed/"
