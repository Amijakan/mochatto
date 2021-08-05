


build: 
	./pre-up
	docker-compose build

dev:
	docker-compose up

prod:
	docker-compose -f ./docker-compose.prod.yaml build
	docker-compose -f ./docker-compose.prod.yaml up -d

