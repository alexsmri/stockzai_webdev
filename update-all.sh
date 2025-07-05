#!/usr/bin/env bash

docker compose -f docker-compose.dev.yml down frontend backend
docker compose -f docker-compose.dev.yml up frontend backend --build -d