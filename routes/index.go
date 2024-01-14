package routes

import (
	"net/http"
	"os"

	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
)

var SecretKey = os.Getenv("SECRET_KEY")

type CustomClaims struct {
	User                 string `json:"user"`
	Id                   string `json:"id"`
	jwt.RegisteredClaims `json:"claims"`
}

func SetRoutes(server *echo.Echo) {
	group := server.Group("/v1")
	group.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, echo.Map{
			"message": "Hello, World!",
		})
	})
	group.POST("/login", login)

	// Configure middleware with the custom claims type
	config := echojwt.Config{
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(CustomClaims)
		},
		SigningKey: []byte(SecretKey),
	}
	group.Use(echojwt.WithConfig(config))

	group.GET("/protected", func(c echo.Context) error {
		return c.JSON(http.StatusOK, echo.Map{
			"message": "protcted",
		})
	})
}
