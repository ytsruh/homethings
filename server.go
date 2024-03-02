package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"homethings.ytsruh.com/pkg/cronjobs"
	"homethings.ytsruh.com/pkg/handlers"
	"homethings.ytsruh.com/pkg/storage"
)

func main() {
	// Load environment variables
	envErr := godotenv.Load()
	if envErr != nil {
		log.Println("Error loading .env file")
	}
	// Set port
	port := os.Getenv("PORT")
	if port == "" {
		port = ":1323"
	} else {
		port = ":" + port
	}

	// Initialize Echo, set routes & database
	e := echo.New()
	e.Use(echo.MiddlewareFunc(middleware.CORS()))
	e.Static("/static", "static")
	setRoutes(e)
	setAdminRoutes(e)
	database := storage.InitDB()
	// Start cronjobs
	cronjobs.Start()
	// Start server
	go func() {
		if err := e.Start(port); err != nil && err != http.ErrServerClosed {
			e.Logger.Fatal("shutting down the server")
		}
	}()
	// Wait for interrupt signal to gracefully shutdown the server with a timeout of 10 seconds.
	// Use a buffered channel to avoid missing signals as recommended for signal.Notify
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	// Disconnect from database
	d, err := database.DB()
	if err != nil {
		log.Println(err)
		panic("Error disconnecting from database")
	}
	if err := d.Close(); err != nil {
		log.Println(err)
		panic("Error disconnecting from database")
	}
	log.Println("Database successfully disconnected")
	// Shutdown server
	if err := e.Shutdown(ctx); err != nil {
		e.Logger.Fatal(err)
	}
	log.Println("Server successfully shut down")
}

func setRoutes(e *echo.Echo) {
	group := e.Group("/v1")
	api := &handlers.APIHandler{
		User:     &storage.User{},
		Feedback: &storage.Feedback{},
		Document: &storage.Document{},
		Book:     &storage.Book{},
	}
	// Auth routes
	group.POST("/login", api.Login())
	group.POST("/requestreset", api.RequestPasswordReset())
	group.POST("/passwordreset", api.PasswordReset())

	// Search route
	searchHandler := handlers.SearchHandler{}
	group.POST("/search", searchHandler.Search, searchHandler.QueryMiddleware)

	// Configure JWT middleware for Authentication
	group.Use(api.SetJWTAuth())

	// Profile routes
	group.GET("/profile", api.GetProfile())
	group.PATCH("/profile", api.PatchProfile())

	// Feedback route
	group.POST("/feedback", api.CreateFeedback())

	// Document routes
	group.GET("/documents", api.GetDocuments())
	group.POST("/documents", api.CreateDocument())
	group.GET("/documents/:id", api.GetSingleDocument())
	group.PATCH("/documents/:id", api.UpdateSingleDocument())
	group.DELETE("/documents/:id", api.DeleteSingleDocument())
	group.GET("/documents/url", api.CreateGetPresignedUrl())
	group.PUT("/documents/url", api.CreatePutPresignedUrl())

	// Book routes
	group.GET("/books", api.GetBooks())
	group.POST("/books", api.CreateBook())
	group.GET("/books/:id", api.GetSingleBook())
	group.PATCH("/books/:id", api.UpdateSingleBook())
	group.DELETE("/books/:id", api.DeleteSingleBook())
	group.GET("/books/wishlist", api.GetWishlist())
	group.GET("/books/read", api.GetRead())
	group.GET("/books/unread", api.GetUnread())
}

func setAdminRoutes(e *echo.Echo) {
	admin := e.Group("/admin")
	adminHandler := &handlers.AdminHandler{}
	// Auth routes
	admin.GET("/", adminHandler.DashboardHandler, adminHandler.AuthMiddleware)
	admin.POST("/", adminHandler.DashboardPostHandler, adminHandler.AuthMiddleware)
	admin.GET("/login", adminHandler.LoginHandler)
	admin.POST("/login", adminHandler.LoginPostHandler)
	admin.POST("/logout", adminHandler.LogoutHandler)
}
