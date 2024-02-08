package controllers

import (
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/lib"
	"homethings.ytsruh.com/models"
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

func GetDocuments(d models.DocumentModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		docs, err := d.GetAllDocuments(claims.AccountId)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get documents",
			})
		}

		return c.JSON(200, docs)
	}
}

func CreateDocument(d models.DocumentModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
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
			return c.JSON(http.StatusBadRequest, echo.Map{
				"message": "bad request",
			})
		}
		document := &models.Document{
			Title:       input.Title,
			Description: &input.Description,
			FileName:    input.FileName,
			AccountId:   claims.AccountId,
		}
		err = d.Create(document)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to create document",
			})
		}
		return c.JSON(200, echo.Map{
			"message": "created new document",
		})
	}
}

func GetSingleDocument(d models.DocumentModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		id := c.Param("id")
		err = d.GetDocumentById(claims.AccountId, id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get documents",
			})
		}

		return c.JSON(200, d)
	}
}

func UpdateSingleDocument(d models.DocumentModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		id := c.Param("id")
		input := UpdateDocumentInput{}
		if err := c.Bind(&input); err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to bind document",
			})
		}
		document := &models.Document{
			ID:          id,
			Title:       input.Title,
			Description: &input.Description,
			AccountId:   claims.AccountId,
		}
		err = d.Update(document)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to update document",
			})
		}
		return c.JSON(200, echo.Map{
			"message": "updated document",
		})
	}
}

func DeleteSingleDocument(d models.DocumentModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		id := c.Param("id")
		deleted, err := d.Delete(claims.AccountId, id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to delete document",
			})
		}
		err = lib.DeleteObject(deleted.FileName)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to delete document from storage",
			})
		}
		return c.JSON(200, echo.Map{
			"message": "deleted document",
		})
	}
}

func CreateGetPresignedUrl(d models.DocumentModel) echo.HandlerFunc {
	return func(c echo.Context) error {
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
}

func CreatePutPresignedUrl(d models.DocumentModel) echo.HandlerFunc {
	return func(c echo.Context) error {
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
}
