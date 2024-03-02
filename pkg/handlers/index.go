package handlers

import (
	"errors"
	"os"

	"github.com/golang-jwt/jwt/v5"
	echojwt "github.com/labstack/echo-jwt/v4"
	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/pkg/storage"
)

type CustomClaims struct {
	User                 string `json:"user"`
	Id                   string `json:"id"`
	AccountId            string `json:"accountId"`
	jwt.RegisteredClaims `json:"claims"`
}

type UserModel interface {
	Login(email string, password string) (*storage.User, error)
	GetUserById(id string) (*storage.User, error)
	GetUserByEmail(email string) (*storage.User, error)
	Update(user storage.User) error
}

type APIHandler struct {
	User     UserModel
	Feedback FeedbackModel
	Document DocumentModel
	Book     BookModel
}

func getUser(c echo.Context) (*CustomClaims, error) {
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

func (h *APIHandler) SetJWTAuth() echo.MiddlewareFunc {
	return echojwt.WithConfig(echojwt.Config{
		NewClaimsFunc: func(c echo.Context) jwt.Claims {
			return new(CustomClaims)
		},
		SigningKey:  []byte(os.Getenv("SECRET_KEY")),
		TokenLookup: "header:Authorization", // Include token in Authorization header with no prefix
	})
}
