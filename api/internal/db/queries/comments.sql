-- name: ListCommentsByNoteID :many
SELECT * FROM notes_comments
WHERE note_id = ?
ORDER BY created_at DESC;

-- name: GetCommentByID :one
SELECT * FROM notes_comments
WHERE id = ?;

-- name: CreateComment :one
INSERT INTO notes_comments (id, comment, note_id, created_at)
VALUES (?, ?, ?, ?)
RETURNING *;

-- name: DeleteComment :one
DELETE FROM notes_comments
WHERE id = ? AND note_id = ?
RETURNING *;
