package routes

import (
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm/clause"
	"homethings.ytsruh.com/db"
	"homethings.ytsruh.com/lib"
)

type CreateDocumentInput struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
	FileName    string `json:"fileName"`
}

type UpdateDocumentInput struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

func getDocuments(c echo.Context) error {
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	client := db.GetDB()
	documents := []db.Document{}
	tx := client.Where("account_id = ?", claims.AccountId).Find(&documents)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get documents",
		})
	}

	return c.JSON(200, documents)
}

func createDocument(c echo.Context) error {
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	client := db.GetDB()
	input := CreateDocumentInput{}
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to bind document",
		})
	}
	// Validate Form Data
	validate := validator.New(validator.WithRequiredStructEnabled())
	err = validate.Struct(input)
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
	document := db.Document{
		Title:       input.Title,
		Description: &input.Description,
		FileName:    input.FileName,
		AccountId:   claims.AccountId,
	}
	tx := client.Create(&document)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to create document",
		})
	}
	return c.JSON(200, echo.Map{
		"message": "created new document",
	})
}

func createGetPresignedUrl(c echo.Context) error {
	key := c.QueryParam("fileName")
	if key == "" {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "fileName is required",
		})
	}
	url, err := lib.CreatePresignedGetURL(key)
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get presigned url",
		})
	}
	return c.JSON(200, echo.Map{
		"url": url.URL,
	})
}

func createPutPresignedUrl(c echo.Context) error {
	key := c.QueryParam("fileName")
	if key == "" {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "fileName is required",
		})
	}
	url, err := lib.CreatePresignedPutURL(key)
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get presigned url",
		})
	}
	return c.JSON(200, echo.Map{
		"url": url.URL,
	})
}

func getSingleDocument(c echo.Context) error {
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	id := c.Param("id")
	client := db.GetDB()
	document := db.Document{}
	tx := client.Where("id = ? AND account_id = ?", id, claims.AccountId).First(&document)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get documents",
		})
	}

	return c.JSON(200, document)
}

func updateSingleDocument(c echo.Context) error {
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	id := c.Param("id")
	client := db.GetDB()
	input := UpdateDocumentInput{}
	if err := c.Bind(&input); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to bind document",
		})
	}
	document := &db.Document{
		Title:       input.Title,
		Description: &input.Description,
	}
	tx := client.Model(&db.Document{}).Where("id = ? AND account_id = ?", id, claims.AccountId).Updates(document)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to update document",
		})
	}
	return c.JSON(200, echo.Map{
		"message": "updated document",
	})
}

func deleteSingleDocument(c echo.Context) error {
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	id := c.Param("id")
	client := db.GetDB()
	doc := &db.Document{}
	tx := client.Clauses(clause.Returning{}).Where("id = ? AND account_id = ?", id, claims.AccountId).Delete(doc)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to delete document",
		})
	}
	err = lib.DeleteObject(doc.FileName)
	if err != nil {
		fmt.Println(err)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to delete document from storage",
		})
	}
	return c.JSON(200, echo.Map{
		"message": "deleted document",
	})
}
