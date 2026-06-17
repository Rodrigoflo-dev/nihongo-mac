#!/usr/bin/env node
/**
 * Generates migration 014_course_lessons.sql — expands the N5 course units
 * "Empecemos" (unit 1) and "Vida diaria" (unit 2) to 10 lessons each with
 * verified, standard N5 content. activities_json is written in the object form
 * {"activities":[...]} required by the Rust LessonActivities parser.
 *
 * Run: node scripts/gen-course-lessons.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "src-tauri", "migrations", "014_course_lessons.sql");

// Helpers to keep activities terse but correct.
const vocab = (id, word, reading, meaning, example) => ({ id, kind: "intro_vocab", word, reading, meaning, example });
const grammar = (id, title, pattern, explanation, jp, reading, meaning) => ({ id, kind: "intro_grammar", title, pattern, explanation, example: { jp, reading, meaning } });
const quiz = (id, prompt, options, correctIndex, explanation) => ({ id, kind: "quiz", prompt, options, correctIndex, explanation });
const listening = (id, textJp, voice, prompt, options, correctIndex, explanation) => ({ id, kind: "listening", textJp, voice, prompt, options, correctIndex, explanation });
const speaking = (id, textJp, reading, meaning, voice) => ({ id, kind: "speaking", textJp, reading, meaning, voice });
const write = (id, prompt, hint, accepted, explanation) => ({ id, kind: "write_sentence", prompt, hint, accepted, explanation });
const summary = (id, learned) => ({ id, kind: "summary", learned });

// ---------------------------------------------------------------------------
// Unit 1 — "Empecemos": 7 more lessons (ordering 4..10, ids 300..306)
// ---------------------------------------------------------------------------
const unit1 = [
  {
    id: 300, ordering: 4, title: "Números del 1 al 10", jp: "数字",
    summary: "Cuenta del 1 al 10 en japonés.",
    activities: [
      vocab("u1l4a1", "一", "いち", "uno", "一"),
      vocab("u1l4a2", "二", "に", "dos", "二"),
      vocab("u1l4a3", "三", "さん", "tres", "三"),
      vocab("u1l4a4", "四", "よん／し", "cuatro", "四"),
      vocab("u1l4a5", "五", "ご", "cinco", "五"),
      quiz("u1l4q1", "¿Cómo se dice 'tres'?", ["さん", "に", "ご"], 0, "三 = さん = tres."),
      quiz("u1l4q2", "¿Qué número es 五?", ["cinco", "cuatro", "dos"], 0, "五 = ご = cinco."),
      speaking("u1l4s1", "いち、に、さん", "いち、に、さん", "uno, dos, tres", "Kyoko"),
      summary("u1l4sum", ["一 (いち)", "二 (に)", "三 (さん)", "四 (よん)", "五 (ご)"]),
    ],
  },
  {
    id: 301, ordering: 5, title: "Números del 6 al 10", jp: "数字 2",
    summary: "Completa la cuenta hasta diez.",
    activities: [
      vocab("u1l5a1", "六", "ろく", "seis", "六"),
      vocab("u1l5a2", "七", "なな／しち", "siete", "七"),
      vocab("u1l5a3", "八", "はち", "ocho", "八"),
      vocab("u1l5a4", "九", "きゅう／く", "nueve", "九"),
      vocab("u1l5a5", "十", "じゅう", "diez", "十"),
      quiz("u1l5q1", "¿Cómo se dice 'diez'?", ["じゅう", "はち", "ろく"], 0, "十 = じゅう = diez."),
      quiz("u1l5q2", "¿Qué número es 八?", ["ocho", "seis", "nueve"], 0, "八 = はち = ocho."),
      speaking("u1l5s1", "はち、きゅう、じゅう", "はち、きゅう、じゅう", "ocho, nueve, diez", "Otoya"),
      summary("u1l5sum", ["六 (ろく)", "七 (なな)", "八 (はち)", "九 (きゅう)", "十 (じゅう)"]),
    ],
  },
  {
    id: 302, ordering: 6, title: "Esto, eso, aquello", jp: "これ・それ・あれ",
    summary: "Señala cosas: これ / それ / あれ.",
    activities: [
      vocab("u1l6a1", "これ", "これ", "esto (cerca de mí)", "これは本です。"),
      vocab("u1l6a2", "それ", "それ", "eso (cerca de ti)", "それはペンです。"),
      vocab("u1l6a3", "あれ", "あれ", "aquello (lejos)", "あれは車です。"),
      grammar("u1l6g1", "これは〜です", "これは N です", "Para decir 'esto es N'.", "これは本です。", "これはほんです", "Esto es un libro."),
      quiz("u1l6q1", "Para algo lejos de ambos usas…", ["あれ", "これ", "それ"], 0, "あれ = aquello (lejos)."),
      write("u1l6w1", "Escribe: 'Esto es un libro.'", "これ + は + 本 + です", ["これは本です", "これは本です。", "これはほんです"], "これ = esto; 本 (ほん) = libro."),
      summary("u1l6sum", ["これ (esto)", "それ (eso)", "あれ (aquello)", "これは N です"]),
    ],
  },
  {
    id: 303, ordering: 7, title: "Sí, no y preguntas", jp: "はい・いいえ",
    summary: "Responde sí/no y haz preguntas con か.",
    activities: [
      vocab("u1l7a1", "はい", "はい", "sí", "はい、そうです。"),
      vocab("u1l7a2", "いいえ", "いいえ", "no", "いいえ、ちがいます。"),
      grammar("u1l7g1", "〜か", "… です か", "Añade か al final para preguntar.", "学生ですか。", "がくせいですか", "¿Eres estudiante?"),
      quiz("u1l7q1", "¿Cómo conviertes 'です' en pregunta?", ["agregar か", "agregar ね", "agregar を"], 0, "か al final hace la pregunta."),
      listening("u1l7L1", "がくせいですか。", "Kyoko", "¿Qué te preguntan?", ["¿Eres estudiante?", "¿Dónde estás?", "¿Qué comes?"], 0, "学生 = estudiante; か = pregunta."),
      speaking("u1l7s1", "はい、学生です。", "はい、がくせいです", "Sí, soy estudiante.", "Otoya"),
      summary("u1l7sum", ["はい (sí)", "いいえ (no)", "〜か (pregunta)"]),
    ],
  },
  {
    id: 304, ordering: 8, title: "Mi familia", jp: "家族",
    summary: "Habla de tu familia cercana.",
    activities: [
      vocab("u1l8a1", "父", "ちち", "(mi) padre", "父は先生です。"),
      vocab("u1l8a2", "母", "はは", "(mi) madre", "母は元気です。"),
      vocab("u1l8a3", "家族", "かぞく", "familia", "家族は四人です。"),
      quiz("u1l8q1", "¿Cómo dices '(mi) madre'?", ["はは", "ちち", "あね"], 0, "母 = はは = mi madre."),
      write("u1l8w1", "Escribe: 'Mi padre es profesor.'", "父 + は + 先生 + です", ["父は先生です", "父は先生です。", "ちちはせんせいです"], "父 (ちち) = mi padre; 先生 (せんせい) = profesor."),
      speaking("u1l8s1", "これは私の家族です。", "これはわたしのかぞくです", "Esta es mi familia.", "Kyoko"),
      summary("u1l8sum", ["父 (ちち)", "母 (はは)", "家族 (かぞく)"]),
    ],
  },
  {
    id: 305, ordering: 9, title: "Colores básicos", jp: "色",
    summary: "Di los colores más comunes.",
    activities: [
      vocab("u1l9a1", "赤", "あか", "rojo", "赤いりんご"),
      vocab("u1l9a2", "青", "あお", "azul", "青い空"),
      vocab("u1l9a3", "白", "しろ", "blanco", "白い雪"),
      vocab("u1l9a4", "黒", "くろ", "negro", "黒い猫"),
      quiz("u1l9q1", "¿Qué color es 青?", ["azul", "rojo", "negro"], 0, "青 = あお = azul."),
      quiz("u1l9q2", "'Blanco' es…", ["しろ", "くろ", "あか"], 0, "白 = しろ = blanco."),
      speaking("u1l9s1", "赤、青、白、黒", "あか、あお、しろ、くろ", "rojo, azul, blanco, negro", "Otoya"),
      summary("u1l9sum", ["赤 (あか)", "青 (あお)", "白 (しろ)", "黒 (くろ)"]),
    ],
  },
  {
    id: 306, ordering: 10, title: "Los días de la semana", jp: "曜日",
    summary: "Nombra los días de la semana.",
    activities: [
      vocab("u1l10a1", "月曜日", "げつようび", "lunes", "月曜日"),
      vocab("u1l10a2", "火曜日", "かようび", "martes", "火曜日"),
      vocab("u1l10a3", "水曜日", "すいようび", "miércoles", "水曜日"),
      vocab("u1l10a4", "土曜日", "どようび", "sábado", "土曜日"),
      vocab("u1l10a5", "日曜日", "にちようび", "domingo", "日曜日"),
      quiz("u1l10q1", "¿Qué día es 日曜日?", ["domingo", "lunes", "sábado"], 0, "日曜日 = にちようび = domingo."),
      write("u1l10w1", "Escribe 'lunes' en japonés.", "月 + 曜日", ["月曜日", "げつようび"], "月曜日 (げつようび) = lunes."),
      summary("u1l10sum", ["月曜日 (lunes)", "水曜日 (miércoles)", "土曜日 (sábado)", "日曜日 (domingo)"]),
    ],
  },
];

// ---------------------------------------------------------------------------
// Unit 2 — "Vida diaria": 8 more lessons (ordering 3..10, ids 310..317)
// ---------------------------------------------------------------------------
const unit2 = [
  {
    id: 310, ordering: 3, title: "¿Qué hora es?", jp: "今、何時？",
    summary: "Pregunta y di la hora.",
    activities: [
      vocab("u2l3a1", "今", "いま", "ahora", "今、何時ですか。"),
      vocab("u2l3a2", "時", "じ", "hora(s) / en punto", "三時"),
      grammar("u2l3g1", "何時ですか", "今 何時 ですか", "Para preguntar la hora.", "今、何時ですか。", "いま、なんじですか", "¿Qué hora es ahora?"),
      quiz("u2l3q1", "¿Cómo preguntas la hora?", ["今、何時ですか。", "今、何ですか。", "今、どこですか。"], 0, "何時 (なんじ) = qué hora."),
      listening("u2l3L1", "三時です。", "Kyoko", "¿Qué hora dicen?", ["Las 3", "Las 5", "Las 9"], 0, "三 = さん = 3, 時 = じ."),
      speaking("u2l3s1", "今、何時ですか。", "いま、なんじですか", "¿Qué hora es ahora?", "Otoya"),
      summary("u2l3sum", ["今 (いま)", "時 (じ)", "何時ですか (¿qué hora es?)"]),
    ],
  },
  {
    id: 311, ordering: 4, title: "En casa", jp: "家で",
    summary: "Objetos y lugares de la casa.",
    activities: [
      vocab("u2l4a1", "家", "いえ", "casa", "私の家"),
      vocab("u2l4a2", "部屋", "へや", "habitación", "部屋は広いです。"),
      vocab("u2l4a3", "テーブル", "てーぶる", "mesa", "テーブルの上"),
      quiz("u2l4q1", "¿Qué significa 部屋?", ["habitación", "casa", "mesa"], 0, "部屋 = へや = habitación."),
      write("u2l4w1", "Escribe: 'Esta es mi casa.'", "これ + は + 私の家 + です", ["これは私の家です", "これは私の家です。", "これはわたしのいえです"], "家 (いえ) = casa."),
      speaking("u2l4s1", "部屋はきれいです。", "へやはきれいです", "La habitación está limpia.", "Kyoko"),
      summary("u2l4sum", ["家 (いえ)", "部屋 (へや)", "テーブル (mesa)"]),
    ],
  },
  {
    id: 312, ordering: 5, title: "Comida y bebida", jp: "食べ物・飲み物",
    summary: "Pide y nombra comida y bebida.",
    activities: [
      vocab("u2l5a1", "ご飯", "ごはん", "arroz / comida", "ご飯を食べます。"),
      vocab("u2l5a2", "水", "みず", "agua", "水を飲みます。"),
      vocab("u2l5a3", "お茶", "おちゃ", "té", "お茶をください。"),
      grammar("u2l5g1", "〜を食べます／飲みます", "N を 食べます／飲みます", "Comer/beber algo.", "ご飯を食べます。", "ごはんをたべます", "Como arroz."),
      quiz("u2l5q1", "'Bebo agua' es…", ["水を飲みます。", "水を食べます。", "水をします。"], 0, "飲みます = beber."),
      write("u2l5w1", "Escribe: 'Como arroz.'", "ご飯 + を + 食べます", ["ご飯を食べます", "ご飯を食べます。", "ごはんをたべます"], "食べます = comer."),
      summary("u2l5sum", ["ご飯 (ごはん)", "水 (みず)", "お茶 (おちゃ)", "〜を食べます／飲みます"]),
    ],
  },
  {
    id: 313, ordering: 6, title: "Adjetivos い", jp: "い形容詞",
    summary: "Describe con adjetivos い.",
    activities: [
      vocab("u2l6a1", "大きい", "おおきい", "grande", "大きい家"),
      vocab("u2l6a2", "小さい", "ちいさい", "pequeño", "小さい猫"),
      vocab("u2l6a3", "新しい", "あたらしい", "nuevo", "新しい車"),
      grammar("u2l6g1", "い形容詞 + です", "Adj-い + です", "Los adjetivos い describen cosas: 'es ~'.", "車は新しいです。", "くるまはあたらしいです", "El coche es nuevo."),
      quiz("u2l6q1", "¿Qué significa 小さい?", ["pequeño", "grande", "nuevo"], 0, "小さい = ちいさい = pequeño."),
      speaking("u2l6s1", "この家は大きいです。", "このいえはおおきいです", "Esta casa es grande.", "Otoya"),
      summary("u2l6sum", ["大きい (おおきい)", "小さい (ちいさい)", "新しい (あたらしい)"]),
    ],
  },
  {
    id: 314, ordering: 7, title: "El clima", jp: "天気",
    summary: "Habla del clima de hoy.",
    activities: [
      vocab("u2l7a1", "天気", "てんき", "clima / tiempo", "今日はいい天気です。"),
      vocab("u2l7a2", "雨", "あめ", "lluvia", "雨が降ります。"),
      vocab("u2l7a3", "暑い", "あつい", "caluroso", "今日は暑いです。"),
      vocab("u2l7a4", "寒い", "さむい", "frío", "冬は寒いです。"),
      quiz("u2l7q1", "¿Qué significa 暑い?", ["caluroso", "frío", "lluvia"], 0, "暑い = あつい = caluroso."),
      listening("u2l7L1", "今日は寒いです。", "Kyoko", "¿Cómo está el día?", ["Frío", "Caluroso", "Lluvioso"], 0, "寒い = さむい = frío."),
      summary("u2l7sum", ["天気 (てんき)", "雨 (あめ)", "暑い (あつい)", "寒い (さむい)"]),
    ],
  },
  {
    id: 315, ordering: 8, title: "Mi rutina diaria", jp: "毎日",
    summary: "Cuenta lo que haces cada día.",
    activities: [
      vocab("u2l8a1", "起きます", "おきます", "levantarse", "七時に起きます。"),
      vocab("u2l8a2", "寝ます", "ねます", "dormir", "十一時に寝ます。"),
      vocab("u2l8a3", "毎日", "まいにち", "todos los días", "毎日勉強します。"),
      grammar("u2l8g1", "時間 + に", "（時）に + verbo", "Marca la hora a la que pasa algo.", "七時に起きます。", "しちじにおきます", "Me levanto a las 7."),
      quiz("u2l8q1", "'Me levanto' es…", ["起きます", "寝ます", "食べます"], 0, "起きます = levantarse."),
      write("u2l8w1", "Escribe: 'Me levanto a las 7.'", "七時 + に + 起きます", ["七時に起きます", "七時に起きます。", "しちじにおきます"], "に marca la hora; 起きます = levantarse."),
      summary("u2l8sum", ["起きます (levantarse)", "寝ます (dormir)", "毎日 (まいにち)", "（時）に"]),
    ],
  },
  {
    id: 316, ordering: 9, title: "En la ciudad", jp: "町で",
    summary: "Lugares de la ciudad y cómo llegar.",
    activities: [
      vocab("u2l9a1", "店", "みせ", "tienda", "店に行きます。"),
      vocab("u2l9a2", "病院", "びょういん", "hospital", "病院はどこですか。"),
      vocab("u2l9a3", "銀行", "ぎんこう", "banco", "銀行へ行きます。"),
      grammar("u2l9g1", "〜へ行きます", "場所 へ 行きます", "Ir a un lugar.", "学校へ行きます。", "がっこうへいきます", "Voy a la escuela."),
      quiz("u2l9q1", "¿Qué significa 病院?", ["hospital", "tienda", "banco"], 0, "病院 = びょういん = hospital."),
      speaking("u2l9s1", "店はどこですか。", "みせはどこですか", "¿Dónde está la tienda?", "Otoya"),
      summary("u2l9sum", ["店 (みせ)", "病院 (びょういん)", "銀行 (ぎんこう)", "〜へ行きます"]),
    ],
  },
  {
    id: 317, ordering: 10, title: "Gustos: 好き", jp: "好きなもの",
    summary: "Di lo que te gusta con 好き.",
    activities: [
      vocab("u2l10a1", "好き", "すき", "gustar / favorito", "日本語が好きです。"),
      vocab("u2l10a2", "音楽", "おんがく", "música", "音楽が好きです。"),
      grammar("u2l10g1", "〜が好きです", "N が 好きです", "Para decir que algo te gusta.", "日本語が好きです。", "にほんごがすきです", "Me gusta el japonés."),
      quiz("u2l10q1", "'Me gusta la música' es…", ["音楽が好きです。", "音楽を食べます。", "音楽はどこですか。"], 0, "〜が好きです = me gusta ~."),
      write("u2l10w1", "Escribe: 'Me gusta el japonés.'", "日本語 + が + 好き + です", ["日本語が好きです", "日本語が好きです。", "にほんごがすきです"], "が好きです = me gusta."),
      speaking("u2l10s1", "私は音楽が好きです。", "わたしはおんがくがすきです", "Me gusta la música.", "Kyoko"),
      summary("u2l10sum", ["好き (すき)", "音楽 (おんがく)", "〜が好きです"]),
    ],
  },
];

const esc = (s) => s.replace(/'/g, "''");
const jstr = (obj) => `'${esc(JSON.stringify(obj))}'`;

let sql = `-- 014_course_lessons.sql (generated by scripts/gen-course-lessons.mjs)
-- Expands N5 course units 1 (Empecemos) and 2 (Vida diaria) to 10 lessons each
-- with verified N5 content. activities_json uses the object form.

`;

for (const l of [...unit1, ...unit2]) {
  const unitId = unit1.includes(l) ? 1 : 2;
  sql += `INSERT OR REPLACE INTO lessons (id, unit_id, title, jp_title, summary, duration_minutes, ordering, is_seed, activities_json) VALUES (${l.id}, ${unitId}, '${esc(l.title)}', '${esc(l.jp)}', '${esc(l.summary)}', 9, ${l.ordering}, 1, ${jstr({ activities: l.activities })});\n`;
}

writeFileSync(OUT, sql);
const total = [...unit1, ...unit2].reduce((n, l) => n + l.activities.length, 0);
console.log(`014_course_lessons.sql written: ${unit1.length + unit2.length} lessons, ${total} activities (unit1 +${unit1.length}, unit2 +${unit2.length}).`);
