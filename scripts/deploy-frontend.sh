#!/bin/bash
set -e

SERVER="root@173.212.239.43"
REMOTE_DIR="/var/www/ugc-station/frontend"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)/frontend"

echo "==> Building frontend..."
cd "$LOCAL_DIR"
npm run build

echo "==> Uploading dist..."
rsync -avz --delete "$LOCAL_DIR/dist/" "$SERVER:$REMOTE_DIR/dist/"

echo "==> Frontend deployed!"
echo "    https://ugcstation.org"
