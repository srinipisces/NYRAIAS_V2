#!/bin/bash

# === Config ===
APP_NAME=login-app                        # 🔁 Your testbed app folder (local)
PEM_FILE=./SamCarbon.pem                # 🔁 Update if needed
SERVER_USER=ubuntu
SERVER_IP=ec2-16-171-240-125.eu-north-1.compute.amazonaws.com
SERVER_PATH=/home/ubuntu/testbed/tenants/testbed-root
NGINX_CONTAINER=testbed_nginx      # Nginx container name

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

if [ ! -f .env.testbed ]; then
  echo "❌ .env.testbed not found in $APP_NAME"
  exit 1
fi

echo "🏗 Building $APP_NAME for testbed..."

# Temporarily override .env with testbed env
# cp .env.testbed .env
cp vite.config.testbed.js vite.config.js
cp ./src/main.testbed.jsx ./src/main.jsx

pnpm install
pnpm run build:testbed || { echo "❌ Build failed"; exit 1; }

# Restore .env (assuming it's tracked / your default dev env)
#git checkout .env

cd ..

echo "📤 Uploading built $APP_NAME to server (testbed)..."

# Ensure testbed folder exists on server
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" "mkdir -p $SERVER_PATH"

# Copy dist content to testbed tenant folder
scp -i "$PEM_FILE" -r "$APP_NAME/dist/"* "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"

# Reload NGINX inside container
echo "♻️ Reloading NGINX..."
ssh -i "$PEM_FILE" "$SERVER_USER@$SERVER_IP" "docker exec $NGINX_CONTAINER nginx -s reload"

echo "✅ $APP_NAME (testbed) deployed at https://nyraias.com/testbed/"
