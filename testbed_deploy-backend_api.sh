#!/bin/bash

# === Config ===
APP_NAME=backend-api                        # 🔁 Your testbed app folder (local)
PEM_FILE=./SamCarbon.pem                # 🔁 Update if needed
SERVER_USER=ubuntu
SERVER_IP=ec2-16-171-240-125.eu-north-1.compute.amazonaws.com
SERVER_PATH=/home/ubuntu/testbed/testbed-backend_api/
SERVER_PATH_JOBS=/home/ubuntu/testbed/testbed-backend_api/jobs/
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
cp .env.testbed .env



# Restore .env (assuming it's tracked / your default dev env)
#git checkout .env

cd ..

echo "📤 copying $APP_NAME to server (testbed)..."

# Copy dist content to testbed tenant folder
scp -i "$PEM_FILE" -r "$APP_NAME/"*.js "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
scp -i "$PEM_FILE" -r "$APP_NAME/".env "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
scp -i "$PEM_FILE" -r "$APP_NAME/"*.json "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
scp -i "$PEM_FILE" -r "$APP_NAME/"Dockerfile "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
scp -i "$PEM_FILE" -r "$APP_NAME/".dockerignore "$SERVER_USER@$SERVER_IP:$SERVER_PATH/"
scp -i "$PEM_FILE" -r "$APP_NAME/"jobs/* "$SERVER_USER@$SERVER_IP:$SERVER_PATH_JOBS/"

echo "✅ $APP_NAME (testbed) deployed at https://nyraias.com/testbed/"
