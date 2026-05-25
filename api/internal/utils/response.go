package utils

import (
	"database/sql"

	"github.com/labstack/echo/v4"
)

type MessageResponse struct {
	Message string `json:"message"`
}

func RespondWithMessage(c echo.Context, status int, message string) error {
	return c.JSON(status, MessageResponse{Message: message})
}

func NullStringToPtr(ns sql.NullString) *string {
	if ns.Valid {
		return &ns.String
	}
	return nil
}

func StringToNullString(s string) sql.NullString {
	return sql.NullString{String: s, Valid: s != ""}
}

func StringToNullStringPtr(s *string) sql.NullString {
	if s != nil {
		return sql.NullString{String: *s, Valid: true}
	}
	return sql.NullString{}
}
