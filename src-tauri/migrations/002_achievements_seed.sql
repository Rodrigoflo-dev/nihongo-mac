-- Seed initial achievement definitions
INSERT OR IGNORE INTO achievements (id, key, title, description, icon, tier, target, metric) VALUES
    (1,  'streak_3',       '3 días seguidos',       'Estudia 3 días consecutivos',          'flame',     'bronze',   3, 'streak'),
    (2,  'streak_7',       'Una semana fuerte',     'Estudia 7 días consecutivos',          'flame',     'silver',   7, 'streak'),
    (3,  'streak_30',      'Un mes completo',       'Estudia 30 días consecutivos',         'flame',     'gold',    30, 'streak'),
    (4,  'streak_100',     '100 días imparable',    'Estudia 100 días consecutivos',        'flame',     'gold',   100, 'streak'),
    (5,  'kanji_10',       '10 kanjis aprendidos',  'Aprende tus primeros 10 kanjis',       'pen-tool',  'bronze',  10, 'kanji_count'),
    (6,  'kanji_50',       '50 kanjis',             '50 kanjis en tu colección',            'pen-tool',  'silver',  50, 'kanji_count'),
    (7,  'kanji_100',      '100 kanjis',            '100 kanjis dominados',                 'pen-tool',  'gold',   100, 'kanji_count'),
    (8,  'vocab_50',       '50 palabras',           'Construye un vocabulario de 50 palabras', 'book-open', 'bronze', 50, 'vocab_count'),
    (9,  'vocab_200',      '200 palabras',          '200 palabras en tu vocabulario',       'book-open', 'silver', 200, 'vocab_count'),
    (10, 'journal_first',  'Primera entrada',       'Escribe tu primera entrada del diario','feather',   'bronze',   1, 'journal_count'),
    (11, 'journal_10',     'Diarista regular',      '10 entradas del diario',               'feather',   'silver',  10, 'journal_count'),
    (12, 'grammar_n5',     'N5 gramática completa', 'Domina toda la gramática de nivel N5', 'graduation-cap', 'gold', 1, 'grammar_n5_complete'),
    (13, 'minutes_300',    '5 horas estudiadas',    'Acumula 300 minutos de estudio',       'clock',     'bronze', 300, 'minutes'),
    (14, 'minutes_1500',   '25 horas estudiadas',   'Acumula 1500 minutos de estudio',      'clock',     'silver', 1500, 'minutes');
