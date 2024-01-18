package routes

import (
	"errors"
	"os"

	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
)

var SecretKey = os.Getenv("SECRET_KEY")

type CustomClaims struct {
	User                 string `json:"user"`
	Id                   string `json:"id"`
	AccountId            string `json:"accountId"`
	jwt.RegisteredClaims `json:"claims"`
}

func GetUser(c echo.Context) (*CustomClaims, error) {
	token, ok := c.Get("user").(*jwt.Token)
	if !ok {
		return nil, errors.New("JWT token missing or invalid")
	}
	claims, ok := token.Claims.(*CustomClaims)
	if !ok {
		return nil, errors.New("failed to cast claims as jwt.MapClaims")
	}
	return claims, nil
}

func SetRoutes(server *echo.Echo) {
	group := server.Group("/v1")
	group.POST("/login", login)

	// Configure JWT middleware with the custom claims type
	group.Use(echojwt.WithConfig(echojwt.Config{
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(CustomClaims)
		},
		SigningKey:  []byte(SecretKey),
		TokenLookup: "header:Authorization", // Include token in Authorization header with no prefix
	}))
	// Profile routes
	group.GET("/profile", getProfile)
	group.PATCH("/profile", patchProfile)
	// Feedback route
	group.POST("/feedback", createFeedback)
	// Document routes
	group.GET("/documents", getDocuments)
	group.POST("/documents", createDocument)
	group.GET("/documents/:id", getSingleDocument)
	group.PUT("/documents/:id", updateSingleDocument)
	group.DELETE("/documents/:id", deleteSingleDocument)
	group.GET("/documents/url", createGetPresignedUrl)
	group.PUT("/documents/url", createPutPresignedUrl)
	// Book routes
	group.GET("/books", getBooks)
	group.POST("/books", createBook)
	group.GET("/books/:id", getSingleBook)
	group.PUT("/books/:id", updateSingleBook)
	group.DELETE("/books/:id", deleteSingleBook)
	group.GET("/books/wishlist", getWishlist)
	group.GET("/books/read", getRead)
	group.GET("/books/unread", getUnRead)
}
