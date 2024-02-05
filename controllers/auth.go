package controllers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/models"
)

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func Login(user models.UserModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		input := new(LoginInput)
		if err := c.Bind(input); err != nil {
			fmt.Println(err)
			return c.JSON(http.StatusBadRequest, "bad request")
		}

		// Validate Form Data
		validate := validator.New(validator.WithRequiredStructEnabled())
		err := validate.Struct(input)
		if err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{
				"message": "bad request",
			})
		}

		// Check if user exists
		u, err := user.Login(input.Email, input.Password)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, echo.Map{
				"message": "unauthorized",
			})
		}
		// Create JWT
		claims := CustomClaims{
			u.Email,
			u.ID,
			u.AccountId,
			jwt.RegisteredClaims{
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
				Issuer:    "homethings",
			},
		}

		// Create & sign and get the complete encoded token as a string using the secret
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
		signedToken, err := token.SignedString([]byte(os.Getenv("SECRET_KEY")))
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "bad request",
			})
		}

		return c.JSON(http.StatusOK, echo.Map{
			"token": signedToken,
			"profile": echo.Map{
				"id":            u.ID,
				"email":         u.Email,
				"name":          u.Name,
				"profileImage":  u.ProfileImage,
				"showBooks":     u.ShowBooks,
				"showDocuments": u.ShowDocuments,
			},
		})
	}
}
