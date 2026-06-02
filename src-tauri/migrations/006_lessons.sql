-- =============================================================================
-- Guided e-learning lessons
-- Course → Unit → Lesson → Activities (JSON)
-- =============================================================================

CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    jlpt_level TEXT NOT NULL,
    jp_title TEXT,
    ordering INTEGER NOT NULL DEFAULT 0,
    is_seed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS units (
    id INTEGER PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    jp_title TEXT,
    ordering INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_units_course ON units(course_id, ordering);

CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY,
    unit_id INTEGER NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    jp_title TEXT,
    summary TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 8,
    activities_json TEXT NOT NULL,
    ordering INTEGER NOT NULL DEFAULT 0,
    is_seed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON lessons(unit_id, ordering);

CREATE TABLE IF NOT EXISTS lesson_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'available',
    score INTEGER,
    best_score INTEGER,
    completions INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TEXT,
    completed_at TEXT
);

-- -----------------------------------------------------------------------------
-- Seed: Curso N5 → Unidad 1 (Empecemos) → 3 lecciones completas
-- -----------------------------------------------------------------------------
DELETE FROM lesson_progress WHERE lesson_id IN (SELECT id FROM lessons);
DELETE FROM lessons;
DELETE FROM units;
DELETE FROM courses;

INSERT INTO courses (id, title, description, jlpt_level, jp_title, ordering, is_seed) VALUES
(1, 'Japonés N5', 'Tu primer curso completo: desde tu primer kanji hasta tener conversaciones cortas.', 'N5', '初級コース', 1, 1);

INSERT INTO units (id, course_id, title, description, jp_title, ordering) VALUES
(1, 1, 'Empecemos', 'Primeros kanjis, partícula は y saludos. Si no sabes nada de japonés, empieza aquí.', '始めよう', 1),
(2, 1, 'Vida diaria', 'Decir qué haces, dónde estás y qué te gusta. Verbos en forma ます.', '日常生活', 2);

INSERT INTO lessons (id, unit_id, title, jp_title, summary, duration_minutes, ordering, is_seed, activities_json) VALUES
(1, 1, 'Tu primer kanji y "yo soy…"', '初めて',
 'Aprendes los kanji 私 y 学, la partícula は y a presentarte.', 8, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_kanji","kanjiChar":"私","meaning":"yo / privado","onyomi":["シ"],"kunyomi":["わたし"],"example":{"jp":"私は学生です。","reading":"わたしはがくせいです","meaning":"Soy estudiante."},"note":"Cuando hablas de ti en japonés cortés, usas 私 (わたし)."},
   {"id":"a2","kind":"intro_kanji","kanjiChar":"学","meaning":"estudiar / aprender","onyomi":["ガク"],"kunyomi":["まな"],"example":{"jp":"学生","reading":"がくせい","meaning":"estudiante"},"note":"Lo verás constantemente en palabras como 学校 (escuela) y 学生 (estudiante)."},
   {"id":"a3","kind":"intro_grammar","title":"は — partícula de tema","pattern":"X は Y です","explanation":"は marca el tema de la oración. \"X es Y\". Se escribe は pero se pronuncia wa.","example":{"jp":"私は学生です。","reading":"わたしはがくせいです","meaning":"Yo soy estudiante."}},
   {"id":"a4","kind":"intro_vocab","word":"学生","reading":"がくせい","meaning":"estudiante","example":"私は学生です。"},
   {"id":"a5","kind":"quiz","prompt":"¿Qué significa el kanji 私?","options":["maestro","estudiante","yo","escuela"],"correctIndex":2},
   {"id":"a6","kind":"quiz","promptJp":"私 ___ 学生です","prompt":"Completa con la partícula correcta","options":["は","を","に","の"],"correctIndex":0},
   {"id":"a7","kind":"quiz","prompt":"¿Cómo se pronuncia は cuando es partícula de tema?","options":["ha","wa","ba","pa"],"correctIndex":1},
   {"id":"a8","kind":"listening","textJp":"私は学生です。","voice":"Kyoko","prompt":"¿Qué está diciendo?","options":["Soy maestro","Soy estudiante","Soy japonés","Tengo un libro"],"correctIndex":1},
   {"id":"a9","kind":"speaking","textJp":"私は学生です。","reading":"わたしは がくせい です","meaning":"Yo soy estudiante.","voice":"Kyoko"},
   {"id":"a10","kind":"summary","learned":["2 kanjis: 私 y 学","La partícula は (tema)","Tu primera frase: 私は学生です","Vocabulario: 学生 (estudiante)"]}
 ]}'
),
(2, 1, 'Días, soles y lunas', 'にちようび',
 'Los kanji 日 y 月 más números básicos para fechas.', 8, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_kanji","kanjiChar":"日","meaning":"día / sol","onyomi":["ニチ","ジツ"],"kunyomi":["ひ","か"],"example":{"jp":"今日","reading":"きょう","meaning":"hoy"},"note":"Aparece en miles de palabras: 日本 (Japón), 毎日 (todos los días), 今日 (hoy)."},
   {"id":"a2","kind":"intro_kanji","kanjiChar":"月","meaning":"mes / luna","onyomi":["ゲツ","ガツ"],"kunyomi":["つき"],"example":{"jp":"一月","reading":"いちがつ","meaning":"enero"},"note":"Como kanji de mes, se usa con el número: 一月 enero, 二月 febrero…"},
   {"id":"a3","kind":"intro_kanji","kanjiChar":"一","meaning":"uno","onyomi":["イチ"],"kunyomi":["ひと"],"example":{"jp":"一つ","reading":"ひとつ","meaning":"uno (cosa)"},"note":"La forma más simple: una línea horizontal."},
   {"id":"a4","kind":"intro_vocab","word":"今日","reading":"きょう","meaning":"hoy","example":"今日は月曜日です。"},
   {"id":"a5","kind":"quiz","prompt":"¿Qué significa el kanji 月?","options":["sol","mes/luna","día","año"],"correctIndex":1},
   {"id":"a6","kind":"quiz","promptJp":"今日 ___ 月曜日です","prompt":"Completa la partícula","options":["を","に","は","の"],"correctIndex":2},
   {"id":"a7","kind":"quiz","prompt":"\"Enero\" en japonés es:","options":["一日","一月","月一","日一"],"correctIndex":1},
   {"id":"a8","kind":"listening","textJp":"今日は一月一日です。","voice":"Kyoko","prompt":"¿Qué fecha mencionan?","options":["1 de enero","11 de enero","1 de noviembre","10 de enero"],"correctIndex":0},
   {"id":"a9","kind":"speaking","textJp":"今日は一月一日です。","reading":"きょうは いちがつ ついたち です","meaning":"Hoy es 1 de enero.","voice":"Kyoko"},
   {"id":"a10","kind":"summary","learned":["3 kanjis: 日, 月, 一","Vocabulario: 今日 (hoy), 一月 (enero)","Decir la fecha del día","Tu segunda frase completa"]}
 ]}'
),
(3, 1, 'Saludos del día', 'あいさつ',
 'Buenos días, buenas tardes, buenas noches. Con voz nativa para que los reconozcas.', 7, 3, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_vocab","word":"おはようございます","reading":"ohayou gozaimasu","meaning":"Buenos días (formal, hasta ~10am)","example":"おはようございます、先生。"},
   {"id":"a2","kind":"intro_vocab","word":"こんにちは","reading":"konnichiwa","meaning":"Buenos días / Buenas tardes (todo el día hasta tarde)","example":"こんにちは、田中さん。"},
   {"id":"a3","kind":"intro_vocab","word":"こんばんは","reading":"konbanwa","meaning":"Buenas noches (al saludar)","example":"こんばんは。"},
   {"id":"a4","kind":"intro_vocab","word":"ありがとうございます","reading":"arigatou gozaimasu","meaning":"Muchas gracias (formal)","example":"ありがとうございます。"},
   {"id":"a5","kind":"quiz","prompt":"¿Qué dirías a las 9am al llegar al trabajo?","options":["こんばんは","こんにちは","おはようございます","ありがとうございます"],"correctIndex":2},
   {"id":"a6","kind":"listening","textJp":"こんばんは。","voice":"Otoya","prompt":"¿Qué momento del día sugiere?","options":["Mañana","Mediodía","Tarde temprana","Noche"],"correctIndex":3},
   {"id":"a7","kind":"listening","textJp":"おはようございます。","voice":"Kyoko","prompt":"¿Cómo responderías cortésmente?","options":["さようなら","おはようございます","ありがとう","すみません"],"correctIndex":1},
   {"id":"a8","kind":"speaking","textJp":"おはようございます。","reading":"おはよう ございます","meaning":"Buenos días (formal).","voice":"Kyoko"},
   {"id":"a9","kind":"speaking","textJp":"こんにちは、田中さん。","reading":"こんにちは、たなか さん","meaning":"Hola, Sr. Tanaka.","voice":"Otoya"},
   {"id":"a10","kind":"speaking","textJp":"ありがとうございます。","reading":"ありがとう ございます","meaning":"Muchas gracias.","voice":"Kyoko"},
   {"id":"a11","kind":"summary","learned":["4 saludos clave","Reconocer audio de saludos","Practicaste pronunciación con tu voz","Estás listo para situaciones cotidianas"]}
 ]}'
),
(4, 2, 'Verbos en ます — comer y beber', 'たべる、のむ',
 'Tu primer verbo en forma cortés. Decir qué comes y bebes.', 9, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"ます — forma cortés del verbo","pattern":"動詞ます / 動詞ません","explanation":"Los verbos japoneses tienen una forma cortés terminada en ます. Es la que usarás casi siempre cuando aprendas. Su negativa es ません.","example":{"jp":"パンを食べます。","reading":"パンをたべます","meaning":"Como pan."}},
   {"id":"a2","kind":"intro_vocab","word":"食べます","reading":"たべます","meaning":"comer (cortés)","example":"パンを食べます。"},
   {"id":"a3","kind":"intro_vocab","word":"飲みます","reading":"のみます","meaning":"beber (cortés)","example":"水を飲みます。"},
   {"id":"a4","kind":"intro_grammar","title":"を — partícula de objeto directo","pattern":"X を 動詞ます","explanation":"を (pronunciada \"o\") marca lo que recibe la acción del verbo. \"Como X\" → X を 食べます.","example":{"jp":"水を飲みます。","reading":"みずをのみます","meaning":"Bebo agua."}},
   {"id":"a5","kind":"quiz","prompt":"Forma cortés de のむ (beber):","options":["のんます","のみます","のむます","のむました"],"correctIndex":1},
   {"id":"a6","kind":"quiz","promptJp":"水 ___ 飲みます","prompt":"¿Qué partícula va antes del verbo \"beber\"?","options":["は","に","を","で"],"correctIndex":2},
   {"id":"a7","kind":"quiz","prompt":"Forma negativa de 食べます:","options":["食べない","食べません","食べないです","食べませんでした"],"correctIndex":1},
   {"id":"a8","kind":"listening","textJp":"私は肉を食べません。","voice":"Kyoko","prompt":"¿Qué afirma?","options":["Como carne","No como carne","Bebo carne","No bebo carne"],"correctIndex":1},
   {"id":"a9","kind":"speaking","textJp":"水を飲みます。","reading":"みずを のみます","meaning":"Bebo agua.","voice":"Otoya"},
   {"id":"a10","kind":"speaking","textJp":"パンを食べます。","reading":"パンを たべます","meaning":"Como pan.","voice":"Kyoko"},
   {"id":"a11","kind":"summary","learned":["La forma cortés ます","La partícula を","Verbos 食べます (comer) y 飲みます (beber)","Cómo afirmar y negar acciones"]}
 ]}'
),
(5, 2, 'Lugar y movimiento — ir a…', 'いきます',
 'El verbo ir, las partículas に y で, y dónde haces las cosas.', 9, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_vocab","word":"行きます","reading":"いきます","meaning":"ir (cortés)","example":"学校に行きます。"},
   {"id":"a2","kind":"intro_kanji","kanjiChar":"行","meaning":"ir","onyomi":["コウ","ギョウ"],"kunyomi":["い","ゆ"],"example":{"jp":"銀行","reading":"ぎんこう","meaning":"banco"},"note":"También aparece en 銀行 (ginkou = banco) y 旅行 (ryokou = viaje)."},
   {"id":"a3","kind":"intro_grammar","title":"に — destino y tiempo","pattern":"場所 に 行きます","explanation":"に marca a dónde vas con verbos de movimiento. También sirve para horas específicas (7時に, a las 7).","example":{"jp":"東京に行きます。","reading":"とうきょうにいきます","meaning":"Voy a Tokio."}},
   {"id":"a4","kind":"intro_grammar","title":"で — lugar de acción","pattern":"場所 で 動詞","explanation":"で marca dónde sucede la acción. Diferencia clave: に es destino, で es lugar donde ocurre la acción.","example":{"jp":"カフェでコーヒーを飲みます。","reading":"カフェでコーヒーをのみます","meaning":"Tomo café en la cafetería."}},
   {"id":"a5","kind":"quiz","promptJp":"東京 ___ 行きます","prompt":"\"Voy a Tokio\":","options":["で","は","を","に"],"correctIndex":3},
   {"id":"a6","kind":"quiz","promptJp":"レストラン ___ 食べます","prompt":"\"Como en un restaurante\":","options":["に","で","を","は"],"correctIndex":1},
   {"id":"a7","kind":"quiz","prompt":"¿Qué partícula NO uses con 行きます (ir)?","options":["に (destino)","へ (dirección)","で (medio: bus, tren)","を (objeto directo)"],"correctIndex":3},
   {"id":"a8","kind":"listening","textJp":"明日、東京に行きます。","voice":"Kyoko","prompt":"¿Cuándo va y a dónde?","options":["Hoy a Osaka","Mañana a Tokio","Ayer a Tokio","Mañana a Osaka"],"correctIndex":1},
   {"id":"a9","kind":"speaking","textJp":"明日、東京に行きます。","reading":"あした、とうきょうに いきます","meaning":"Mañana voy a Tokio.","voice":"Kyoko"},
   {"id":"a10","kind":"speaking","textJp":"カフェでコーヒーを飲みます。","reading":"カフェで コーヒーを のみます","meaning":"Tomo café en la cafetería.","voice":"Otoya"},
   {"id":"a11","kind":"summary","learned":["Verbo 行きます (ir)","Distinguir に (destino) de で (lugar de acción)","Decir \"voy a X\" y \"hago X en Y\"","Sumas 1 kanji nuevo: 行"]}
 ]}'
);

INSERT OR IGNORE INTO lesson_progress (lesson_id, status)
    SELECT id, 'available' FROM lessons;
