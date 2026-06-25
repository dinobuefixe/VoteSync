run:
	DOCKER_BUILDKIT=0 docker-compose up --build

build:
	DOCKER_BUILDKIT=0 docker-compose build

down:
	docker-compose down

logs:
	docker-compose logs -f api

bash:
	docker exec -it votesync_api bash

db:
	docker exec -it votesync_db bash
