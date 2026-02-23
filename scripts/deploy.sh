#!/usr/bin/env bash
set -euo pipefail

echo "Building and deploying dungeon-crawler..."
docker compose down || true
docker compose up -d --build
echo ""
echo "Game is live at http://localhost"
