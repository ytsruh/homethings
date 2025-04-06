# Build the application
build:
	@echo "Building..."
	
	@go build -o homethings-server ./cmd/server
	@go build -o homethings-cli ./cmd/cli

# Run the web application
run:
	@go run cmd/server/main.go serve

# Run the cli application
run-cli:
	@go run cmd/cli/main.go

# Test the application
test:
	@echo "Testing..."
	@go test ./tests -v

migration-snapshot:
	@echo "Creating snapshot..."
	@go run cmd/server/main.go migrate collections
	@go run cmd/server/main.go migrate history-sync

docker-build: # Build the docker image
	docker build -t homethings .

docker-run: # Run the docker image
	docker run -p 8080:8080 homethings

docker-clean: # Clear the docker cache
	docker builder prune

.PHONY: build run run-cli test migration-snapshot docker-build docker-run docker-clean
