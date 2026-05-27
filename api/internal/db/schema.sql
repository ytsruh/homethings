-- Schema for sqlc

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT DEFAULT '[]',
    ingredients TEXT DEFAULT '[]',
    steps TEXT DEFAULT '[]',
    image_key TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT,
    priority TEXT DEFAULT 'medium' NOT NULL,
    completed INTEGER DEFAULT false NOT NULL,
    created_by TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS notes_comments (
    id TEXT PRIMARY KEY,
    comment TEXT NOT NULL,
    note_id TEXT NOT NULL,
    created_at INTEGER NOT NULL
);
