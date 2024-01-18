package routes

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/db"
)

type BookInput struct {
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
	input := BookInput{}
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to bind book",
		})
	}
	if input.Name == "" || input.Isbn == "" {
		return c.JSON(http.StatusBadRequest, echo.Map{
			"message": "name & isbn required",
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
	input := BookInput{}
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
	tx := client.Model(&db.Book{}).Where("id = ? AND user_id = ?", id, claims.ID).Updates(book)
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
	tx := client.Where("id = ? AND user_id = ?", id, claims.ID).Delete(&db.Book{})
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
	tx := client.Where("user_id = ? AND wishlist = ?", claims.ID, true).Find(&books)
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
	tx := client.Where("user_id = ? AND read = ?", claims.ID, true).Find(&books)
	if tx.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get books",
		})
	}
	return c.JSON(200, echo.Map{
		"books": books,
	})
}

func getUnRead(c echo.Context) error {
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	client := db.GetDB()
	var books []db.Book
	tx := client.Where("user_id = ? AND read = ?", claims.ID, false).Find(&books)
	if tx.Error != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get books",
		})
	}
	return c.JSON(200, echo.Map{
		"books": books,
	})
}
