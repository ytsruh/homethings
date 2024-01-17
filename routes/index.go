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
		TokenLookup: "header:Authorization",
	}))

	group.GET("/profile", getProfile)
	group.PATCH("/profile", patchProfile)
	group.POST("/feedback", createFeedback)
	group.GET("/documents", getDocuments)
	group.POST("/documents", createDocument)
}
