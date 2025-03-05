# Simple Makefile for a Go project

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

.PHONY: build run test clean
