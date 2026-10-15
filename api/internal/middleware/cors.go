package middleware

import (
	"net"
	"net/http"
	"net/url"
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
			} else if isLocalNetworkOrigin(origin) {
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

// isLocalNetworkOrigin reports whether the origin URL points at loopback or a
// private LAN address (10/8, 172.16/12, 192.168/16, IPv6 unique-local). This
// lets dev builds served on the local network make credentialed API calls.
func isLocalNetworkOrigin(origin string) bool {
	u, err := url.Parse(origin)
	if err != nil {
		return false
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return false
	}
	host := u.Hostname()
	if host == "localhost" {
		return true
	}
	ip := net.ParseIP(host)
	if ip == nil {
		return false
	}
	return ip.IsLoopback() || ip.IsPrivate()
}
