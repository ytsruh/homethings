package routes

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/db"
)

type MockUser struct {
	db.UserInterface
}

func (u *MockUser) LoginUser(email string, password string) (*db.User, error) {
	if email != "testing@gmail.com" {
		return nil, errors.New("user not found")
	}
	if password != "testing" {
		return nil, errors.New("invalid password")
	}
	user := &db.User{
		ID:       "123",
		Name:     "Test User",
		Email:    "testing@gmail.com",
		Password: "testing",
	}
	return user, nil
}

func Test_login(t *testing.T) {
	mockuser := &MockUser{}
	type args struct {
		email    string
		password string
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{
			name: "Successful login",
			args: args{
				email:    "testing@gmail.com",
				password: "testing",
			},
			want: 200,
		},
		{
			name: "Unauthorised login",
			args: args{
				email:    "testing@gmail.com",
				password: "wrongpassword",
			},
			want: 401,
		},
		{
			name: "Bad Request",
			args: args{
				email: "testing@gmail.com",
			},
			want: 400,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup
			e := echo.New()
			req := httptest.NewRequest(http.MethodGet, "/", strings.NewReader(fmt.Sprintf(`{"email":"%s","password":"%s"}`, tt.args.email, tt.args.password)))
			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)
			c.SetPath("/v1/login")
			// Assertions
			err := login(mockuser)(c)
			if err != nil {
				t.Errorf("login() error = %v, wantErr nil", err)
				return
			}
			if rec.Code != tt.want {
				t.Errorf("login() = %v, want %v", rec.Code, tt.want)
			}
		})
	}
}
