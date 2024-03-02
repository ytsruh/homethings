package handlers

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/pkg/storage"
)

type BookModel interface {
	GetAllBooks(userId string) ([]storage.Book, error)
	GetBookById(id string, userId string) error
	Create(book *storage.Book) error
	Update(book *storage.Book) error
	Delete(id string, userId string) error
	GetRead(userId string) ([]storage.Book, error)
	GetUnread(userId string) ([]storage.Book, error)
	GetWishlist(userId string) ([]storage.Book, error)
}

type CreateBookInput struct {
	Name     string `json:"name" validate:"required"`
	Isbn     string `json:"isbn" validate:"required"`
	Author   string `json:"author"`
	Genre    string `json:"genre"`
	Wishlist bool   `json:"wishlist"`
	Read     bool   `json:"read"`
	Rating   int    `json:"rating"`
	Image    string `json:"image"`
}

type UpdateBookInput struct {
	Name     string `json:"name"`
	Isbn     string `json:"isbn"`
	Author   string `json:"author"`
	Genre    string `json:"genre"`
	Wishlist bool   `json:"wishlist"`
	Read     bool   `json:"read"`
	Rating   int    `json:"rating"`
	Image    string `json:"image"`
}

func (h *APIHandler) GetBooks() echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := getUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		books, err := h.Book.GetAllBooks(claims.Id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get books",
			})
		}
		return c.JSON(200, echo.Map{
			"books": books,
		})
	}
}

func (h *APIHandler) CreateBook() echo.HandlerFunc {
	return func(c echo.Context) error {
		input := CreateBookInput{}
		if err := c.Bind(&input); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to bind book",
			})
		}
		// Validate Form Data
		validate := validator.New(validator.WithRequiredStructEnabled())
		err := validate.Struct(input)
		if err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{
				"message": "bad request",
			})
		}
		claims, err := getUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		newBook := &storage.Book{
			Name:     input.Name,
			Isbn:     input.Isbn,
			Author:   &input.Author,
			Genre:    &input.Genre,
			Image:    &input.Image,
			Rating:   &input.Rating,
			Read:     input.Read,
			Wishlist: input.Wishlist,
			UserId:   claims.Id,
		}
		err = h.Book.Create(newBook)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to create book",
			})
		}
		return c.JSON(200, echo.Map{
			"book": newBook,
		})
	}
}

func (h *APIHandler) GetSingleBook() echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		claims, err := getUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		err = h.Book.GetBookById(id, claims.Id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get book",
			})
		}
		return c.JSON(200, echo.Map{
			"book": h.Book,
		})
	}
}

func (h *APIHandler) UpdateSingleBook() echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		input := UpdateBookInput{}
		if err := c.Bind(&input); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to bind book",
			})
		}
		claims, err := getUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		book := &storage.Book{
			ID:       id,
			Name:     input.Name,
			Isbn:     input.Isbn,
			Author:   &input.Author,
			Genre:    &input.Genre,
			Image:    &input.Image,
			Rating:   &input.Rating,
			Read:     input.Read,
			Wishlist: input.Wishlist,
			UserId:   claims.Id,
		}
		err = h.Book.Update(book)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to create document",
			})
		}
		return c.JSON(200, echo.Map{
			"book": book,
		})
	}
}

func (h *APIHandler) DeleteSingleBook() echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		claims, err := getUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		err = h.Book.Delete(id, claims.Id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to delete book",
			})
		}
		return c.JSON(200, echo.Map{
			"message": "book deleted",
		})
	}
}

func (h *APIHandler) GetWishlist() echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := getUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		books, err := h.Book.GetWishlist(claims.Id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get books",
			})
		}
		return c.JSON(200, echo.Map{
			"books": books,
		})
	}
}

func (h *APIHandler) GetRead() echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := getUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		books, err := h.Book.GetRead(claims.Id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get books",
			})
		}
		return c.JSON(200, echo.Map{
			"books": books,
		})
	}
}

func (h *APIHandler) GetUnread() echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := getUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		books, err := h.Book.GetUnread(claims.Id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get books",
			})
		}
		return c.JSON(200, echo.Map{
			"books": books,
		})
	}
}
