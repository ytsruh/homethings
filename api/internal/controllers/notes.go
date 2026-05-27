package controllers

import (
	"context"
	"database/sql"
	"net/http"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"ytsruh.com/homethings/internal/db"
	"ytsruh.com/homethings/internal/utils"
)

type NotesController struct {
	db       *db.DB
	validate *validator.Validate
}

func NewNotesController(database *db.DB) *NotesController {
	return &NotesController{
		db:       database,
		validate: validator.New(),
	}
}

type NoteResponse struct {
	ID        string             `json:"id"`
	Title     string             `json:"title"`
	Body      *string            `json:"body"`
	Priority  string             `json:"priority"`
	Completed bool               `json:"completed"`
	CreatedBy string             `json:"createdBy"`
	CreatedAt string             `json:"createdAt"`
	UpdatedAt string             `json:"updatedAt"`
	Comments  []NotesCommentResp `json:"comments,omitempty"`
}

type NotesCommentResp struct {
	ID        string `json:"id"`
	Comment   string `json:"comment"`
	NoteID    string `json:"noteId"`
	CreatedAt string `json:"createdAt"`
}

type CreateNoteRequest struct {
	Title    string `json:"title" validate:"required"`
	Body     string `json:"body"`
	Priority string `json:"priority"`
}

type UpdateNoteRequest struct {
	Title     *string `json:"title"`
	Body      *string `json:"body"`
	Priority  *string `json:"priority"`
	Completed *bool   `json:"completed"`
}

func parseNote(dbNote db.Note, comments []db.NotesComment) (NoteResponse, error) {
	body := utils.NullStringToPtr(dbNote.Body)

	return NoteResponse{
		ID:        dbNote.ID,
		Title:     dbNote.Title,
		Body:      body,
		Priority:  dbNote.Priority,
		Completed: dbNote.Completed == 1,
		CreatedBy: dbNote.CreatedBy,
		CreatedAt: formatTimestampISO8601(dbNote.CreatedAt),
		UpdatedAt: formatTimestampISO8601(dbNote.UpdatedAt),
		Comments:  parseComments(comments),
	}, nil
}

func parseComments(comments []db.NotesComment) []NotesCommentResp {
	result := make([]NotesCommentResp, 0, len(comments))
	for _, c := range comments {
		result = append(result, NotesCommentResp{
			ID:        c.ID,
			Comment:   c.Comment,
			NoteID:    c.NoteID,
			CreatedAt: formatTimestampISO8601(c.CreatedAt),
		})
	}
	return result
}

func formatTimestampISO8601(ts int64) string {
	if ts <= 0 {
		return time.Now().UTC().Format("2006-01-02T15:04:05.000Z")
	}
	return time.Unix(ts, 0).UTC().Format("2006-01-02T15:04:05.000Z")
}

func (ctrl *NotesController) List(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)
	completedParam := c.QueryParam("completed")

	var completed int64 = 0
	if completedParam == "true" {
		completed = 1
	}

	notes, err := ctrl.db.Queries().ListNotesByCompletion(context.Background(), db.ListNotesByCompletionParams{
		Completed: completed,
		CreatedBy: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch notes"})
	}

	response := make([]NoteResponse, 0, len(notes))
	for _, note := range notes {
		comments, _ := ctrl.db.Queries().ListCommentsByNoteID(context.Background(), note.ID)
		parsed, err := parseNote(note, comments)
		if err != nil {
			continue
		}
		response = append(response, parsed)
	}

	return c.JSON(http.StatusOK, response)
}

func (ctrl *NotesController) Get(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Note ID required"})
	}

	note, err := ctrl.db.Queries().GetNoteByID(context.Background(), db.GetNoteByIDParams{
		ID:        id,
		CreatedBy: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Note not found"})
	}

	comments, _ := ctrl.db.Queries().ListCommentsByNoteID(context.Background(), note.ID)

	response, err := parseNote(note, comments)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to parse note"})
	}

	return c.JSON(http.StatusOK, response)
}

func (ctrl *NotesController) Create(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)

	var req CreateNoteRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	if req.Title == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Title is required"})
	}

	priority := req.Priority
	if priority == "" {
		priority = "medium"
	}
	if priority != "low" && priority != "medium" && priority != "high" && priority != "urgent" {
		priority = "medium"
	}

	body := req.Body
	if body == "" {
		body = ""
	}

	now := time.Now().Unix()
	noteID := uuid.New().String()

	_, err := ctrl.db.Queries().CreateNote(context.Background(), db.CreateNoteParams{
		ID:        noteID,
		Title:     req.Title,
		Body:      sql.NullString{String: body, Valid: true},
		Priority:  priority,
		Completed: 0,
		CreatedBy: user.UserID,
		CreatedAt: now,
		UpdatedAt: now,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to create note"})
	}

	created, err := ctrl.db.Queries().GetNoteByID(context.Background(), db.GetNoteByIDParams{
		ID:        noteID,
		CreatedBy: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch created note"})
	}

	response, err := parseNote(created, nil)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to parse note"})
	}

	return c.JSON(http.StatusCreated, response)
}

func (ctrl *NotesController) Update(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Note ID required"})
	}

	existing, err := ctrl.db.Queries().GetNoteByID(context.Background(), db.GetNoteByIDParams{
		ID:        id,
		CreatedBy: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Note not found"})
	}

	var req UpdateNoteRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	title := existing.Title
	if req.Title != nil {
		title = *req.Title
	}

	body := existing.Body
	if req.Body != nil {
		body = sql.NullString{String: *req.Body, Valid: true}
	}

	priority := existing.Priority
	if req.Priority != nil {
		if *req.Priority == "low" || *req.Priority == "medium" || *req.Priority == "high" || *req.Priority == "urgent" {
			priority = *req.Priority
		}
	}

	completed := existing.Completed
	if req.Completed != nil {
		if *req.Completed {
			completed = 1
		} else {
			completed = 0
		}
	}

	now := time.Now().Unix()

	_, err = ctrl.db.Queries().UpdateNote(context.Background(), db.UpdateNoteParams{
		Title:     title,
		Body:      body,
		Priority:  priority,
		Completed: completed,
		UpdatedAt: now,
		ID:        id,
		CreatedBy: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to update note"})
	}

	updated, err := ctrl.db.Queries().GetNoteByID(context.Background(), db.GetNoteByIDParams{
		ID:        id,
		CreatedBy: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch updated note"})
	}

	comments, _ := ctrl.db.Queries().ListCommentsByNoteID(context.Background(), updated.ID)

	response, err := parseNote(updated, comments)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to parse note"})
	}

	return c.JSON(http.StatusOK, response)
}

func (ctrl *NotesController) Delete(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)
	id := c.Param("id")
	if id == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Note ID required"})
	}

	_, err := ctrl.db.Queries().DeleteNote(context.Background(), db.DeleteNoteParams{
		ID:        id,
		CreatedBy: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Note not found"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Note deleted"})
}
