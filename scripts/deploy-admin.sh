#!/bin/bash
set -e

SERVER="root@173.212.239.43"
REMOTE_DIR="/var/www/ugc-station/admin"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)/admin"

echo "==> Deploying admin panel..."

# Ensure remote directory exists
ssh "$SERVER" "mkdir -p $REMOTE_DIR"

# Upload admin files
rsync -avz --delete "$LOCAL_DIR/" "$SERVER:$REMOTE_DIR/"

echo "==> Admin panel deployed!"
echo "    https://admin.ugcstation.org"
