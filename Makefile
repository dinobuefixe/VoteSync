run:
	docker-compose up --build

down:
	docker-compose down

logs:
	docker-compose logs -f api

bash:
	docker exec -it votesync_api bash

db:
	docker exec -it votesync_db bash
