
all :
		docker-compose -f docker-compose.yml build && docker-compose -f docker-compose.yml up

reset:
		docker-compose -f docker-compose.yml down -v && docker system prune -af && docker-compose -f docker-compose.yml build && docker-compose -f docker-compose.yml up

down_clean:
		docker-compose -f docker-compose.yml down -v && docker system prune -af

remove:
	rm -rf /Users/ael-beka/data/frontend/* && rm -rf /Users/ael-beka/data/backend/*
