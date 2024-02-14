package handlers

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/pkg/storage"
)

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

func GetBooks(b storage.BookModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		books, err := b.GetAllBooks(claims.Id)
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

func CreateBook(b storage.BookModel) echo.HandlerFunc {
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
		claims, err := GetUser(c)
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
		err = b.Create(newBook)
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

func GetSingleBook(b storage.BookModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		err = b.GetBookById(id, claims.Id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get book",
			})
		}
		return c.JSON(200, echo.Map{
			"book": b,
		})
	}
}

func UpdateSingleBook(b storage.BookModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		input := UpdateBookInput{}
		if err := c.Bind(&input); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to bind book",
			})
		}
		claims, err := GetUser(c)
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
		err = b.Update(book)
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

func DeleteSingleBook(b storage.BookModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		id := c.Param("id")
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		err = b.Delete(id, claims.Id)
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

func GetWishlist(b storage.BookModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		books, err := b.GetWishlist(claims.Id)
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

func GetRead(b storage.BookModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		books, err := b.GetRead(claims.Id)
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

func GetUnread(b storage.BookModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		books, err := b.GetUnread(claims.Id)
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
