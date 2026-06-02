-- =============================================================================
-- Nihongo schema v1
-- =============================================================================

-- ---------------------------------------------------------------------------
-- User profile (single-row table, always id = 1)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT NOT NULL DEFAULT '',
    target_level TEXT NOT NULL DEFAULT 'N5',
    current_level TEXT NOT NULL DEFAULT 'N5',
    knows_hiragana INTEGER NOT NULL DEFAULT 0,
    knows_katakana INTEGER NOT NULL DEFAULT 0,
    daily_minutes_goal INTEGER NOT NULL DEFAULT 20,
    reminder_time TEXT,
    locale TEXT NOT NULL DEFAULT 'es',
    onboarded_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO user_profile (id) VALUES (1);

-- ---------------------------------------------------------------------------
-- Kanji catalogue (seeded from JSON)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kanji (
    id INTEGER PRIMARY KEY,
    character TEXT NOT NULL UNIQUE,
    meaning_es TEXT NOT NULL,
    meaning_en TEXT,
    onyomi TEXT,
    kunyomi TEXT,
    jlpt_level TEXT NOT NULL,
    grade INTEGER,
    stroke_count INTEGER,
    radical TEXT,
    examples TEXT,
    mnemonic TEXT,
    frequency INTEGER
);
CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON kanji(jlpt_level);

-- ---------------------------------------------------------------------------
-- Vocabulary
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    reading TEXT NOT NULL,
    meaning_es TEXT NOT NULL,
    meaning_en TEXT,
    jlpt_level TEXT NOT NULL,
    part_of_speech TEXT,
    example_jp TEXT,
    example_reading TEXT,
    example_translation TEXT,
    is_seed INTEGER NOT NULL DEFAULT 0,
    UNIQUE(word, reading)
);
CREATE INDEX IF NOT EXISTS idx_vocab_jlpt ON vocabulary(jlpt_level);

-- ---------------------------------------------------------------------------
-- SRS state — one row per (item_type, item_id) the user is studying
-- item_type: 'kanji' | 'vocabulary' | 'grammar' | 'kana'
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS srs_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    ease_factor REAL NOT NULL DEFAULT 2.5,
    interval_days REAL NOT NULL DEFAULT 0,
    repetitions INTEGER NOT NULL DEFAULT 0,
    next_review_at TEXT NOT NULL,
    last_reviewed_at TEXT,
    consecutive_failures INTEGER NOT NULL DEFAULT 0,
    total_reviews INTEGER NOT NULL DEFAULT 0,
    total_correct INTEGER NOT NULL DEFAULT 0,
    is_leech INTEGER NOT NULL DEFAULT 0,
    introduced_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(item_type, item_id)
);
CREATE INDEX IF NOT EXISTS idx_srs_due ON srs_items(item_type, next_review_at);

-- ---------------------------------------------------------------------------
-- Grammar lessons (seeded + AI-augmented)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS grammar_lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    jlpt_level TEXT NOT NULL,
    category TEXT,
    explanation_md TEXT NOT NULL,
    structure TEXT,
    examples TEXT,
    difficulty INTEGER NOT NULL DEFAULT 1,
    ordering INTEGER NOT NULL DEFAULT 0,
    is_seed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_grammar_jlpt ON grammar_lessons(jlpt_level, ordering);

CREATE TABLE IF NOT EXISTS grammar_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL UNIQUE REFERENCES grammar_lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'new',
    confidence INTEGER NOT NULL DEFAULT 0,
    last_quiz_at TEXT,
    last_quiz_score REAL,
    times_seen INTEGER NOT NULL DEFAULT 0,
    times_correct INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Japanese writing journal
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_date TEXT NOT NULL,
    text_jp TEXT NOT NULL,
    text_translation TEXT,
    corrections_json TEXT,
    ai_feedback TEXT,
    word_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(entry_date);

CREATE TABLE IF NOT EXISTS error_patterns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pattern_key TEXT NOT NULL UNIQUE,
    label TEXT NOT NULL,
    description TEXT,
    category TEXT,
    occurrences INTEGER NOT NULL DEFAULT 1,
    last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
    resolved INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Daily session aggregates + granular activity log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_date TEXT NOT NULL UNIQUE,
    minutes_studied INTEGER NOT NULL DEFAULT 0,
    activities_completed INTEGER NOT NULL DEFAULT 0,
    kanji_reviewed INTEGER NOT NULL DEFAULT 0,
    vocab_reviewed INTEGER NOT NULL DEFAULT 0,
    grammar_completed INTEGER NOT NULL DEFAULT 0,
    listening_minutes INTEGER NOT NULL DEFAULT 0,
    speaking_minutes INTEGER NOT NULL DEFAULT 0,
    journaled INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_type TEXT NOT NULL,
    item_id INTEGER,
    item_ref TEXT,
    correct INTEGER,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_log(created_at);

-- ---------------------------------------------------------------------------
-- Streak + achievements (gamification)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS streak_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT,
    freeze_count INTEGER NOT NULL DEFAULT 0
);
INSERT OR IGNORE INTO streak_state (id) VALUES (1);

CREATE TABLE IF NOT EXISTS achievements (
    id INTEGER PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    tier TEXT,
    target INTEGER NOT NULL,
    metric TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS achievement_unlocks (
    achievement_id INTEGER PRIMARY KEY REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ---------------------------------------------------------------------------
-- Cached AI study plan per day
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS study_plans (
    plan_date TEXT PRIMARY KEY,
    plan_json TEXT NOT NULL,
    minutes_target INTEGER NOT NULL,
    generated_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed INTEGER NOT NULL DEFAULT 0
);

-- ---------------------------------------------------------------------------
-- Key/value settings (Claude API key is stored in macOS Keychain, NOT here)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
