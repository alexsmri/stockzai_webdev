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

echo "$(date): Running migrations..."
docker compose -f docker-compose.prod.yml run --rm backend python manage.py migrate

echo "$(date): Collecting static files..."
docker compose -f docker-compose.prod.yml run --rm backend python manage.py collectstatic --noinput

echo "$(date): Bringing up new backend container alongside existing..."
docker compose -f docker-compose.prod.yml up -d --scale backend=2

echo "$(date): Waiting for new backend container to be healthy..."
sleep 20

echo "$(date): Scaling down old backend container..."
docker compose -f docker-compose.prod.yml up -d --scale backend=1

echo "$(date): Rebuilding and restarting frontend..."
docker compose -f docker-compose.prod.yml up -d frontend

echo "$(date): Reloading nginx (if needed)..."
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload || true

echo "$(date): Deployment complete."
