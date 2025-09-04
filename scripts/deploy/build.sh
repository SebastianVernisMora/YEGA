#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[deploy] Building frontend..."
cd "$ROOT_DIR/frontend"
npm ci
npm run build

echo "[deploy] Frontend built at frontend/dist"
echo "[deploy] To start API with PM2 in production:"
echo "         cd $ROOT_DIR/backend && npm run pm2:start"

