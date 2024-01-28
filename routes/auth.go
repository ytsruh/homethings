package routes

import (
	"fmt"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"homethings.ytsruh.com/db"
)

type LoginInput struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required,email"`
}

func login(c echo.Context) error {
	input := new(LoginInput)
	if err := c.Bind(input); err != nil {
		return c.JSON(http.StatusBadRequest, "bad request")
	}

	// Validate Form Data
	validate := validator.New(validator.WithRequiredStructEnabled())
	err := validate.Struct(input)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Println(err.Namespace())
			fmt.Println(err.Field())
			fmt.Println(err.StructNamespace())
			fmt.Println(err.StructField())
			fmt.Println(err.Tag())
			fmt.Println(err.ActualTag())
			fmt.Println(err.Kind())
			fmt.Println(err.Type())
			fmt.Println(err.Value())
			fmt.Println(err.Param())
			fmt.Println()
		}
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": "bad request",
		})
	}

	// Check if user exists
	client := db.GetDB()
	user := db.User{}
	if err := client.Where("email = ?", input.Email).First(&user).Error; err != nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"message": "unauthorized",
		})
	}

	// Compare Passwords
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, echo.Map{
			"message": "unauthorized",
		})
	}

	// Create JWT
	claims := CustomClaims{
		user.Email,
		user.ID,
		user.AccountId,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			Issuer:    "homethings",
		},
	}
	// Create & sign and get the complete encoded token as a string using the secret
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString([]byte(SecretKey))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "bad request",
		})
	}

	return c.JSON(http.StatusOK, echo.Map{
		"token": signedToken,
		"profile": echo.Map{
			"id":            user.ID,
			"email":         user.Email,
			"name":          user.Name,
			"profileImage":  user.ProfileImage,
			"showBooks":     user.ShowBooks,
			"showDocuments": user.ShowDocuments,
		},
	})
}
