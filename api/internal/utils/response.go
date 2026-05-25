package utils

import (
	"github.com/labstack/echo/v4"
)

type MessageResponse struct {
	Message string `json:"message"`
}

func RespondWithMessage(c echo.Context, status int, message string) error {
	return c.JSON(status, MessageResponse{Message: message})
}
