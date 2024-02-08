package controllers

import (
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

var mockClaims = &CustomClaims{
	User:      "testuser@gmail.com",
	Id:        "123456",
	AccountId: "1234567890",
	RegisteredClaims: jwt.RegisteredClaims{
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(5 * time.Hour)),
		Issuer:    "homethings",
	},
}

func TestGetUser(t *testing.T) {
	t.Run("Get user from context", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodPatch, "/", nil)
		rec := httptest.NewRecorder()
		c := e.NewContext(req, rec)
		// Create user token & set user context
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
		c.Set("user", token)
		got, err := GetUser(c)
		if err != nil {
			t.Errorf("GetUser() error = %v", err)
			return
		}
		if !reflect.DeepEqual(got, mockClaims) {
			t.Errorf("GetUser() = %v, want %v", got, mockClaims)
		}
	})
}
