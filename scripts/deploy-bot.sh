#!/bin/bash
set -e

SERVER="root@173.212.239.43"
REMOTE_DIR="/var/www/ugc-station/bot"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)/bot"

echo "==> Deploying bot..."

rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.env' \
  "$LOCAL_DIR/" "$SERVER:$REMOTE_DIR/"

echo "==> Installing dependencies..."
ssh "$SERVER" "cd $REMOTE_DIR && npm install --omit=dev"

echo "==> Restarting bot..."
ssh "$SERVER" "pm2 restart ugc-bot"

echo "==> Bot deployed!"
ssh "$SERVER" "pm2 logs ugc-bot --lines 3 --nostream"
