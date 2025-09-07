#!/usr/bin/env bash

docker compose -f docker-compose.dev.yml down frontend backend celery
docker compose -f docker-compose.dev.yml up frontend backend celery --build -d
docker compose -f docker-compose.dev.yml run --rm backend python manage.py makemigrations
docker compose -f docker-compose.dev.yml run --rm backend python manage.py migrate