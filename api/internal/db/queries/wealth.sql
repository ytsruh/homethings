-- name: ListAccountsByUser :many
SELECT * FROM wealth_accounts
WHERE user_id = ?
ORDER BY type, name;

-- name: GetAccountByID :one
SELECT * FROM wealth_accounts
WHERE id = ? AND user_id = ?;

-- name: CreateAccount :one
INSERT INTO wealth_accounts (id, name, type, is_liquid, is_closed, user_id, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: UpdateAccount :one
UPDATE wealth_accounts
SET name = ?, type = ?, is_liquid = ?, is_closed = ?
WHERE id = ? AND user_id = ?
RETURNING *;

-- name: DeleteAccount :one
DELETE FROM wealth_accounts
WHERE id = ? AND user_id = ?
RETURNING *;

-- name: ListValuesByYearMonth :many
SELECT wav.* FROM wealth_account_values wav
JOIN wealth_accounts wa ON wav.account_id = wa.id
WHERE wa.user_id = ? AND wav.year_month = ?
ORDER BY wa.type, wa.name;

-- name: GetValueByAccountAndMonth :one
SELECT wav.* FROM wealth_account_values wav
JOIN wealth_accounts wa ON wav.account_id = wa.id
WHERE wav.account_id = ? AND wav.year_month = ? AND wa.user_id = ?;

-- name: UpsertValue :one
INSERT INTO wealth_account_values (id, account_id, year_month, value, created_at)
VALUES (?, ?, ?, ?, ?)
ON CONFLICT(account_id, year_month) DO UPDATE SET value = excluded.value
RETURNING *;

-- name: GetValuesByAccountID :many
SELECT wav.* FROM wealth_account_values wav
JOIN wealth_accounts wa ON wav.account_id = wa.id
WHERE wav.account_id = ? AND wa.user_id = ?
ORDER BY wav.year_month;

-- name: GetAllValuesForUser :many
SELECT wav.* FROM wealth_account_values wav
JOIN wealth_accounts wa ON wav.account_id = wa.id
WHERE wa.user_id = ?
ORDER BY wav.year_month;