#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <tenant-name> [nginx-container-name]"
  exit 1
fi

TENANT=$1
NGINX_CONTAINER=${2:-}

echo "Building React app for tenant: $TENANT"

# Build with env var
(
  cd login-app
  echo "Running build with VITE_ACCOUNT_ID=$TENANT"
  VITE_ACCOUNT_ID=$TENANT npm run build
)

# Copy build output to tenants folder
TARGET_DIR="./tenants/$TENANT"
mkdir -p "$TARGET_DIR"
echo "Copying build to $TARGET_DIR"
cp -r login-app/dist/* "$TARGET_DIR"

# Reload nginx if container name provided
if [ -n "$NGINX_CONTAINER" ]; then
  echo "Reloading nginx container: $NGINX_CONTAINER"
  docker exec "$NGINX_CONTAINER" nginx -s reload
fi

echo "Deployment for tenant '$TENANT' completed."
