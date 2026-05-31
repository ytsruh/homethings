package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func CORS() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			origin := c.Request().Header.Get("Origin")

			var allowedOrigin string
			if origin == "" {
				allowedOrigin = "https://www.ytsruh.com"
			} else if strings.HasPrefix(origin, "http://localhost") {
				allowedOrigin = origin
			} else if strings.Contains(origin, "ytsruh.workers.dev") {
				allowedOrigin = origin
			} else {
				allowedOrigin = "https://www.ytsruh.com"
			}

			c.Response().Header().Set("Access-Control-Allow-Origin", allowedOrigin)
			c.Response().Header().Set("Access-Control-Allow-Credentials", "true")
			c.Response().Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
			c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type")

			if c.Request().Method == http.MethodOptions {
				return c.NoContent(http.StatusNoContent)
			}

			return next(c)
		}
	}
}
