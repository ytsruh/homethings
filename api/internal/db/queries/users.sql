-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = ?;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = ?;

-- name: CreateUser :one
INSERT INTO users (id, email, password_hash, name, created_at)
VALUES (?, ?, ?, ?, ?)
RETURNING *;

-- name: UpdateUser :one
UPDATE users
SET email = ?, name = ?, password_hash = ?
WHERE id = ?
RETURNING *;

-- name: UpdateUserNameEmail :one
UPDATE users
SET email = ?, name = ?
WHERE id = ?
RETURNING *;

-- name: UpdateUserPassword :one
UPDATE users SET password_hash = ? WHERE id = ? RETURNING *;
