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
	"homethings.ytsruh.com/pkg/storage"
)

type MockBook struct {
	ID        string     `gorm:"type:uuid;default:uuid_generate_v4()" json:"id"`
	Name      string     `json:"name"`
	Isbn      string     `json:"isbn"`
	Author    *string    `json:"author"`
	Genre     *string    `json:"genre"`
	Rating    *int       `json:"rating"`
	Image     *string    `json:"image"`
	Read      bool       `gorm:"default:false" json:"read"`
	Wishlist  bool       `gorm:"default:false" json:"wishlist"`
	UserId    string     `json:"userId"`
	CreatedAt *time.Time `json:"createdAt"`
	UpdatedAt time.Time  `json:"updatedAt"`
}

var books = []storage.Book{
	{
		ID:   "1",
		Name: "Book 1",
		Isbn: "1234567890",
	}, {
		ID:   "2",
		Name: "Book 2",
		Isbn: "1234567891",
	},
}

func (b *MockBook) GetAllBooks(userId string) ([]storage.Book, error) {
	return books, nil
}
func (b *MockBook) GetBookById(id string, userId string) error {
	b.ID = id
	b.Name = "Book 1"
	b.Isbn = "1234567890"
	b.UserId = userId
	return nil
}
func (b *MockBook) Create(book *storage.Book) error {
	return nil
}
func (b *MockBook) Update(book *storage.Book) error {
	b.Name = book.Name
	b.Isbn = book.Isbn
	return nil
}
func (b *MockBook) Delete(id string, userId string) error {
	return nil
}
func (b *MockBook) GetRead(userId string) ([]storage.Book, error) {
	return books, nil
}
func (b *MockBook) GetUnread(userId string) ([]storage.Book, error) {
	return books, nil
}
func (b *MockBook) GetWishlist(userId string) ([]storage.Book, error) {
	return books, nil
}

func TestGetAllBooks(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	c.SetPath("/v1/books")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err := api.GetBooks()(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}

func TestCreateBook(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	newMockBook := MockBook{
		Name: "Mock Book",
		Isbn: "123-456-789",
	}
	// Marshal the mock book into a JSON byte array
	bookJson, err := json.Marshal(newMockBook)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewBuffer(bookJson))
	req.Header.Set("Content-Type", "application/json")
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	c.SetPath("/v1/books")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err = api.CreateBook()(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}

func TestGetSingleBook(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	c.SetPath("/v1/books/1")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err := api.GetSingleBook()(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}

func TestUpdateBook(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	newMockBook := MockBook{
		Name: "Updated Book",
		Isbn: "123-456-789",
	}
	// Marshal the mock book into a JSON byte array
	bookJson, err := json.Marshal(newMockBook)
	if err != nil {
		t.Fatal(err)
	}
	req := httptest.NewRequest(http.MethodPatch, "/", bytes.NewBuffer(bookJson))
	req.Header.Set("Content-Type", "application/json")
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	c.SetPath("/v1/books/1")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err = api.UpdateSingleBook()(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}

func TestDeleteBook(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	req := httptest.NewRequest(http.MethodDelete, "/", nil)
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	c.SetPath("/v1/books/1")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err := api.DeleteSingleBook()(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}

func TestGetWishlist(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	c.SetPath("/v1/books/wishlist")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err := api.GetWishlist()(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}

func TestGetRead(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	c.SetPath("/v1/books/read")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err := api.GetRead()(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}

func TestGetUnread(t *testing.T) {
	// Create a new Echo instance
	e := echo.New()
	// Create a new request
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	// Create a new ResponseRecorder
	rec := httptest.NewRecorder()
	// Create a new echo context with the request and response recorder
	c := e.NewContext(req, rec)
	c.SetPath("/v1/books/unread")
	// Create user token & set user context
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, mockClaims)
	c.Set("user", token)
	// Assertions
	err := api.GetUnread()(c)
	if err != nil {
		fmt.Println(err)
		t.Errorf("gave error : %v", err)
		return
	}
	if rec.Code != 200 {
		t.Errorf("gave code: %v, wanted code: %v", rec.Code, 200)
	}
}
