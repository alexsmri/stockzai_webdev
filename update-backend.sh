#!/usr/bin/env bash

docker compose -f docker-compose.dev.yml down backend
docker compose -f docker-compose.dev.yml up backend --build -d
docker compose -f docker-compose.dev.yml run --rm backend python manage.py makemigrations
docker compose -f docker-compose.dev.yml run --rm backend python manage.py migrate