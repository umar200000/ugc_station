#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "  UGC Station — Full Deploy"
echo "=========================================="

"$SCRIPT_DIR/deploy-frontend.sh"
echo ""
"$SCRIPT_DIR/deploy-admin.sh"
echo ""
"$SCRIPT_DIR/deploy-backend.sh"
echo ""
"$SCRIPT_DIR/deploy-bot.sh"

echo ""
echo "=========================================="
echo "  All services deployed!"
echo "  https://ugcstation.org"
echo "  https://admin.ugcstation.org"
echo "=========================================="
