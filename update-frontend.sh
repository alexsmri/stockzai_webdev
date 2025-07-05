#!/usr/bin/env bash

docker compose -f docker-compose.dev.yml build frontend
docker compose -f docker-compose.dev.yml up frontend -d