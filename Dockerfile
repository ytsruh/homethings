# Build Golang app
FROM golang:alpine
WORKDIR /app
RUN apk update && apk upgrade && apk add --no-cache ca-certificates
RUN update-ca-certificates
COPY . .
RUN go mod download
RUN go build -o homethings cmd/server/main.go

EXPOSE 8080
ENTRYPOINT ["/homethings"]
CMD ["serve", "--http=0.0.0.0:8080"]