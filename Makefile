


dev: 
	./bin/pre-up
	docker-compose build
	docker-compose up

dev-d: 
	./bin/pre-up
	docker-compose build
	docker-compose up -d

prod:
	docker-compose -f ./docker-compose.prod.yaml build
	docker-compose -f ./docker-compose.prod.yaml up -d

