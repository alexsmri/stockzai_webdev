#!/usr/bin/env bash

docker compose -f docker-compose.dev.yml down backend celery
docker compose -f docker-compose.dev.yml up backend celery --build -d
docker compose -f docker-compose.dev.yml run --rm backend python manage.py makemigrations
docker compose -f docker-compose.dev.yml run --rm backend python manage.py migrate