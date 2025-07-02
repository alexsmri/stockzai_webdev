#!/usr/bin/env bash
set -e

LOCK_FILE="/tmp/frontend-deploy.lock"
trap 'rm -f "$LOCK_FILE"' EXIT

if [ -e "$LOCK_FILE" ]; then
  echo "$(date): Deployment already running."
  exit 1
fi

touch "$LOCK_FILE"

echo "$(date): Pulling latest code..."
git pull

echo "$(date): Building new frontend image..."
docker compose -f docker-compose.prod.yml build frontend

echo "$(date): Bringing up new frontend container alongside existing..."
docker compose -f docker-compose.prod.yml up -d --scale frontend=2

echo "$(date): Waiting for new frontend container to be healthy..."
sleep 20

echo "$(date): Scaling down old frontend container..."
docker compose -f docker-compose.prod.yml up -d --scale frontend=1

echo "$(date): Deployment complete."