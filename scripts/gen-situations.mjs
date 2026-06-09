#!/usr/bin/env node
/**
 * Generates src-tauri/migrations/012_situations.sql — a "Situaciones de la vida
 * real" N5 course: short, practical role-play lessons for everyday situations
 * (restaurant, self-introduction, shopping, station, café). Building the SQL
 * from JS objects guarantees valid JSON in `activities_json` (single quotes are
 * escaped as '' for SQLite).
 *
 * Japanese is intentionally simple, polite and verified (N5 level).
 * Run: node scripts/gen-situations.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "src-tauri", "migrations", "012_situations.sql");

const COURSE_ID = 10;

// Each entry: { id, ordering, title, jp, summary, activities: [...] }
const lessons = [
  {
    id: 201,
    unitId: 101,
    unit: "En el restaurante",
    unitJp: "レストランで",
    title: "Pedir en un restaurante",
    jp: "注文する",
    summary: "Entra, pide el menú y ordena con cortesía.",
    activities: [
      { id: "r1", kind: "intro_vocab", word: "メニュー", reading: "めにゅー", meaning: "menú", example: "メニューをください。" },
      { id: "r2", kind: "intro_vocab", word: "水", reading: "みず", meaning: "agua", example: "水をください。" },
      { id: "r3", kind: "intro_grammar", title: "～をください", pattern: "N を ください", explanation: "Pides algo con cortesía: 'déme N, por favor'.", example: { jp: "水をください。", reading: "みずをください", meaning: "Agua, por favor." } },
      { id: "r4", kind: "listening", textJp: "いらっしゃいませ。", voice: "Kyoko", prompt: "El mesero te recibe. ¿Qué significa?", options: ["Bienvenido", "Gracias", "Hasta luego"], correctIndex: 0, explanation: "いらっしゃいませ es el saludo de bienvenida en tiendas y restaurantes." },
      { id: "r5", kind: "quiz", prompt: "¿Cómo pides el menú con cortesía?", options: ["メニューをください。", "メニューです。", "メニューですか。"], correctIndex: 0, explanation: "N を ください = 'déme N, por favor'." },
      { id: "r6", kind: "speaking", textJp: "すみません、メニューをください。", reading: "すみません、めにゅーをください", meaning: "Disculpe, el menú por favor.", voice: "Kyoko" },
      { id: "r7", kind: "write_sentence", prompt: "Pide agua, por favor.", hint: "水 + を + ください", accepted: ["水をください", "水をください。", "みずをください"], explanation: "水 (みず) = agua. N を ください para pedir con cortesía." },
      { id: "r8", kind: "summary", learned: ["メニュー (menú)", "水 (agua)", "～をください (pedir con cortesía)", "いらっしゃいませ (bienvenida)"] },
    ],
  },
  {
    id: 202,
    unitId: 102,
    unit: "Presentarte",
    unitJp: "じこしょうかい",
    title: "Tu primera presentación",
    jp: "自己紹介",
    summary: "Saluda, di tu nombre y preséntate.",
    activities: [
      { id: "p1", kind: "intro_vocab", word: "名前", reading: "なまえ", meaning: "nombre", example: "名前は アナ です。" },
      { id: "p2", kind: "intro_grammar", title: "はじめまして", pattern: "はじめまして。… です。", explanation: "Frase fija para presentarte: 'Mucho gusto'.", example: { jp: "はじめまして。アナです。", reading: "はじめまして。あなです", meaning: "Mucho gusto. Soy Ana." } },
      { id: "p3", kind: "quiz", prompt: "¿Cómo dices 'Soy Ana'?", options: ["私はアナです。", "アナをください。", "アナですか。"], correctIndex: 0, explanation: "X は Y です = 'X es Y'." },
      { id: "p4", kind: "listening", textJp: "どうぞ よろしく おねがいします。", voice: "Otoya", prompt: "Cierre típico de una presentación. ¿Qué expresa?", options: ["Encantado / cuento contigo", "Buenas noches", "Lo siento"], correctIndex: 0, explanation: "よろしくおねがいします se dice al conocer a alguien." },
      { id: "p5", kind: "speaking", textJp: "はじめまして。どうぞ よろしく おねがいします。", reading: "はじめまして。どうぞ よろしく おねがいします", meaning: "Mucho gusto. Encantado de conocerte.", voice: "Otoya" },
      { id: "p6", kind: "write_sentence", prompt: "Escribe: Soy estudiante.", hint: "私 + は + 学生 + です", accepted: ["私は学生です", "私は学生です。", "わたしはがくせいです"], explanation: "私 (わたし) = yo, 学生 (がくせい) = estudiante." },
      { id: "p7", kind: "summary", learned: ["名前 (nombre)", "はじめまして (mucho gusto)", "X は Y です", "よろしくおねがいします"] },
    ],
  },
  {
    id: 203,
    unitId: 103,
    unit: "De compras",
    unitJp: "かいもの",
    title: "Comprar en la tienda",
    jp: "買い物",
    summary: "Pregunta precios y paga en una tienda.",
    activities: [
      { id: "s1", kind: "intro_vocab", word: "いくら", reading: "いくら", meaning: "cuánto (precio)", example: "いくらですか。" },
      { id: "s2", kind: "intro_vocab", word: "これ", reading: "これ", meaning: "esto", example: "これをください。" },
      { id: "s3", kind: "intro_grammar", title: "いくらですか", pattern: "N は いくらですか", explanation: "Preguntas el precio: '¿cuánto cuesta N?'.", example: { jp: "これはいくらですか。", reading: "これはいくらですか", meaning: "¿Cuánto cuesta esto?" } },
      { id: "s4", kind: "listening", textJp: "さんびゃくえんです。", voice: "Kyoko", prompt: "El precio que escuchas es…", options: ["300 yenes", "3.000 yenes", "13 yenes"], correctIndex: 0, explanation: "さんびゃく = 300, えん = yen." },
      { id: "s5", kind: "quiz", prompt: "¿Cómo preguntas el precio de esto?", options: ["これはいくらですか。", "これをください。", "これはなんですか。"], correctIndex: 0, explanation: "いくらですか = '¿cuánto cuesta?'." },
      { id: "s6", kind: "speaking", textJp: "これはいくらですか。", reading: "これはいくらですか", meaning: "¿Cuánto cuesta esto?", voice: "Kyoko" },
      { id: "s7", kind: "write_sentence", prompt: "Pide esto, por favor.", hint: "これ + を + ください", accepted: ["これをください", "これをください。"], explanation: "これ = esto; N を ください para pedirlo." },
      { id: "s8", kind: "summary", learned: ["いくら (cuánto)", "これ (esto)", "いくらですか (¿cuánto cuesta?)", "円 (yen)"] },
    ],
  },
  {
    id: 204,
    unitId: 104,
    unit: "En la estación",
    unitJp: "えきで",
    title: "Tomar el tren",
    jp: "駅で",
    summary: "Pregunta direcciones y ubica la estación.",
    activities: [
      { id: "e1", kind: "intro_vocab", word: "駅", reading: "えき", meaning: "estación", example: "駅はどこですか。" },
      { id: "e2", kind: "intro_vocab", word: "電車", reading: "でんしゃ", meaning: "tren", example: "電車に のります。" },
      { id: "e3", kind: "intro_grammar", title: "～はどこですか", pattern: "N は どこですか", explanation: "Preguntas dónde está algo.", example: { jp: "駅はどこですか。", reading: "えきはどこですか", meaning: "¿Dónde está la estación?" } },
      { id: "e4", kind: "listening", textJp: "つぎは とうきょうです。", voice: "Otoya", prompt: "El anuncio del tren dice…", options: ["La próxima es Tokio", "Llegamos tarde", "Cierre de puertas"], correctIndex: 0, explanation: "つぎ = próximo/siguiente." },
      { id: "e5", kind: "quiz", prompt: "¿Cómo preguntas dónde está la estación?", options: ["駅はどこですか。", "駅をください。", "駅です。"], correctIndex: 0, explanation: "N は どこですか = '¿dónde está N?'." },
      { id: "e6", kind: "speaking", textJp: "すみません、駅はどこですか。", reading: "すみません、えきはどこですか", meaning: "Disculpe, ¿dónde está la estación?", voice: "Otoya" },
      { id: "e7", kind: "write_sentence", prompt: "Pregunta: ¿Dónde está la estación?", hint: "駅 + は + どこ + ですか", accepted: ["駅はどこですか", "駅はどこですか。", "えきはどこですか"], explanation: "どこ = dónde." },
      { id: "e8", kind: "summary", learned: ["駅 (estación)", "電車 (tren)", "～はどこですか", "つぎ (siguiente)"] },
    ],
  },
  {
    id: 205,
    unitId: 105,
    unit: "En el café",
    unitJp: "カフェで",
    title: "Pedir un café",
    jp: "カフェで",
    summary: "Ordena bebidas con cortesía.",
    activities: [
      { id: "c1", kind: "intro_vocab", word: "コーヒー", reading: "こーひー", meaning: "café", example: "コーヒーをおねがいします。" },
      { id: "c2", kind: "intro_vocab", word: "ひとつ", reading: "ひとつ", meaning: "uno (cosa)", example: "コーヒーをひとつ。" },
      { id: "c3", kind: "intro_grammar", title: "～をおねがいします", pattern: "N を おねがいします", explanation: "Otra forma cortés de pedir, muy usada al ordenar.", example: { jp: "コーヒーをおねがいします。", reading: "こーひーをおねがいします", meaning: "Un café, por favor." } },
      { id: "c4", kind: "quiz", prompt: "¿Cómo pides un café con cortesía?", options: ["コーヒーをおねがいします。", "コーヒーですか。", "コーヒーはどこですか。"], correctIndex: 0, explanation: "N を おねがいします para ordenar." },
      { id: "c5", kind: "speaking", textJp: "コーヒーを ひとつ おねがいします。", reading: "こーひーを ひとつ おねがいします", meaning: "Un café, por favor.", voice: "Kyoko" },
      { id: "c6", kind: "write_sentence", prompt: "Pide un café, por favor.", hint: "コーヒー + を + おねがいします", accepted: ["コーヒーをおねがいします", "コーヒーをおねがいします。"], explanation: "おねがいします = por favor (al pedir)." },
      { id: "c7", kind: "summary", learned: ["コーヒー (café)", "ひとつ (uno)", "～をおねがいします (pedir con cortesía)"] },
    ],
  },
];

const esc = (s) => s.replace(/'/g, "''");
const jstr = (obj) => `'${esc(JSON.stringify(obj))}'`;

let sql = `-- 012_situations.sql (generated by scripts/gen-situations.mjs)
-- "Situaciones de la vida real" — practical N5 role-play lessons. Inserts a new
-- course/units/lessons without touching existing curriculum.

INSERT OR REPLACE INTO courses (id, title, description, jlpt_level, jp_title, ordering, is_seed) VALUES
(${COURSE_ID}, 'Situaciones de la vida real', 'Practica japonés como lo usarías de verdad: restaurante, presentarte, compras, estación y café.', 'N5', '実生活の場面', 2, 1);

`;

for (const l of lessons) {
  sql += `INSERT OR REPLACE INTO units (id, course_id, title, description, jp_title, ordering) VALUES (${l.unitId}, ${COURSE_ID}, '${esc(l.unit)}', NULL, '${esc(l.unitJp)}', ${l.id - 200});\n`;
}
sql += "\n";
for (const l of lessons) {
  // activities_json must be the object form {"activities": [...]} to match the
  // Rust LessonActivities struct (a bare array fails to parse → empty lesson).
  sql += `INSERT OR REPLACE INTO lessons (id, unit_id, title, jp_title, summary, duration_minutes, ordering, is_seed, activities_json) VALUES (${l.id}, ${l.unitId}, '${esc(l.title)}', '${esc(l.jp)}', '${esc(l.summary)}', 6, 1, 1, ${jstr({ activities: l.activities })});\n`;
}

writeFileSync(OUT, sql);
console.log(`012_situations.sql written: 1 course, ${lessons.length} units/lessons, ${lessons.reduce((n, l) => n + l.activities.length, 0)} activities.`);
