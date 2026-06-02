-- =============================================================================
-- Video-game progression model:
--   - player_state: level, XP, stars (currency), active boosts
--   - daily_missions: 3-4 small objectives per day
--   - weekly_missions: 2-3 bigger objectives per week
--   - rewards: catalog of perks players can buy with stars
--   - reward_purchases: inventory of bought rewards (used or available)
-- =============================================================================

CREATE TABLE IF NOT EXISTS player_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    level INTEGER NOT NULL DEFAULT 1,
    total_xp INTEGER NOT NULL DEFAULT 0,
    current_level_xp INTEGER NOT NULL DEFAULT 0,
    stars INTEGER NOT NULL DEFAULT 0,
    rest_days_available INTEGER NOT NULL DEFAULT 0,
    rest_day_active_on TEXT,                -- date the rest day is being used
    double_xp_until TEXT,                   -- ISO datetime
    last_level_up_at TEXT,
    title TEXT NOT NULL DEFAULT 'Aprendiz',
    title_jp TEXT NOT NULL DEFAULT '初心者',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO player_state (id) VALUES (1);

-- Daily missions: regenerate at the start of each local day
CREATE TABLE IF NOT EXISTS daily_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_date TEXT NOT NULL,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    xp_reward INTEGER NOT NULL,
    star_reward INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(mission_date, kind)
);
CREATE INDEX IF NOT EXISTS idx_daily_missions_date ON daily_missions(mission_date);

-- Weekly missions: regenerate at the start of each ISO week (Monday)
CREATE TABLE IF NOT EXISTS weekly_missions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    week_start TEXT NOT NULL,                -- yyyy-mm-dd of Monday
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    progress INTEGER NOT NULL DEFAULT 0,
    xp_reward INTEGER NOT NULL,
    star_reward INTEGER NOT NULL DEFAULT 0,
    completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(week_start, kind)
);
CREATE INDEX IF NOT EXISTS idx_weekly_missions_week ON weekly_missions(week_start);

-- XP gain event log (powers animations, undo, daily summaries)
CREATE TABLE IF NOT EXISTS xp_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER NOT NULL,
    star_amount INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL,
    reference TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_xp_date ON xp_events(created_at);

-- Reward catalog (seeded below)
CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    cost INTEGER NOT NULL,
    kind TEXT NOT NULL,        -- 'rest_day' | 'double_xp_24h' | 'skip_review' | 'hint_pack'
    metadata TEXT
);

-- Items the player has purchased (and possibly used)
CREATE TABLE IF NOT EXISTS reward_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reward_id INTEGER NOT NULL REFERENCES rewards(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    purchased_at TEXT NOT NULL DEFAULT (datetime('now')),
    used_at TEXT,
    metadata TEXT
);
CREATE INDEX IF NOT EXISTS idx_reward_purchases_unused ON reward_purchases(used_at)
    WHERE used_at IS NULL;

-- Replace streak-based achievements with progression-based ones.
DELETE FROM achievement_unlocks;
DELETE FROM achievements;

INSERT INTO achievements (id, key, title, description, icon, tier, target, metric) VALUES
    (1,  'level_3',         'Aprendiz',           'Alcanza el nivel 3',                'star',           'bronze',   3,    'level'),
    (2,  'level_10',        'Estudiante',         'Alcanza el nivel 10',               'star',           'silver',  10,    'level'),
    (3,  'level_25',        'Lingüista',          'Alcanza el nivel 25',               'star',           'gold',    25,    'level'),
    (4,  'level_50',        'Maestro',            'Alcanza el nivel 50',               'crown',          'gold',    50,    'level'),
    (5,  'missions_10',     'Comprometido',       'Completa 10 misiones',              'target',         'bronze',  10,    'missions_completed'),
    (6,  'missions_50',     'Disciplinado',       'Completa 50 misiones',              'target',         'silver',  50,    'missions_completed'),
    (7,  'missions_200',    'Imparable',          'Completa 200 misiones',             'target',         'gold',   200,    'missions_completed'),
    (8,  'weekly_5',        'Vencedor semanal',   'Completa 5 misiones semanales',     'trophy',         'silver',   5,    'weekly_completed'),
    (9,  'kanji_10',        'Primer kanji',       'Domina 10 kanjis',                  'pen-tool',       'bronze',  10,    'kanji_mastered'),
    (10, 'kanji_50',        '50 kanjis',          'Domina 50 kanjis',                  'pen-tool',       'silver',  50,    'kanji_mastered'),
    (11, 'kanji_100',       '100 kanjis',         'Domina 100 kanjis',                 'pen-tool',       'gold',   100,    'kanji_mastered'),
    (12, 'kanji_500',       '500 kanjis',         'Domina 500 kanjis',                 'pen-tool',       'gold',   500,    'kanji_mastered'),
    (13, 'vocab_100',       '100 palabras',       'Construye 100 palabras',            'book-open',      'silver', 100,    'vocab_mastered'),
    (14, 'journal_first',   'Primera entrada',    'Escribe tu primera entrada',        'feather',        'bronze',   1,    'journal_count'),
    (15, 'journal_30',      'Diarista',           '30 entradas de diario',             'feather',        'silver',  30,    'journal_count'),
    (16, 'grammar_n5',      'N5 dominado',        'Domina toda la gramática N5',       'graduation-cap', 'gold',     1,    'grammar_n5_complete'),
    (17, 'minutes_300',     '5 horas',            'Acumula 300 minutos de estudio',    'clock',          'bronze', 300,    'minutes'),
    (18, 'minutes_1500',    '25 horas',           'Acumula 1500 minutos de estudio',   'clock',          'gold',  1500,    'minutes'),
    (19, 'stars_500',       'Coleccionista',      'Acumula 500 estrellas',             'sparkles',       'silver', 500,    'stars_earned');

-- Seed reward catalog
INSERT INTO rewards (id, key, name, description, icon, cost, kind, metadata) VALUES
    (1, 'rest_day_1',     'Día libre',          'Salta un día sin perder tu progreso ni tus misiones diarias.', 'coffee',    30, 'rest_day',      NULL),
    (2, 'double_xp_24',   'XP doble (24h)',     'Duplica el XP ganado en las próximas 24 horas.',                'sparkles',  25, 'double_xp_24h', NULL),
    (3, 'skip_review_3',  'Saltar 3 repasos',   'Salta hasta 3 kanjis pendientes de hoy sin penalización.',     'forward',   15, 'skip_review',   '{"count":3}'),
    (4, 'hint_pack_5',    'Pack de 5 pistas',   'Pide hasta 5 pistas en quizzes y repasos.',                    'lightbulb', 10, 'hint_pack',     '{"count":5}'),
    (5, 'theme_sakura',   'Tema Sakura',        'Desbloquea un tema visual rosado inspirado en cerezos.',       'palette',   60, 'theme',         '{"theme":"sakura"}'),
    (6, 'theme_sumi',     'Tema Sumi-e',        'Desbloquea un tema visual de tinta china.',                    'palette',   60, 'theme',         '{"theme":"sumi"}');
