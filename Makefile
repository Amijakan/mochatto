
dev: 
	./bin/pre-up
	docker-compose build

prod:
	docker-compose -f ./docker-compose.prod.yaml build

prod-up:
	docker-compose -f ./docker-compose.prod.yaml up

clean:
	docker-compose rm -s

clean-all:
	docker-compose rm -s
	sudo rm -rf ./client/node_modules
	sudo rm -rf ./server/node_modules
