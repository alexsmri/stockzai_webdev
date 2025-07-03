#!/usr/bin/env bash
set -e

LOCK_FILE="/tmp/web-deploy.lock"
trap 'rm -f "$LOCK_FILE"' EXIT

if [ -e "$LOCK_FILE" ]; then
  echo "$(date): Deployment already running."
  exit 1
fi

touch "$LOCK_FILE"

echo "$(date): Pulling latest code..."
git pull

echo "$(date): Building new backend and frontend images..."
docker compose -f docker-compose.prod.yml build backend frontend

echo "$(date): Running frontend copy..."
docker compose -f docker-compose.prod.yml run --rm frontend

echo "$(date): Running migrations..."
docker compose -f docker-compose.prod.yml run --rm backend python manage.py migrate

echo "$(date): Collecting static files..."
docker compose -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --noinput

echo "$(date): Rebuilding and restarting nginx and backend..."
docker compose -f docker-compose.prod.yml up -d backend nginx

echo "$(date): Deployment complete."
