package handlers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
	"homethings.ytsruh.com/pkg/storage"
	"homethings.ytsruh.com/pkg/utils"
)

type LoginInput struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type PasswordResetInput struct {
	Email string `json:"email" validate:"required,email"`
}

func (h *APIHandler) Login() echo.HandlerFunc {
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
		u, err := h.User.Login(input.Email, input.Password)
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

func (h *APIHandler) RequestPasswordReset() echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get & Validate Form Data
		input := new(PasswordResetInput)
		if err := c.Bind(input); err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{
				"message": "bad request, cannot get input from body",
			})
		}
		validate := validator.New(validator.WithRequiredStructEnabled())
		err := validate.Struct(input)
		if err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{
				"message": "bad request",
			})
		}

		// Check if user exists
		user, err := h.User.GetUserByEmail(input.Email)
		if err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{
				"message": "user not found",
			})
		}

		// Create a new password reset token
		passwordReset := storage.PasswordReset{
			Email:     user.Email,
			UserID:    user.ID,
			ExpiresAt: time.Now().Add(1 * time.Hour),
		}
		err = passwordReset.Create()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "error while creating password reset token",
			})
		}

		// Create new email & send it
		email := utils.NewEmail{
			To:      user.Email,
			Subject: "Reset your Homethings Password",
			Type:    1,
			Data: utils.PasswordResetData{
				ID:        passwordReset.ID,
				ExpiresAt: passwordReset.ExpiresAt.Format("2nd January 2006 15:04"),
			},
		}
		err = email.Send()
		if err != nil {
			fmt.Println(err)
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "error while sending email",
			})
		}
		return c.JSON(http.StatusOK, echo.Map{
			"message": "email sent",
		})
	}
}

func (h *APIHandler) PasswordReset() echo.HandlerFunc {
	return func(c echo.Context) error {
		// Get & Validate Form Data
		input := &struct {
			ResetID     string `json:"resetId" validate:"required"`
			NewPassword string `json:"newPassword" validate:"required"`
		}{}
		if err := c.Bind(input); err != nil {
			fmt.Println(err)
			return c.JSON(http.StatusBadRequest, echo.Map{
				"message": "bad request, cannot get input from body",
			})
		}
		validate := validator.New(validator.WithRequiredStructEnabled())
		err := validate.Struct(input)
		if err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{
				"message": "bad request, all required fields not provided",
			})
		}
		// Check if resetId exists
		reset := storage.PasswordReset{
			ID: input.ResetID,
		}
		err = reset.GetResetById()
		if err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{
				"message": "resetId not found",
			})
		}
		// Validate that the reset has not expired
		if time.Now().After(reset.ExpiresAt) {
			return c.JSON(http.StatusBadRequest, echo.Map{
				"message": "resetId has expired",
			})
		}
		//Encryp & store the user's password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "error while hashing password",
			})
		}
		user := storage.User{
			ID:       reset.UserID,
			Password: string(hashedPassword),
		}
		err = user.UpdatePassword()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "error while updating password",
			})
		}
		// Delete the password reset
		err = reset.Delete()
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "error while deleting password reset",
			})
		}
		return c.JSON(http.StatusOK, echo.Map{
			"message": "password reset successful",
		})
	}
}
