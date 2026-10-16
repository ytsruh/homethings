-- name: CreateChatSession :one
INSERT INTO chat_sessions (id, user_id, model, title, created_at, updated_at, deleted_at)
VALUES (?, ?, ?, ?, ?, ?, NULL)
RETURNING *;

-- name: GetChatSession :one
SELECT * FROM chat_sessions
WHERE id = ? AND user_id = ? AND deleted_at IS NULL;

-- name: ListChatSessions :many
SELECT * FROM chat_sessions
WHERE user_id = ? AND deleted_at IS NULL
ORDER BY updated_at DESC;

-- name: UpdateChatSessionTitle :one
UPDATE chat_sessions
SET title = ?, updated_at = ?
WHERE id = ? AND user_id = ? AND deleted_at IS NULL
RETURNING *;

-- name: TouchChatSession :one
UPDATE chat_sessions
SET model = ?, updated_at = ?
WHERE id = ? AND user_id = ? AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteChatSession :one
UPDATE chat_sessions
SET deleted_at = ?, updated_at = ?
WHERE id = ? AND user_id = ? AND deleted_at IS NULL
RETURNING *;

-- name: CreateChatMessage :one
INSERT INTO chat_messages (id, session_id, role, content, created_at)
VALUES (?, ?, ?, ?, ?)
RETURNING *;

-- name: ListChatMessages :many
SELECT * FROM chat_messages
WHERE session_id = ?
ORDER BY created_at ASC;

-- name: CreateChatTokenUsage :one
INSERT INTO chat_token_usage (id, session_id, message_id, user_id, model, prompt_tokens, completion_tokens, total_tokens, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: SumTokenUsageByUser :many
SELECT model,
    COUNT(*) AS turns,
    CAST(COALESCE(SUM(prompt_tokens), 0) AS INTEGER) AS prompt_tokens,
    CAST(COALESCE(SUM(completion_tokens), 0) AS INTEGER) AS completion_tokens,
    CAST(COALESCE(SUM(total_tokens), 0) AS INTEGER) AS total_tokens
FROM chat_token_usage
WHERE user_id = ?
GROUP BY model
ORDER BY model ASC;
