package handlers

import (
	"fmt"
	"net/http"

	"github.com/labstack/echo/v4"
	"homethings.ytsruh.com/pkg/storage"
)

type UpdateProfileInput struct {
	Name          string `json:"name"`
	Email         string `json:"email"`
	ProfileImage  string `json:"profileImage"`
	ShowBooks     bool   `json:"showBooks"`
	ShowDocuments bool   `json:"showDocuments"`
}

func GetProfile(u storage.UserModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		claims, err := GetUser(c)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to get user",
			})
		}

		user, err := u.GetUserById(claims.Id)
		if err != nil {
			fmt.Println(err)
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to find user",
			})
		}
		return c.JSON(http.StatusOK, echo.Map{
			"id":            user.ID,
			"name":          user.Name,
			"email":         user.Email,
			"profileImage":  user.ProfileImage,
			"showBooks":     user.ShowBooks,
			"showDocuments": user.ShowDocuments,
		})
	}
}

func PatchProfile(u storage.UserModel) echo.HandlerFunc {
	return func(c echo.Context) error {
		input := new(UpdateProfileInput)
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

		updatedUser := storage.User{
			ID:            claims.Id,
			Name:          input.Name,
			Email:         input.Email,
			ProfileImage:  &input.ProfileImage,
			ShowBooks:     input.ShowBooks,
			ShowDocuments: input.ShowDocuments,
		}

		err = u.Update(updatedUser)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, echo.Map{
				"message": "failed to update user",
			})
		}
		return c.JSON(http.StatusOK, echo.Map{
			"message": "success",
		})
	}
}
