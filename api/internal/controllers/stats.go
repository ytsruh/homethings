package controllers

import (
	"context"
	"net/http"

	"github.com/labstack/echo/v4"
	"ytsruh.com/homethings/internal/db"
	"ytsruh.com/homethings/internal/utils"
)

type StatsController struct {
	db *db.DB
}

func NewStatsController(database *db.DB) *StatsController {
	return &StatsController{db: database}
}

type StatsResponse struct {
	Notes struct {
		Open      int64 `json:"open"`
		Completed int64 `json:"completed"`
	} `json:"notes"`
	Recipes struct {
		// Total counts all recipes: recipes are shared globally,
		// not attributed to a single user.
		Total int64 `json:"total"`
	} `json:"recipes"`
}

// Summary returns dashboard counts: per-user open/completed notes plus the
// global (shared) recipe total.
func (ctrl *StatsController) Summary(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)
	ctx := context.Background()
	queries := ctrl.db.Queries()

	open, err := queries.CountNotesByCompletion(ctx, db.CountNotesByCompletionParams{
		Completed: 0,
		CreatedBy: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to load stats"})
	}
	completed, err := queries.CountNotesByCompletion(ctx, db.CountNotesByCompletionParams{
		Completed: 1,
		CreatedBy: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to load stats"})
	}
	totalRecipes, err := queries.CountRecipes(ctx)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to load stats"})
	}

	var resp StatsResponse
	resp.Notes.Open = open
	resp.Notes.Completed = completed
	resp.Recipes.Total = totalRecipes
	return c.JSON(http.StatusOK, resp)
}
