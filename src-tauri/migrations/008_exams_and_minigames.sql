-- =============================================================================
-- Unit exams + Mini-games
-- =============================================================================

CREATE TABLE IF NOT EXISTS unit_exam_progress (
    unit_id INTEGER PRIMARY KEY REFERENCES units(id) ON DELETE CASCADE,
    best_score INTEGER,
    last_score INTEGER,
    completions INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TEXT,
    passed_at TEXT
);

CREATE TABLE IF NOT EXISTS minigame_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_key TEXT NOT NULL,
    score INTEGER NOT NULL,
    duration_seconds INTEGER,
    played_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_minigame_key ON minigame_scores(game_key, played_at);
