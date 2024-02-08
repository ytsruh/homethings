package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/models"
)

type MockUser struct {
	ID            string     `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	Name          string     `gorm:"default:'User Name'" json:"name"`
	Email         string     `gorm:"unique" json:"email"`
	Password      string     `json:"-"`
	ProfileImage  *string    `json:"profileImage"`
	ShowBooks     bool       `gorm:"default:true" json:"showBooks"`
	ShowDocuments bool       `gorm:"default:true" json:"showDocuments"`
	AccountId     string     `json:"accountId"`
	CreatedAt     *time.Time `json:"createdAt"`
	UpdatedAt     time.Time  `json:"updatedAt"`
}

func (u *MockUser) Login(email string, password string) (*models.User, error) {
	// Find User
	if email != "testing@gmail.com" || password != "testing" {
		return nil, errors.New("Invalid email or password")
	}
	return &models.User{
		ID:       "1",
		Name:     "Test User",
		Email:    "testing@gmail.com",
		Password: "testing",
	}, nil
}

func (u *MockUser) GetUserById(id string) (*models.User, error) {

	return &models.User{
		ID:       id,
		Name:     "Test User",
		Email:    "testing@gmail.com",
		Password: "testing",
	}, nil
}

func (u *MockUser) Update(user models.User) error {
	return nil
}

func TestLogin(t *testing.T) {
	// Setup test cases
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
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			e := echo.New()
			req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(fmt.Sprintf(`{"email":"%s","password":"%s"}`, test.args.email, test.args.password)))

			req.Header.Set("Content-Type", "application/json")
			rec := httptest.NewRecorder()
			c := e.NewContext(req, rec)
			c.SetPath("/v1/login")
			// Assertions
			err := Login(&MockUser{})(c)
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
