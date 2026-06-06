-- 010_auth.sql
-- Local login: a single credential (username + salted PIN hash) that gates the
-- single-user profile. No row exists until the user sets a PIN on first run;
-- absence of a row means "no credential yet" → prompt to create one.

CREATE TABLE IF NOT EXISTS app_auth (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    username TEXT NOT NULL,
    pin_hash TEXT NOT NULL,
    pin_salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
