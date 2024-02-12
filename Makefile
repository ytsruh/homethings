.PHONY: tailwind-watch
tailwind-watch:
	./tailwindcss -i ./static/input.css -o ./static/styles.css --watch

.PHONY: tailwind-build
tailwind-build:
	./tailwindcss -i ./static/input.css -o ./static/styles.css --minify

.PHONY: templ-generate
templ-generate:
	templ generate

.PHONY: dev
dev:
	air

.PHONY: build
build:
	make tailwind-build && make templ-generate && go build -o ./bin/$(APP_NAME) ./cmd/$(APP_NAME)/main.go