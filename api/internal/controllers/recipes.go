package controllers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"ytsruh.com/homethings/internal/db"
	"ytsruh.com/homethings/internal/utils"
)

type RecipesController struct {
	db       *db.DB
	validate *validator.Validate
}

func NewRecipesController(database *db.DB) *RecipesController {
	return &RecipesController{
		db:       database,
		validate: validator.New(),
	}
}

type Ingredient struct {
	Name   string `json:"name"`
	Amount string `json:"amount"`
}

type RecipeResponse struct {
	ID          string       `json:"id"`
	Title       string       `json:"title"`
	Description *string      `json:"description"`
	Tags        []string     `json:"tags"`
	Ingredients []Ingredient `json:"ingredients"`
	Steps       []string     `json:"steps"`
	ImageKey    *string      `json:"imageKey"`
	CreatedAt   string       `json:"createdAt"`
	UpdatedAt   string       `json:"updatedAt"`
}

type CreateRecipeRequest struct {
	Title       string       `json:"title" validate:"required"`
	Description *string     `json:"description"`
	Tags        []string     `json:"tags"`
	Ingredients []Ingredient `json:"ingredients"`
	Steps       []string     `json:"steps"`
	ImageKey    *string      `json:"imageKey"`
}

type UpdateRecipeRequest struct {
	Title       *string      `json:"title"`
	Description *string      `json:"description"`
	Tags        []string     `json:"tags"`
	Ingredients []Ingredient `json:"ingredients"`
	Steps       []string     `json:"steps"`
	ImageKey    *string      `json:"imageKey"`
}

type ExtractRecipeRequest struct {
	ImageData string `json:"imageData" validate:"required"`
}

type RecipeImageUploadRequest struct {
	FileType string `json:"fileType" validate:"required,oneof=image/jpeg image/png image/webp image/gif"`
}

func parseRecipe(dbRecipe db.Recipe) (RecipeResponse, error) {
	description := utils.NullStringToPtr(dbRecipe.Description)
	imageKey := utils.NullStringToPtr(dbRecipe.ImageKey)

	var tags []string
	if dbRecipe.Tags.Valid && dbRecipe.Tags.String != "" {
		if err := json.Unmarshal([]byte(dbRecipe.Tags.String), &tags); err != nil {
			tags = []string{}
		}
	} else {
		tags = []string{}
	}

	var ingredients []Ingredient
	if dbRecipe.Ingredients.Valid && dbRecipe.Ingredients.String != "" {
		if err := json.Unmarshal([]byte(dbRecipe.Ingredients.String), &ingredients); err != nil {
			ingredients = []Ingredient{}
		}
	} else {
		ingredients = []Ingredient{}
	}

	var steps []string
	if dbRecipe.Steps.Valid && dbRecipe.Steps.String != "" {
		if err := json.Unmarshal([]byte(dbRecipe.Steps.String), &steps); err != nil {
			steps = []string{}
		}
	} else {
		steps = []string{}
	}

	createdAt := formatTimestamp(dbRecipe.CreatedAt)
	updatedAt := formatTimestamp(dbRecipe.UpdatedAt)

	return RecipeResponse{
		ID:          dbRecipe.ID,
		Title:       dbRecipe.Title,
		Description: description,
		Tags:        tags,
		Ingredients: ingredients,
		Steps:       steps,
		ImageKey:    imageKey,
		CreatedAt:   createdAt,
		UpdatedAt:   updatedAt,
	}, nil
}

func formatTimestamp(ts int64) string {
	if ts <= 0 {
		return time.Now().UTC().Format(time.RFC3339)
	}
	return time.Unix(ts, 0).UTC().Format(time.RFC3339)
}

func (ctrl *RecipesController) Extract(c echo.Context) error {
	var req ExtractRecipeRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	if req.ImageData == "" || !strings.HasPrefix(req.ImageData, "data:image/") {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid image data. Expected base64 data URI."})
	}

	extracted, err := utils.ExtractRecipeFromImage(req.ImageData)
	if err != nil {
		fmt.Println("AI extraction failed:", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Failed to extract recipe from image: " + err.Error()})
	}

	if extracted.Title == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Could not extract recipe title from image"})
	}

	tagsJSON, _ := json.Marshal(extracted.Tags)
	ingredientsJSON, _ := json.Marshal(extracted.Ingredients)
	stepsJSON, _ := json.Marshal(extracted.Steps)

	now := time.Now().Unix()
	recipeID := uuid.New().String()

	_, err = ctrl.db.Queries().CreateRecipe(context.Background(), db.CreateRecipeParams{
		ID:          recipeID,
		Title:       extracted.Title,
		Description: utils.StringToNullString(extracted.Description),
		Tags:        sql.NullString{String: string(tagsJSON), Valid: true},
		Ingredients: sql.NullString{String: string(ingredientsJSON), Valid: true},
		Steps:       sql.NullString{String: string(stepsJSON), Valid: true},
		ImageKey:    sql.NullString{},
		CreatedAt:   now,
		UpdatedAt:   now,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to create recipe"})
	}

	created, err := ctrl.db.Queries().GetRecipe(context.Background(), recipeID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch created recipe"})
	}

	response, err := parseRecipe(created)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to parse recipe"})
	}

	return c.JSON(http.StatusCreated, response)
}

func (ctrl *RecipesController) List(c echo.Context) error {
	tag := c.QueryParam("tag")

	var recipes []db.Recipe
	var err error

	if tag != "" {
		recipes, err = ctrl.db.Queries().ListRecipesByTag(context.Background(), sql.NullString{String: tag, Valid: true})
	} else {
		recipes, err = ctrl.db.Queries().ListRecipes(context.Background())
	}
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch recipes"})
	}

	response := make([]RecipeResponse, 0, len(recipes))
	for _, recipe := range recipes {
		parsed, err := parseRecipe(recipe)
		if err != nil {
			continue
		}
		response = append(response, parsed)
	}

	return c.JSON(http.StatusOK, response)
}

func (ctrl *RecipesController) Get(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Recipe ID required"})
	}

	recipe, err := ctrl.db.Queries().GetRecipe(context.Background(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Recipe not found"})
	}

	response, err := parseRecipe(recipe)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to parse recipe"})
	}

	return c.JSON(http.StatusOK, response)
}

func (ctrl *RecipesController) Create(c echo.Context) error {
	var req CreateRecipeRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	if req.Title == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Title is required"})
	}

	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}
	ingredients := req.Ingredients
	if ingredients == nil {
		ingredients = []Ingredient{}
	}
	steps := req.Steps
	if steps == nil {
		steps = []string{}
	}

	tagsJSON, _ := json.Marshal(tags)
	ingredientsJSON, _ := json.Marshal(ingredients)
	stepsJSON, _ := json.Marshal(steps)

	now := time.Now().Unix()
	recipeID := uuid.New().String()

	_, err := ctrl.db.Queries().CreateRecipe(context.Background(), db.CreateRecipeParams{
		ID:          recipeID,
		Title:       req.Title,
		Description: utils.StringToNullStringPtr(req.Description),
		Tags:        sql.NullString{String: string(tagsJSON), Valid: true},
		Ingredients: sql.NullString{String: string(ingredientsJSON), Valid: true},
		Steps:       sql.NullString{String: string(stepsJSON), Valid: true},
		ImageKey:    utils.StringToNullStringPtr(req.ImageKey),
		CreatedAt:   now,
		UpdatedAt:   now,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to create recipe"})
	}

	created, err := ctrl.db.Queries().GetRecipe(context.Background(), recipeID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch created recipe"})
	}

	response, err := parseRecipe(created)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to parse recipe"})
	}

	return c.JSON(http.StatusCreated, response)
}

func (ctrl *RecipesController) Update(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Recipe ID required"})
	}

	var req UpdateRecipeRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	existing, err := ctrl.db.Queries().GetRecipe(context.Background(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Recipe not found"})
	}

	if req.ImageKey == nil && existing.ImageKey.Valid {
		imageKeyStr := existing.ImageKey.String
		if imageKeyStr != "" {
			_ = utils.DeleteObject(imageKeyStr)
		}
	}

	title := existing.Title
	if req.Title != nil {
		title = *req.Title
	}

	description := existing.Description
	if req.Description != nil {
		description = sql.NullString{String: *req.Description, Valid: true}
	}

	tags := existing.Tags
	if req.Tags != nil {
		tagsJSON, _ := json.Marshal(req.Tags)
		tags = sql.NullString{String: string(tagsJSON), Valid: true}
	}

	ingredients := existing.Ingredients
	if req.Ingredients != nil {
		ingredientsJSON, _ := json.Marshal(req.Ingredients)
		ingredients = sql.NullString{String: string(ingredientsJSON), Valid: true}
	}

	steps := existing.Steps
	if req.Steps != nil {
		stepsJSON, _ := json.Marshal(req.Steps)
		steps = sql.NullString{String: string(stepsJSON), Valid: true}
	}

	imageKey := existing.ImageKey
	if req.ImageKey != nil {
		imageKey = utils.StringToNullStringPtr(req.ImageKey)
	}

	now := time.Now().Unix()

	_, err = ctrl.db.Queries().UpdateRecipe(context.Background(), db.UpdateRecipeParams{
		Title:       title,
		Description: description,
		Tags:        tags,
		Ingredients: ingredients,
		Steps:       steps,
		ImageKey:    imageKey,
		UpdatedAt:   now,
		ID:          id,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to update recipe"})
	}

	updated, err := ctrl.db.Queries().GetRecipe(context.Background(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch updated recipe"})
	}

	response, err := parseRecipe(updated)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to parse recipe"})
	}

	return c.JSON(http.StatusOK, response)
}

func (ctrl *RecipesController) Delete(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Recipe ID required"})
	}

	existing, err := ctrl.db.Queries().GetRecipe(context.Background(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Recipe not found"})
	}

	if existing.ImageKey.Valid && existing.ImageKey.String != "" {
		_ = utils.DeleteObject(existing.ImageKey.String)
	}

	_, err = ctrl.db.Queries().DeleteRecipe(context.Background(), id)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to delete recipe"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Recipe deleted"})
}

func (ctrl *RecipesController) GetUploadURL(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Recipe ID required"})
	}

	var req RecipeImageUploadRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	if err := ctrl.validate.Struct(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid file type"})
	}

	existing, err := ctrl.db.Queries().GetRecipe(context.Background(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Recipe not found"})
	}

	if existing.ImageKey.Valid && existing.ImageKey.String != "" {
		_ = utils.DeleteObject(existing.ImageKey.String)
	}

	fileExt := strings.Split(req.FileType, "/")[1]
	imageKey := fmt.Sprintf("recipes/%s.%s", id, fileExt)

	presignedURL, err := utils.CreatePresignedPutURL(imageKey, req.FileType)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to generate presigned URL"})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"imageKey":    imageKey,
		"presignedUrl": presignedURL,
	})
}

func (ctrl *RecipesController) GetImageURL(c echo.Context) error {
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Recipe ID required"})
	}

	recipe, err := ctrl.db.Queries().GetRecipe(context.Background(), id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Recipe not found"})
	}

	if !recipe.ImageKey.Valid || recipe.ImageKey.String == "" {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Recipe image not found"})
	}

	presignedURLC, err := utils.CreatePresignedGetURL(recipe.ImageKey.String)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to generate presigned URL"})
	}

	return c.JSON(http.StatusOK, map[string]string{"presignedUrl": presignedURLC})
}
