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
	// Auth routes
	user := &storage.User{}
	group.POST("/login", handlers.Login(user))

	// Configure JWT middleware for Authentication
	group.Use(handlers.SetJWTAuth())

	// Profile routes
	group.GET("/profile", handlers.GetProfile(user))
	group.PATCH("/profile", handlers.PatchProfile(user))

	// Feedback route
	feedback := &storage.Feedback{}
	group.POST("/feedback", handlers.CreateFeedback(feedback))

	// Document routes
	document := &storage.Document{}
	group.GET("/documents", handlers.GetDocuments(document))
	group.POST("/documents", handlers.CreateDocument(document))
	group.GET("/documents/:id", handlers.GetSingleDocument(document))
	group.PATCH("/documents/:id", handlers.UpdateSingleDocument(document))
	group.DELETE("/documents/:id", handlers.DeleteSingleDocument(document))
	group.GET("/documents/url", handlers.CreateGetPresignedUrl(document))
	group.PUT("/documents/url", handlers.CreatePutPresignedUrl(document))

	// Book routes
	book := &storage.Book{}
	group.GET("/books", handlers.GetBooks(book))
	group.POST("/books", handlers.CreateBook(book))
	group.GET("/books/:id", handlers.GetSingleBook(book))
	group.PATCH("/books/:id", handlers.UpdateSingleBook(book))
	group.DELETE("/books/:id", handlers.DeleteSingleBook(book))
	group.GET("/books/wishlist", handlers.GetWishlist(book))
	group.GET("/books/read", handlers.GetRead(book))
	group.GET("/books/unread", handlers.GetUnread(book))
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
