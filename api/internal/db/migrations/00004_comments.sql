-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS notes_comments (
    id TEXT PRIMARY KEY,
    comment TEXT NOT NULL,
    note_id TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS notes_comments;
-- +goose StatementEnd
