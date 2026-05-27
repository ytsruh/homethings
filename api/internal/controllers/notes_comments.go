package controllers

import (
	"context"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"ytsruh.com/homethings/internal/db"
	"ytsruh.com/homethings/internal/utils"
)

type NotesCommentsController struct {
	db *db.DB
}

func NewNotesCommentsController(database *db.DB) *NotesCommentsController {
	return &NotesCommentsController{
		db: database,
	}
}

type CreateCommentRequest struct {
	Comment string `json:"comment" validate:"required"`
}

func (ctrl *NotesCommentsController) Create(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)
	noteID := c.Param("id")
	if noteID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Note ID required"})
	}

	note, err := ctrl.db.Queries().GetNoteByID(context.Background(), db.GetNoteByIDParams{
		ID:        noteID,
		CreatedBy: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Note not found"})
	}

	var req CreateCommentRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	if req.Comment == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Comment is required"})
	}

	now := time.Now().Unix()
	commentID := uuid.New().String()

	_, err = ctrl.db.Queries().CreateComment(context.Background(), db.CreateCommentParams{
		ID:        commentID,
		Comment:   req.Comment,
		NoteID:    note.ID,
		CreatedAt: now,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to create comment"})
	}

	created, err := ctrl.db.Queries().GetCommentByID(context.Background(), commentID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to fetch created comment"})
	}

	return c.JSON(http.StatusCreated, NotesCommentResp{
		ID:        created.ID,
		Comment:   created.Comment,
		NoteID:    created.NoteID,
		CreatedAt: formatTimestampISO8601(created.CreatedAt),
	})
}

func (ctrl *NotesCommentsController) Delete(c echo.Context) error {
	user := c.Get("user").(*utils.UserPayload)
	noteID := c.Param("id")
	commentID := c.Param("commentId")
	if noteID == "" || commentID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Note ID and Comment ID required"})
	}

	note, err := ctrl.db.Queries().GetNoteByID(context.Background(), db.GetNoteByIDParams{
		ID:        noteID,
		CreatedBy: user.UserID,
	})
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Note not found"})
	}

	comment, err := ctrl.db.Queries().GetCommentByID(context.Background(), commentID)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Comment not found"})
	}

	if comment.NoteID != note.ID {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Comment does not belong to this note"})
	}

	_, err = ctrl.db.Queries().DeleteComment(context.Background(), db.DeleteCommentParams{
		ID:     commentID,
		NoteID: noteID,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to delete comment"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Comment deleted"})
}
