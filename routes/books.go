package routes

import (
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/db"
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

func getBooks(c echo.Context) error {
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	client := db.GetDB()
	var books []db.Book
	tx := client.Where("user_id = ?", claims.Id).Find(&books)
	if tx.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get books",
		})
	}
	return c.JSON(200, echo.Map{
		"books": books,
	})
}

func createBook(c echo.Context) error {
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
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Println(err.Namespace())
			fmt.Println(err.Field())
			fmt.Println(err.StructNamespace())
			fmt.Println(err.StructField())
			fmt.Println(err.Tag())
			fmt.Println(err.ActualTag())
			fmt.Println(err.Kind())
			fmt.Println(err.Type())
			fmt.Println(err.Value())
			fmt.Println(err.Param())
			fmt.Println()
		}
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
	client := db.GetDB()
	var book db.Book
	tx := client.Create(&db.Book{
		Name:     input.Name,
		Isbn:     input.Isbn,
		Author:   &input.Author,
		Genre:    &input.Genre,
		Image:    &input.Image,
		Rating:   &input.Rating,
		Read:     input.Read,
		Wishlist: input.Wishlist,
		UserId:   claims.Id,
	})
	if tx.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to create book",
		})
	}
	return c.JSON(200, echo.Map{
		"book": book,
	})
}

func getSingleBook(c echo.Context) error {
	id := c.Param("id")
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	client := db.GetDB()
	var book db.Book
	tx := client.Where("id = ? AND user_id = ?", id, claims.Id).First(&book)
	if tx.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get book",
		})
	}
	return c.JSON(200, echo.Map{
		"book": book,
	})
}

func updateSingleBook(c echo.Context) error {
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
	client := db.GetDB()
	book := db.Book{
		Name:     input.Name,
		Isbn:     input.Isbn,
		Author:   &input.Author,
		Genre:    &input.Genre,
		Image:    &input.Image,
		Rating:   &input.Rating,
		Read:     input.Read,
		Wishlist: input.Wishlist,
	}
	tx := client.Model(&db.Book{}).Where("id = ? AND user_id = ?", id, claims.Id).Updates(book)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to create document",
		})
	}
	return c.JSON(200, echo.Map{
		"book": book,
	})
}

func deleteSingleBook(c echo.Context) error {
	id := c.Param("id")
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	client := db.GetDB()
	tx := client.Where("id = ? AND user_id = ?", id, claims.Id).Delete(&db.Book{})
	if tx.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to delete book",
		})
	}
	return c.JSON(200, echo.Map{
		"message": "book deleted",
	})
}

func getWishlist(c echo.Context) error {
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	client := db.GetDB()
	var books []db.Book
	tx := client.Where("user_id = ? AND wishlist = ?", claims.Id, true).Find(&books)
	if tx.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get books",
		})
	}
	return c.JSON(200, echo.Map{
		"books": books,
	})
}

func getRead(c echo.Context) error {
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	client := db.GetDB()
	var books []db.Book
	tx := client.Where("user_id = ? AND read = ?", claims.Id, true).Find(&books)
	if tx.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get books",
		})
	}
	return c.JSON(200, echo.Map{
		"books": books,
	})
}

func getUnread(c echo.Context) error {
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	client := db.GetDB()
	var books []db.Book
	tx := client.Where("user_id = ? AND read = ?", claims.Id, false).Find(&books)
	if tx.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get books",
		})
	}
	return c.JSON(200, echo.Map{
		"books": books,
	})
}
