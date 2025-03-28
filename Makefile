# Build the application
build:
	@echo "Building..."
	
	@go build -o main cmd/server/main.go

# Run the application
run:
	@go run cmd/server/main.go serve

# Test the application
test:
	@echo "Testing..."
	@go test ./tests -v

# Clean the binary
clean:
	@echo "Cleaning..."
	@rm -f main

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

.PHONY: build run test clean migration-snapshot docker-build docker-run docker-clean
