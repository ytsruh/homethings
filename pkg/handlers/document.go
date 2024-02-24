package handlers

import (
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/pkg/storage"
)

type DocumentModel interface {
	GetAllDocuments(accountId string) ([]storage.Document, error)
	GetDocumentById(accountId string, id string) error
	Create(doc *storage.Document) error
	Update(doc *storage.Document) error
	Delete(accountId string, id string) (*storage.Document, error)
}

type CreateDocumentInput struct {
	Title       string `json:"title" validate:"required"`
	Description string `json:"description"`
	FileName    string `json:"fileName"`
}

type UpdateDocumentInput struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

func (h *APIHandler) GetDocuments() echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := getUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		docs, err := h.Document.GetAllDocuments(claims.AccountId)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get documents",
			})
		}

		return c.JSON(200, docs)
	}
}

func (h *APIHandler) CreateDocument() echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := getUser(c)
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
		document := &storage.Document{
			Title:       input.Title,
			Description: &input.Description,
			FileName:    input.FileName,
			AccountId:   claims.AccountId,
		}
		err = h.Document.Create(document)
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

func (h *APIHandler) GetSingleDocument() echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := getUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		id := c.Param("id")
		err = h.Document.GetDocumentById(claims.AccountId, id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get documents",
			})
		}

		return c.JSON(200, h.Document)
	}
}

func (h *APIHandler) UpdateSingleDocument() echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := getUser(c)
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
		document := &storage.Document{
			ID:          id,
			Title:       input.Title,
			Description: &input.Description,
			AccountId:   claims.AccountId,
		}
		err = h.Document.Update(document)
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

func (h *APIHandler) DeleteSingleDocument() echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := getUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}
		id := c.Param("id")
		deleted, err := h.Document.Delete(claims.AccountId, id)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to delete document",
			})
		}
		err = storage.DeleteObject(deleted.FileName)
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

func (h *APIHandler) CreateGetPresignedUrl() echo.HandlerFunc {
	return func(c echo.Context) error {
		key := c.QueryParam("fileName")
		if key == "" {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "fileName is required",
			})
		}
		url, err := storage.CreatePresignedGetURL(key)
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

func (h *APIHandler) CreatePutPresignedUrl() echo.HandlerFunc {
	return func(c echo.Context) error {
		key := c.QueryParam("fileName")
		if key == "" {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "fileName is required",
			})
		}
		url, err := storage.CreatePresignedPutURL(key)
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
