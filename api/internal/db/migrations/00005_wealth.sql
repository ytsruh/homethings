-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS wealth_accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('asset', 'liability')),
    is_liquid INTEGER DEFAULT 0 NOT NULL,
    is_closed INTEGER DEFAULT 0 NOT NULL,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS wealth_account_values (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    year_month TEXT NOT NULL,
    value INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    UNIQUE(account_id, year_month),
    FOREIGN KEY (account_id) REFERENCES wealth_accounts(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_wealth_accounts_user_id ON wealth_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_wealth_account_values_account_id ON wealth_account_values(account_id);
CREATE INDEX IF NOT EXISTS idx_wealth_account_values_year_month ON wealth_account_values(year_month);
-- +goose StatementEnd
-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS wealth_account_values;
DROP TABLE IF EXISTS wealth_accounts;
-- +goose StatementEnd