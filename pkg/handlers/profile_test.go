package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

func TestGetProfile(t *testing.T) {
	// Setup test cases
	tests := []struct {
		name string
		want int
	}{
		{
			name: "Successful",
			want: 200,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)
			c.SetPath("/v1/login")
			// Create user token & set user context
			token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
			c.Set("user", token)
			// Assertions
			err := GetProfile(&MockUser{})(c)
			if err != nil {
				t.Errorf("gave error : %v", err)
				return
			}
			if rec.Code != test.want {
				t.Errorf("gave code: %v, wanted code: %v", rec.Code, test.want)
			}
		})
	}
}

func TestPatchProfile(t *testing.T) {
	// Setup test cases
	type args struct {
		Name          string
		ProfileImage  string
		ShowBooks     bool
		ShowDocuments interface{}
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{
			name: "Successful",
			args: args{
				Name:          "Test user",
				ProfileImage:  "www.example.com/image.jpg",
				ShowBooks:     true,
				ShowDocuments: true,
			},
			want: 200,
		},
		{
			name: "Bad Request",
			args: args{
				Name:          "Test user",
				ShowDocuments: "false",
			},
			want: 400,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			e := echo.New()
			// Convert args to JSON
			argsJson, err := json.Marshal(test.args)
			if err != nil {
				t.Fatal(err)
			}
			req := httptest.NewRequest(http.MethodPatch, "/", bytes.NewBuffer(argsJson))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)
			c.SetPath("/v1/login")
			// Create user token & set user context
			token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
			c.Set("user", token)
			// Assertions
			err = PatchProfile(&MockUser{})(c)
			if err != nil {
				t.Errorf("gave error : %v", err)
				return
			}
			if rec.Code != test.want {
				t.Errorf("gave code: %v, wanted code: %v", rec.Code, test.want)
			}
		})
	}
}
