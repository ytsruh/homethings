.PHONY: build run sqlc

build:
	go build -o server ./cmd/main.go

run:
	go run ./cmd/main.go

sqlc:
	sqlc generate
