package routes

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/db"
)

type UpdateFeedbackInput struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}

func createFeedback(c echo.Context) error {
	input := new(UpdateFeedbackInput)
	if err := c.Bind(input); err != nil {
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
	feedback := db.Feedback{
		Title:  input.Title,
		Body:   &input.Body,
		UserId: claims.Id,
	}
	tx := client.Create(&feedback)
	if tx.Error != nil {
		fmt.Println(tx.Error)
		return c.JSON(http.StatusInternalServerError, echo.Map{
			"message": "failed to create feedback",
		})
	}
	return c.JSON(http.StatusOK, echo.Map{
		"message": "success",
	})
}
