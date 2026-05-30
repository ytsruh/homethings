-- name: ListNotesByCompletion :many
SELECT * FROM notes
WHERE completed = ? AND created_by = ?
ORDER BY created_at DESC;

-- name: GetNoteByID :one
SELECT * FROM notes
WHERE id = ? AND created_by = ?;

-- name: CreateNote :one
INSERT INTO notes (id, title, body, priority, completed, created_by, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: UpdateNote :one
UPDATE notes
SET title = ?, body = ?, priority = ?, completed = ?, updated_at = ?
WHERE id = ? AND created_by = ?
RETURNING *;

-- name: DeleteNote :one
DELETE FROM notes
WHERE id = ? AND created_by = ?
RETURNING *;
