package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/models"
)

type MockFeedback struct {
	ID        string `gorm:"type:uuid;default:uuid_generate_v4()"`
	Title     string
	Body      *string
	UserId    string      `gorm:"type:uuid"`
	User      models.User `gorm:"foreignKey:UserId;references:ID"`
	CreatedAt *time.Time
	UpdatedAt time.Time
}

func (f *MockFeedback) Create(feedback *models.Feedback) error {
	return nil
}

func TestCreateFeedback(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	body := "Test feedback"
	newMockFeedback := MockFeedback{
		Title: "New Test feedback",
		Body:  &body,
	}
	// Marshal the mock book into a JSON byte array
	bookJson, err := json.Marshal(newMockFeedback)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewBuffer(bookJson))
	req.Header.Set("Content-Type", "application/json")
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	mockfeedback := MockFeedback{}
	c.SetPath("/v1/feedback")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err = CreateFeedback(&mockfeedback)(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}
