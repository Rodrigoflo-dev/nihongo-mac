-- Reading passages + listening dialogues (seed)

CREATE TABLE IF NOT EXISTS reading_passages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    jlpt_level TEXT NOT NULL,
    summary TEXT,
    text_jp TEXT NOT NULL,
    text_furigana TEXT,
    text_translation TEXT,
    questions TEXT,
    ordering INTEGER NOT NULL DEFAULT 0,
    is_seed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_reading_level ON reading_passages(jlpt_level, ordering);

CREATE TABLE IF NOT EXISTS reading_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passage_id INTEGER NOT NULL UNIQUE REFERENCES reading_passages(id) ON DELETE CASCADE,
    times_read INTEGER NOT NULL DEFAULT 0,
    last_score REAL,
    last_read_at TEXT,
    completed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS listening_dialogues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    jlpt_level TEXT NOT NULL,
    description TEXT,
    transcript_jp TEXT NOT NULL,
    transcript_translation TEXT,
    voice TEXT NOT NULL DEFAULT 'Kyoko',
    questions TEXT,
    ordering INTEGER NOT NULL DEFAULT 0,
    is_seed INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_listening_level ON listening_dialogues(jlpt_level, ordering);

CREATE TABLE IF NOT EXISTS listening_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dialogue_id INTEGER NOT NULL UNIQUE REFERENCES listening_dialogues(id) ON DELETE CASCADE,
    times_played INTEGER NOT NULL DEFAULT 0,
    last_score REAL,
    last_played_at TEXT,
    completed INTEGER NOT NULL DEFAULT 0
);

INSERT INTO reading_passages (id, title, jlpt_level, summary, text_jp, text_translation, questions, ordering, is_seed) VALUES
(1, 'Cafetería', 'N5', 'Pedir un café en una cafetería japonesa',
 'こんにちは。一杯のコーヒーをください。砂糖はいりません。 はい、すぐにお持ちします。 ありがとうございます。',
 'Hola. Una taza de café, por favor. Sin azúcar.\nSí, lo traigo enseguida.\nGracias.',
 '{"questions":[{"id":"q1","prompt":"¿Qué pide la persona?","options":[{"text":"Té","correct":false},{"text":"Café sin azúcar","correct":true},{"text":"Agua","correct":false}]},{"id":"q2","prompt":"¿Cómo responde el mesero?","options":[{"text":"Lo trae enseguida","correct":true},{"text":"No tiene café","correct":false},{"text":"Pregunta el sabor","correct":false}]}]}',
 1, 1),

(2, 'En la estación', 'N5', 'Preguntar por un tren en la estación',
 'すみません、東京行きの電車はどこですか。 三番線です。あと五分で出発します。 ありがとうございます。',
 'Disculpe, ¿dónde está el tren a Tokio?\nEs el andén número 3. Sale en cinco minutos.\nGracias.',
 '{"questions":[{"id":"q1","prompt":"¿A dónde va la persona?","options":[{"text":"Osaka","correct":false},{"text":"Tokio","correct":true},{"text":"Kioto","correct":false}]},{"id":"q2","prompt":"¿En cuánto tiempo sale el tren?","options":[{"text":"5 minutos","correct":true},{"text":"10 minutos","correct":false},{"text":"3 minutos","correct":false}]}]}',
 2, 1),

(3, 'En el restaurante', 'N5', 'Pedir comida en un restaurante',
 'いらっしゃいませ。ご注文はお決まりですか。 はい、ラーメンと餃子をください。 飲み物は何になさいますか。 お水で大丈夫です。',
 'Bienvenido. ¿Ya decidió su orden?\nSí, ramen y gyozas, por favor.\n¿Qué desea para beber?\nAgua está bien.',
 '{"questions":[{"id":"q1","prompt":"¿Qué pidió de comer?","options":[{"text":"Ramen y gyozas","correct":true},{"text":"Sushi","correct":false},{"text":"Curry","correct":false}]},{"id":"q2","prompt":"¿Qué bebe?","options":[{"text":"Té","correct":false},{"text":"Agua","correct":true},{"text":"Sake","correct":false}]}]}',
 3, 1),

(4, 'Presentación', 'N5', 'Presentarse y conocer a alguien',
 'はじめまして。私はマリアです。スペインから来ました。 はじめまして。田中です。日本人です。よろしくお願いします。',
 'Mucho gusto. Soy María. Vengo de España.\nMucho gusto. Soy Tanaka. Soy japonés. Encantado de conocerte.',
 '{"questions":[{"id":"q1","prompt":"¿De dónde es María?","options":[{"text":"España","correct":true},{"text":"México","correct":false},{"text":"Japón","correct":false}]},{"id":"q2","prompt":"¿Cuál es la nacionalidad de Tanaka?","options":[{"text":"Coreano","correct":false},{"text":"Japonés","correct":true},{"text":"Chino","correct":false}]}]}',
 4, 1),

(5, 'Pedir indicaciones', 'N5', 'Preguntar dónde está algo',
 'すみません、図書館はどこですか。 駅の前です。歩いて五分くらいです。 ありがとうございました。',
 'Disculpe, ¿dónde está la biblioteca?\nEstá frente a la estación. A cinco minutos a pie.\nMuchas gracias.',
 '{"questions":[{"id":"q1","prompt":"¿Dónde está la biblioteca?","options":[{"text":"Frente a la estación","correct":true},{"text":"Detrás del banco","correct":false},{"text":"Al lado del hospital","correct":false}]},{"id":"q2","prompt":"¿Cuánto tiempo a pie?","options":[{"text":"5 minutos","correct":true},{"text":"10 minutos","correct":false},{"text":"15 minutos","correct":false}]}]}',
 5, 1);

-- Mark all as not started
INSERT OR IGNORE INTO reading_progress (passage_id, times_read, completed)
    SELECT id, 0, 0 FROM reading_passages;

INSERT INTO listening_dialogues (id, title, jlpt_level, description, transcript_jp, transcript_translation, voice, questions, ordering, is_seed) VALUES
(1, 'Saludos básicos', 'N5', 'Saludos cotidianos en situaciones distintas',
 'おはようございます。今日は良い天気ですね。',
 'Buenos días. Hoy hace buen tiempo, ¿verdad?',
 'Kyoko',
 '{"questions":[{"id":"q1","prompt":"¿Qué momento del día es?","options":[{"text":"Mañana","correct":true},{"text":"Tarde","correct":false},{"text":"Noche","correct":false}]}]}',
 1, 1),

(2, 'En la oficina', 'N5', 'Una conversación corta de trabajo',
 'お疲れさまでした。明日も同じ時間で大丈夫ですか。',
 'Buen trabajo. ¿Mañana a la misma hora está bien?',
 'Kyoko',
 '{"questions":[{"id":"q1","prompt":"¿De qué hablan?","options":[{"text":"De la cena","correct":false},{"text":"De una reunión mañana","correct":true},{"text":"Del clima","correct":false}]}]}',
 2, 1),

(3, 'Hora y fecha', 'N5', 'Decir la hora y la fecha',
 '今は午後二時です。今日は三月十日です。',
 'Son las dos de la tarde. Hoy es 10 de marzo.',
 'Otoya',
 '{"questions":[{"id":"q1","prompt":"¿Qué hora es?","options":[{"text":"14:00","correct":true},{"text":"02:00","correct":false},{"text":"12:00","correct":false}]},{"id":"q2","prompt":"¿Qué fecha es?","options":[{"text":"10 de marzo","correct":true},{"text":"3 de octubre","correct":false},{"text":"13 de marzo","correct":false}]}]}',
 3, 1);

INSERT OR IGNORE INTO listening_progress (dialogue_id, times_played, completed)
    SELECT id, 0, 0 FROM listening_dialogues;
