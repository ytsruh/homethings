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

type MockDocument struct {
	ID          string         `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	Title       string         `json:"title"`
	Description *string        `json:"description"`
	FileName    string         `json:"fileName"`
	AccountId   string         `gorm:"type:uuid" json:"accountId"`
	Account     models.Account `gorm:"foreignKey:AccountId;references:ID" json:"account"`
	CreatedAt   *time.Time     `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
}

var mockDescription string = "lorem ipsum"
var docs = []models.Document{
	{
		ID:          "1",
		Title:       "Doc 1",
		Description: &mockDescription,
		FileName:    "Doc 1",
	},
	{
		ID:          "2",
		Title:       "Doc 2",
		Description: &mockDescription,
		FileName:    "Doc 2",
	},
}

func (d *MockDocument) GetAllDocuments(accountId string) ([]models.Document, error) {
	return docs, nil
}

func (d *MockDocument) GetDocumentById(accountId string, id string) error {
	return nil
}

func (d *MockDocument) Create(doc *models.Document) error {
	return nil
}

func (d *MockDocument) Update(doc *models.Document) error {
	return nil
}

func (d *MockDocument) Delete(accountId string, id string) (*models.Document, error) {
	return &docs[0], nil
}

func TestCreateDocument(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	type args struct {
		Title       string
		Description string
		FileName    string
	}
	newMockDocument := args{
		Title:       "Doc 1",
		Description: "lorem ipsum",
		FileName:    "Doc 1",
	}
	// Marshal the mock book into a JSON byte array
	docsJson, err := json.Marshal(newMockDocument)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewBuffer(docsJson))
	req.Header.Set("Content-Type", "application/json")
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	mockDocument := MockDocument{}
	c.SetPath("/v1/documents")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err = CreateDocument(&mockDocument)(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}

func TestGetAllDocuments(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	mockDocument := MockDocument{}
	c.SetPath("/v1/documents")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err := GetDocuments(&mockDocument)(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}

func TestGetSingleDocument(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	mockDocument := MockDocument{}
	c.SetPath("/v1/documents/1")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err := GetSingleDocument(&mockDocument)(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}

func TestUpdateDocument(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	type args struct {
		Title       string
		Description string
		FileName    string
	}
	newMockDocument := args{
		Title:       "Doc 1",
		Description: "lorem ipsum",
		FileName:    "Doc 1",
	}
	// Marshal the mock book into a JSON byte array
	docJson, err := json.Marshal(newMockDocument)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodPatch, "/", bytes.NewBuffer(docJson))
	req.Header.Set("Content-Type", "application/json")
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	mockdocument := MockDocument{}
	c.SetPath("/v1/books/1")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err = UpdateSingleDocument(&mockdocument)(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}