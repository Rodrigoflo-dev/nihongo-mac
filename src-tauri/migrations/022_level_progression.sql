-- =============================================================================
-- Level progression: the learner sees only their UNLOCKED level in "Curso".
-- Passing a level's final exam (>= 60%) unlocks the next level.
-- =============================================================================

ALTER TABLE player_state ADD COLUMN unlocked_level TEXT NOT NULL DEFAULT 'N5';

CREATE TABLE IF NOT EXISTS level_exam_progress (
    level TEXT PRIMARY KEY,
    best_score INTEGER,
    last_score INTEGER,
    completions INTEGER NOT NULL DEFAULT 0,
    passed_at TEXT,
    last_attempt_at TEXT
);
