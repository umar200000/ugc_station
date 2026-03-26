#!/bin/bash
set -e

SERVER="root@173.212.239.43"
REMOTE_DIR="/var/www/ugc-station/backend"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)/backend"

echo "==> Deploying backend..."

rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='uploads/*' \
  --exclude='!uploads/.gitkeep' \
  --exclude='prisma/dev.db*' \
  "$LOCAL_DIR/" "$SERVER:$REMOTE_DIR/"

echo "==> Installing dependencies..."
ssh "$SERVER" "cd $REMOTE_DIR && npm install --omit=dev"

echo "==> Running Prisma generate & db push..."
ssh "$SERVER" "cd $REMOTE_DIR && npx prisma generate && npx prisma db push"

echo "==> Restarting backend..."
ssh "$SERVER" "pm2 restart ugc-backend"

echo "==> Backend deployed!"
ssh "$SERVER" "pm2 logs ugc-backend --lines 3 --nostream"
