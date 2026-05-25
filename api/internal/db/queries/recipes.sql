-- name: ListRecipes :many
SELECT * FROM recipes WHERE 1=1 ORDER BY created_at DESC;

-- name: ListRecipesByTag :many
SELECT * FROM recipes WHERE tags LIKE '%' || ? || '%' ORDER BY created_at DESC;

-- name: GetRecipe :one
SELECT * FROM recipes WHERE id = ?;

-- name: CreateRecipe :one
INSERT INTO recipes (id, title, description, tags, ingredients, steps, image_key, created_at, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
RETURNING *;

-- name: UpdateRecipe :one
UPDATE recipes
SET title = ?, description = ?, tags = ?, ingredients = ?, steps = ?, image_key = ?, updated_at = ?
WHERE id = ?
RETURNING *;

-- name: DeleteRecipe :one
DELETE FROM recipes WHERE id = ? RETURNING *;
