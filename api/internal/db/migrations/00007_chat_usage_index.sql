-- +goose Up
-- +goose StatementBegin
CREATE INDEX IF NOT EXISTS idx_chat_token_usage_user_created ON chat_token_usage(user_id, created_at);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_chat_token_usage_user_created;
-- +goose StatementEnd
