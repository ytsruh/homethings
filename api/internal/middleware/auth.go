package middleware

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"ytsruh.com/homethings/internal/utils"
)

type AuthMiddleware struct {
	jwtService *utils.JWTService
}

func NewAuthMiddleware(jwtService *utils.JWTService) *AuthMiddleware {
	return &AuthMiddleware{jwtService: jwtService}
}

func (m *AuthMiddleware) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cookie, err := c.Cookie(utils.CookieName)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
		}

		payload, err := m.jwtService.Verify(cookie.Value)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Unauthorized"})
		}

		c.Set("user", payload)
		return next(c)
	}
}

func (m *AuthMiddleware) OptionalAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		cookie, err := c.Cookie(utils.CookieName)
		if err == nil {
			if payload, err := m.jwtService.Verify(cookie.Value); err == nil {
				c.Set("user", payload)
			}
		}
		return next(c)
	}
}

func IsPublicRoute(path string) bool {
	publicRoutes := []string{
		"/auth/login",
		"/auth/register",
		"/auth/logout",
	}
	for _, route := range publicRoutes {
		if strings.HasPrefix(path, route) {
			return true
		}
	}
	return false
}
