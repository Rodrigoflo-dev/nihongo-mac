#!/usr/bin/env node
/**
 * ONE-TIME dev generator for the kanji catalog seed.
 *
 * Produces `src-tauri/src/seed/kanji_extra.json` — every JLPT kanji (N5→N1)
 * that is NOT already in the hand-authored `kanji_n5.json`. Data is grounded in
 * an authoritative KANJIDIC-derived dataset (readings, stroke counts, JLPT
 * level, English meanings) so we never ship made-up Japanese.
 *
 * Source dataset (KANJIDIC2 + WaniKani), download once:
 *   curl -sL -o /tmp/kanji-data.json \
 *     https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json
 *
 * Run: node scripts/gen-kanji-seed.mjs [path-to-dataset]
 *
 * on'yomi is converted to katakana, kun'yomi kept in hiragana (app convention).
 * meaning_es uses a curated EN→ES gloss, falling back to the English meaning
 * (always accurate, sometimes English for the long tail).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATASET = process.argv[2] || "/tmp/kanji-data.json";
const N5_SEED = join(root, "src-tauri", "src", "seed", "kanji_n5.json");
const OUT = join(root, "src-tauri", "src", "seed", "kanji_extra.json");

const data = JSON.parse(readFileSync(DATASET, "utf8"));
const existing = new Set(
  JSON.parse(readFileSync(N5_SEED, "utf8")).map((k) => k.character)
);

const JLPT = { 5: "N5", 4: "N4", 3: "N3", 2: "N2", 1: "N1" };

// hiragana → katakana (for on'yomi display convention)
function toKatakana(s) {
  let out = "";
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c >= 0x3041 && c <= 0x3096) out += String.fromCodePoint(c + 0x60);
    else out += ch;
  }
  return out;
}

// Clean a reading: drop empty/marker-only, strip leading/trailing '-'.
function cleanReadings(arr, { katakana = false } = {}) {
  const seen = new Set();
  const out = [];
  for (let r of arr || []) {
    if (!r) continue;
    r = r.replace(/^[-!]+/, "").replace(/-+$/, "").trim();
    if (!r || r === "." || r === "-") continue;
    const v = katakana ? toKatakana(r) : r;
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out.slice(0, 4);
}

// Curated EN→ES gloss for common kanji meanings. Falls back to English.
const GLOSS = {
  "one": "uno", "two": "dos", "three": "tres", "four": "cuatro", "five": "cinco",
  "six": "seis", "seven": "siete", "eight": "ocho", "nine": "nueve", "ten": "diez",
  "hundred": "cien", "thousand": "mil", "ten thousand": "diez mil", "yen": "yen",
  "day": "día", "sun": "sol", "month": "mes", "moon": "luna", "fire": "fuego",
  "water": "agua", "tree": "árbol", "wood": "madera", "gold": "oro", "money": "dinero",
  "metal": "metal", "earth": "tierra", "soil": "tierra", "person": "persona",
  "now": "ahora", "time": "tiempo", "hour": "hora", "i": "yo", "private": "privado",
  "mountain": "montaña", "river": "río", "book": "libro", "origin": "origen",
  "see": "ver", "go": "ir", "eat": "comer", "drink": "beber", "study": "estudiar",
  "learning": "aprendizaje", "school": "escuela", "exam": "examen",
  "big": "grande", "large": "grande", "small": "pequeño", "middle": "medio",
  "inside": "dentro", "half": "mitad", "minute": "minuto", "part": "parte",
  "above": "arriba", "up": "arriba", "below": "abajo", "down": "abajo",
  "left": "izquierda", "right": "derecha", "front": "frente", "before": "antes",
  "behind": "detrás", "after": "después", "rear": "atrás", "north": "norte",
  "south": "sur", "east": "este", "west": "oeste", "direction": "dirección",
  "mouth": "boca", "eye": "ojo", "ear": "oreja", "hand": "mano", "foot": "pie",
  "leg": "pierna", "heart": "corazón", "body": "cuerpo", "head": "cabeza",
  "face": "cara", "power": "fuerza", "strength": "fuerza", "father": "padre",
  "mother": "madre", "child": "niño", "man": "hombre", "woman": "mujer",
  "male": "hombre", "female": "mujer", "friend": "amigo", "name": "nombre",
  "country": "país", "language": "idioma", "word": "palabra", "say": "decir",
  "speak": "hablar", "talk": "hablar", "speech": "habla", "read": "leer",
  "write": "escribir", "hear": "oír", "listen": "escuchar", "ask": "preguntar",
  "buy": "comprar", "sell": "vender", "make": "hacer", "do": "hacer",
  "come": "venir", "return": "regresar", "enter": "entrar", "exit": "salir",
  "leave": "salir", "put out": "sacar", "stand": "estar de pie", "sit": "sentarse",
  "walk": "caminar", "run": "correr", "fly": "volar", "swim": "nadar",
  "rest": "descansar", "sleep": "dormir", "wake": "despertar", "live": "vivir",
  "life": "vida", "birth": "nacimiento", "die": "morir", "death": "muerte",
  "year": "año", "week": "semana", "morning": "mañana", "noon": "mediodía",
  "evening": "tarde", "night": "noche", "every": "cada", "spring": "primavera",
  "summer": "verano", "autumn": "otoño", "fall": "otoño", "winter": "invierno",
  "weather": "clima", "rain": "lluvia", "snow": "nieve", "wind": "viento",
  "cloud": "nube", "sky": "cielo", "sea": "mar", "ocean": "océano",
  "flower": "flor", "grass": "hierba", "rice": "arroz", "rice field": "arrozal",
  "field": "campo", "mountain pass": "paso", "stone": "piedra", "rock": "roca",
  "ground": "suelo", "town": "ciudad", "city": "ciudad", "village": "pueblo",
  "capital": "capital", "store": "tienda", "shop": "tienda", "house": "casa",
  "home": "hogar", "room": "habitación", "door": "puerta", "gate": "puerta",
  "window": "ventana", "road": "camino", "way": "camino", "station": "estación",
  "car": "coche", "vehicle": "vehículo", "train": "tren", "boat": "barco",
  "ship": "barco", "airplane": "avión", "company": "empresa", "work": "trabajo",
  "job": "trabajo", "office": "oficina", "shop assistant": "dependiente",
  "doctor": "médico", "medicine": "medicina", "teacher": "maestro",
  "student": "estudiante", "hospital": "hospital", "bank": "banco",
  "money exchange": "cambio", "meal": "comida", "food": "comida", "tea": "té",
  "wine": "alcohol", "sake": "sake", "meat": "carne", "fish": "pez",
  "vegetable": "verdura", "fruit": "fruta", "egg": "huevo", "milk": "leche",
  "bread": "pan", "salt": "sal", "sugar": "azúcar", "taste": "sabor",
  "color": "color", "white": "blanco", "black": "negro", "red": "rojo",
  "blue": "azul", "green": "verde", "yellow": "amarillo", "bright": "brillante",
  "dark": "oscuro", "light": "luz", "new": "nuevo", "old": "viejo",
  "high": "alto", "tall": "alto", "expensive": "caro", "low": "bajo",
  "cheap": "barato", "long": "largo", "short": "corto", "wide": "ancho",
  "narrow": "estrecho", "many": "mucho", "few": "poco", "good": "bueno",
  "bad": "malo", "evil": "mal", "fast": "rápido", "early": "temprano",
  "slow": "lento", "late": "tarde", "strong": "fuerte", "weak": "débil",
  "hot": "caliente", "cold": "frío", "warm": "cálido", "cool": "fresco",
  "near": "cerca", "far": "lejos", "deep": "profundo", "shallow": "poco profundo",
  "heavy": "pesado", "calculate": "calcular", "number": "número",
  "count": "contar", "many things": "varios", "thing": "cosa", "matter": "asunto",
  "affair": "asunto", "love": "amor", "like": "gustar", "want": "querer",
  "think": "pensar", "thought": "pensamiento", "know": "saber",
  "understand": "entender", "remember": "recordar", "forget": "olvidar",
  "feeling": "sentimiento", "spirit": "espíritu", "mind": "mente",
  "use": "usar", "help": "ayudar", "wait": "esperar", "meet": "encontrarse",
  "open": "abrir", "close": "cerrar", "begin": "empezar", "beginning": "comienzo",
  "end": "fin", "finish": "terminar", "stop": "parar", "move": "mover",
  "movement": "movimiento", "change": "cambiar", "decide": "decidir",
  "answer": "responder", "question": "pregunta", "problem": "problema",
  "study (verb)": "estudiar", "teach": "enseñar", "remember (learn)": "aprender",
  "world": "mundo", "society": "sociedad", "government": "gobierno",
  "politics": "política", "history": "historia", "culture": "cultura",
  "art": "arte", "music": "música", "song": "canción", "sing": "cantar",
  "picture": "dibujo", "drawing": "dibujo", "image": "imagen", "photograph": "fotografía",
  "letter": "carta", "character": "carácter", "letters": "letras",
  "sentence": "oración", "text": "texto", "story": "historia",
  "news": "noticias", "newspaper": "periódico", "book (counter)": "libro",
  "paper": "papel", "pen": "bolígrafo", "pencil": "lápiz", "desk": "escritorio",
  "chair": "silla", "table": "mesa", "computer": "computadora",
  "telephone": "teléfono", "phone": "teléfono", "electricity": "electricidad",
  "machine": "máquina", "tool": "herramienta", "clothes": "ropa",
  "clothing": "ropa", "shoe": "zapato", "hat": "sombrero", "umbrella": "paraguas",
  "bag": "bolsa", "key": "llave", "clock": "reloj", "watch": "reloj",
  "number (counter)": "número", "week day": "día de la semana",
};

function meaningEs(meanings) {
  const first = (meanings[0] || "").trim().toLowerCase();
  if (GLOSS[first]) return GLOSS[first];
  // light normalization: strip leading "to " for verbs
  const v = first.replace(/^to\s+/, "");
  if (GLOSS[v]) return GLOSS[v];
  return meanings.slice(0, 2).join(", ");
}

// Collect selected kanji, ordered N5→N1 then by frequency (common first).
const selected = [];
for (const [char, info] of Object.entries(data)) {
  const lvl = JLPT[info.jlpt_new];
  if (!lvl) continue;
  if (existing.has(char)) continue;
  selected.push({ char, info, lvl });
}
const order = { N5: 0, N4: 1, N3: 2, N2: 3, N1: 4 };
selected.sort((a, b) => {
  if (order[a.lvl] !== order[b.lvl]) return order[a.lvl] - order[b.lvl];
  const fa = a.info.freq ?? 99999;
  const fb = b.info.freq ?? 99999;
  return fa - fb;
});

let id = 100; // existing N5 seed uses 1..30
const out = selected.map(({ char, info, lvl }) => ({
  id: id++,
  character: char,
  jlpt_level: lvl,
  meaning_es: meaningEs(info.meanings || []),
  meaning_en: (info.meanings || []).slice(0, 3).join(", ") || null,
  onyomi: cleanReadings(info.readings_on, { katakana: true }),
  kunyomi: cleanReadings(info.readings_kun),
  stroke_count: info.strokes ?? null,
  grade: info.grade ?? null,
  frequency: info.freq ?? null,
  examples: [],
  mnemonic: null,
}));

writeFileSync(OUT, JSON.stringify(out, null, 1));

const byLvl = {};
for (const k of out) byLvl[k.jlpt_level] = (byLvl[k.jlpt_level] || 0) + 1;
const glossed = out.filter((k) => !/[a-z]/i.test(k.meaning_es)).length;
console.log(
  `kanji_extra.json: ${out.length} kanji written. By level: ${JSON.stringify(byLvl)}. ~${glossed} with Spanish gloss.`
);
