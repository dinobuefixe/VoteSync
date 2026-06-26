SHELL := /bin/bash
DOCKER_COMPOSE ?= $(shell command -v docker-compose 2>/dev/null)
DOCKER ?= $(shell command -v docker 2>/dev/null)
COMPOSE_CMD ?= $(if $(DOCKER_COMPOSE),$(DOCKER_COMPOSE),$(if $(DOCKER),$(DOCKER) compose,))
ENV_FILE ?= .env

ifeq ($(COMPOSE_CMD),)
$(error docker-compose or docker compose command not found)
endif

.PHONY: all run build down logs bash db

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
