package main

import (
	"fmt"
	"log"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"ytsruh.com/homethings/internal/db"
	"ytsruh.com/homethings/internal/routes"
	"ytsruh.com/homethings/internal/utils"
)

func main() {
	env, err := utils.LoadAndValidateEnv()
	if err != nil {
		log.Fatalf("Failed to load environment: %v", err)
	}

	database, err := db.NewConnection(env.DB_PATH, env.TURSO_DATABASE_URL, env.TURSO_AUTH_TOKEN)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	jwtService := utils.NewJWTService(env.JWT_SECRET)

	_, err = utils.LoadStorageConfig()
	if err != nil {
		log.Fatalf("Failed to load storage config: %v", err)
	}

	handler := routes.NewHandler(database, jwtService)

	e := echo.New()
	e.HideBanner = true

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	handler.RegisterRoutes(e)

	port := env.PORT
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on port %s\n", port)
	if err := e.Start(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
