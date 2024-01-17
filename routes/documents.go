package routes

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/db"
)

type CreateDocumentInput struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	FileName    string `json:"fileName"`
}

func getDocuments(c echo.Context) error {
	claims, err := GetUser(c)
	fmt.Println(err)
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
	fmt.Println(err)
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
	return c.JSON(200, "document")
}

func createPutPresignedUrl(c echo.Context) error {
	return c.JSON(200, "document")
}

func getSingleDocument(c echo.Context) error {
	return c.JSON(200, "document")
}

func updateSingleDocument(c echo.Context) error {
	return c.JSON(200, "document")
}

func deleteSingleDocument(c echo.Context) error {
	return c.JSON(200, "document")
}
