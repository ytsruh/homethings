package handlers

import (
	"net/http"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/pkg/storage"
)

type FeedbackModel interface {
	Create(feedback *storage.Feedback) error
}

type UpdateFeedbackInput struct {
	Title string `json:"title" validate:"required"`
	Body  string `json:"body"`
}

func (h *APIHandler) CreateFeedback() echo.HandlerFunc {
	return func(c echo.Context) error {
		input := new(UpdateFeedbackInput)
		if err := c.Bind(input); err != nil {
			return c.JSON(http.StatusBadRequest, echo.Map{
				"message": "bad request",
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
		feedback := &storage.Feedback{
			Title:  input.Title,
			Body:   &input.Body,
			UserId: claims.Id,
		}
		err = h.Feedback.Create(feedback)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to create feedback",
			})
		}
		return c.JSON(http.StatusOK, echo.Map{
			"message": "success",
		})
	}
}
