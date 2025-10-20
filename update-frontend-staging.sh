#!/usr/bin/env bash

docker compose -f docker-compose.staging.yml build frontend
docker compose -f docker-compose.staging.yml up frontend -d