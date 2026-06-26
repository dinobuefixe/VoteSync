SHELL := /bin/bash
DOCKER_COMPOSE ?= $(shell command -v docker-compose 2>/dev/null)
DOCKER ?= $(shell command -v docker 2>/dev/null)
COMPOSE_CMD ?= $(if $(DOCKER_COMPOSE),$(DOCKER_COMPOSE),$(if $(DOCKER),$(DOCKER) compose,))
ENV_FILE ?= .env
DB_USER ?= postgres
DB_NAME ?= votesync

ifeq ($(COMPOSE_CMD),)
$(error docker-compose or docker compose command not found)
endif

.PHONY: all run build down logs bash db create-db

all: run

run:
	$(COMPOSE_CMD) --env-file $(ENV_FILE) up --build

build:
	$(COMPOSE_CMD) --env-file $(ENV_FILE) build

down:
	$(COMPOSE_CMD) --env-file $(ENV_FILE) down

logs:
	$(COMPOSE_CMD) --env-file $(ENV_FILE) logs -f api

bash:
	$(COMPOSE_CMD) --env-file $(ENV_FILE) exec api bash

db:
	$(COMPOSE_CMD) --env-file $(ENV_FILE) exec db bash

create-db:
	$(COMPOSE_CMD) --env-file $(ENV_FILE) up -d db
	@for i in $$(seq 1 30); do \
		$(COMPOSE_CMD) --env-file $(ENV_FILE) exec -T db psql -U "$(DB_USER)" -d postgres -c 'SELECT 1' >/dev/null 2>&1 && break; \
		sleep 1; \
	done
	$(COMPOSE_CMD) --env-file $(ENV_FILE) exec -T db psql -U "$(DB_USER)" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '$(DB_NAME)'" | grep -q 1 || \
		$(COMPOSE_CMD) --env-file $(ENV_FILE) exec -T db psql -U "$(DB_USER)" -d postgres -c "CREATE DATABASE \"$(DB_NAME)\";"
