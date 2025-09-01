# Build Golang app
FROM golang:alpine
WORKDIR /app
RUN apk update && apk upgrade && apk add --no-cache ca-certificates
RUN update-ca-certificates
COPY . .

# To persist your data you need to mount a volume at /app/pb/pb_data
# Copy the local migrations dir into the pb directory
COPY ./migrations /pb/pb_migrations

# Download dependencies & run build
RUN go mod download
RUN go build -o pb/homethings cmd/server/main.go

# Expose port & run pocketbase
EXPOSE 8080
ENTRYPOINT ["./pb/homethings"]
CMD ["serve", "--http=0.0.0.0:8080"]
