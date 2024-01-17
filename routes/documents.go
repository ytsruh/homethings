package routes

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/db"
	"homethings.ytsruh.com/lib"
)

type CreateDocumentInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	FileName    string `json:"fileName"`
}

type UpdateDocumentInput struct {
	Name        string `json:"name"`
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
	document := db.Document{
		Title:       input.Name,
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
		"url": url,
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
		"url": url,
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
	document := db.Document{
		Title:       input.Name,
		Description: &input.Description,
	}
	tx := client.Model(&db.Document{}).Where("id = ? AND account_id = ?", id, claims.ID).Updates(document)
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

func deleteSingleDocument(c echo.Context) error {
	claims, err := GetUser(c)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to get user",
		})
	}
	id := c.Param("id")
	client := db.GetDB()
	tx := client.Where("id = ? AND account_id = ?", id, claims.AccountId).Delete(&db.Document{})
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to delete document",
		})
	}
	return c.JSON(200, echo.Map{
		"message": "deleted document",
	})
}
