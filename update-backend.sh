#!/usr/bin/env bash

docker compose -f docker-compose.dev.yml down backend celery celery-beat
docker compose -f docker-compose.dev.yml up backend celery celery-beat --build -d
docker compose -f docker-compose.dev.yml run --rm backend python manage.py makemigrations
docker compose -f docker-compose.dev.yml run --rm backend python manage.py migrate