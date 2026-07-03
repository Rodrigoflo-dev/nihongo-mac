/**
 * Extended "class-like" notes for kanji shown in the learning phase: how the
 * kanji is really used, which particles / patterns it combines with, common
 * words it forms, and real-life example sentences.
 *
 * All Japanese is hand-written and verified (N5). Authored for the early lessons
 * first; kanji without an entry simply fall back to the lesson's short note.
 */

export interface KanjiWord {
  jp: string;
  reading: string;
  meaning: string;
}

export interface KanjiNote {
  /** A short "class" paragraph: what it means and how it behaves. */
  usage: string;
  /** How it combines — particles, patterns, ways to use it in a sentence. */
  combos: string[];
  /** Common words the kanji forms. */
  words: KanjiWord[];
  /** Real-life example sentences. */
  examples: KanjiWord[];
}

const NOTES: Record<string, KanjiNote> = {
  私: {
    usage:
      "私 (わたし) es la forma neutra y cortés de decir «yo». Sirve para hombres y mujeres en casi cualquier situación. En contextos muy formales las mujeres pueden leerlo «わたくし». Su lectura on'yomi シ aparece en palabras como 私立 (しりつ, privado).",
    combos: [
      "私は… → presentarte o hablar de ti: 私は学生です (Yo soy estudiante).",
      "私の… → «mi / mío»: 私の名前 (mi nombre), 私の本 (mi libro).",
      "私も… → «yo también»: 私も行きます (Yo también voy).",
    ],
    words: [
      { jp: "私", reading: "わたし", meaning: "yo" },
      { jp: "私たち", reading: "わたしたち", meaning: "nosotros" },
      { jp: "私立", reading: "しりつ", meaning: "privado (escuela, etc.)" },
    ],
    examples: [
      { jp: "私は先生です。", reading: "わたしはせんせいです", meaning: "Yo soy profesor(a)." },
      { jp: "私の友だちです。", reading: "わたしのともだちです", meaning: "Es mi amigo(a)." },
      { jp: "私も日本語を勉強します。", reading: "わたしもにほんごをべんきょうします", meaning: "Yo también estudio japonés." },
    ],
  },
  学: {
    usage:
      "学 significa «estudiar / aprender / conocimiento». Casi nunca va solo: forma palabras (compuestos). Como verbo se usa 学ぶ (まなぶ, aprender). Su on'yomi ガク es el que verás en la mayoría de las palabras.",
    combos: [
      "Forma palabras de «escuela / estudio»: 学 + 校 = 学校 (escuela).",
      "学生 (がくせい) = estudiante · 大学 (だいがく) = universidad.",
      "Como verbo: 日本語を学ぶ (にほんごをまなぶ) = aprender japonés.",
    ],
    words: [
      { jp: "学校", reading: "がっこう", meaning: "escuela" },
      { jp: "学生", reading: "がくせい", meaning: "estudiante" },
      { jp: "大学", reading: "だいがく", meaning: "universidad" },
      { jp: "学ぶ", reading: "まなぶ", meaning: "aprender" },
    ],
    examples: [
      { jp: "私は日本語を学びます。", reading: "わたしはにほんごをまなびます", meaning: "Aprendo japonés." },
      { jp: "学校に行きます。", reading: "がっこうにいきます", meaning: "Voy a la escuela." },
      { jp: "兄は大学生です。", reading: "あにはだいがくせいです", meaning: "Mi hermano mayor es universitario." },
    ],
  },
  日: {
    usage:
      "日 significa «día» y «sol». Es uno de los kanji más frecuentes. Se lee de varias formas según la palabra: ニチ / ジツ (on'yomi) y ひ / か (kun'yomi). En fechas, el «día del mes» usa lecturas especiales.",
    combos: [
      "日本 (にほん) = Japón (literalmente «origen del sol»).",
      "今日 (きょう) = hoy · 毎日 (まいにち) = todos los días.",
      "日曜日 (にちようび) = domingo · contar días: 一日 (ついたち), 二日 (ふつか)…",
    ],
    words: [
      { jp: "日本", reading: "にほん", meaning: "Japón" },
      { jp: "今日", reading: "きょう", meaning: "hoy" },
      { jp: "毎日", reading: "まいにち", meaning: "todos los días" },
      { jp: "日曜日", reading: "にちようび", meaning: "domingo" },
    ],
    examples: [
      { jp: "今日は日曜日です。", reading: "きょうはにちようびです", meaning: "Hoy es domingo." },
      { jp: "毎日、日本語を勉強します。", reading: "まいにちにほんごをべんきょうします", meaning: "Estudio japonés todos los días." },
    ],
  },
  月: {
    usage:
      "月 significa «luna» y «mes». Con un número indica el mes del año usando ガツ: 一月 (enero), 二月 (febrero)… Con la lectura つき significa la luna. 月曜日 (げつようび) es lunes.",
    combos: [
      "Meses: 一月 (いちがつ, enero) … 十二月 (じゅうにがつ, diciembre).",
      "月曜日 (げつようび) = lunes · 今月 (こんげつ) = este mes.",
      "つき = la luna: 月がきれいです (La luna está bonita).",
    ],
    words: [
      { jp: "月曜日", reading: "げつようび", meaning: "lunes" },
      { jp: "一月", reading: "いちがつ", meaning: "enero" },
      { jp: "今月", reading: "こんげつ", meaning: "este mes" },
      { jp: "月", reading: "つき", meaning: "luna" },
    ],
    examples: [
      { jp: "一月は寒いです。", reading: "いちがつはさむいです", meaning: "Enero es frío." },
      { jp: "来月、日本に行きます。", reading: "らいげつ、にほんにいきます", meaning: "El mes que viene voy a Japón." },
    ],
  },
  一: {
    usage:
      "一 es el número «uno»: una sola línea horizontal. Como número se lee いち; al contar objetos con 〜つ se lee ひと: 一つ (ひとつ, una cosa). Aparece en muchísimas palabras.",
    combos: [
      "一つ (ひとつ) = una cosa · 一人 (ひとり) = una persona.",
      "一番 (いちばん) = el número uno / el mejor.",
      "一日 (ついたち = día 1 del mes; いちにち = un día entero).",
    ],
    words: [
      { jp: "一つ", reading: "ひとつ", meaning: "uno (cosa)" },
      { jp: "一人", reading: "ひとり", meaning: "una persona / solo" },
      { jp: "一番", reading: "いちばん", meaning: "el primero / el mejor" },
    ],
    examples: [
      { jp: "りんごを一つください。", reading: "りんごをひとつください", meaning: "Deme una manzana, por favor." },
      { jp: "一人で行きます。", reading: "ひとりでいきます", meaning: "Voy solo." },
    ],
  },
  行: {
    usage:
      "行 significa «ir». El verbo es 行く (いく). Su on'yomi コウ aparece en palabras como 銀行 (ぎんこう, banco) y 旅行 (りょこう, viaje). Con verbos de movimiento se usa la partícula に (destino) o へ (dirección).",
    combos: [
      "場所 + に + 行きます = «voy a (lugar)»: 学校に行きます.",
      "銀行 (ぎんこう) = banco · 旅行 (りょこう) = viaje.",
      "急行 (きゅうこう) = tren expreso.",
    ],
    words: [
      { jp: "行く", reading: "いく", meaning: "ir" },
      { jp: "銀行", reading: "ぎんこう", meaning: "banco" },
      { jp: "旅行", reading: "りょこう", meaning: "viaje" },
    ],
    examples: [
      { jp: "明日、東京に行きます。", reading: "あした、とうきょうにいきます", meaning: "Mañana voy a Tokio." },
      { jp: "銀行はどこですか。", reading: "ぎんこうはどこですか", meaning: "¿Dónde está el banco?" },
    ],
  },
};

export function kanjiNoteFor(char: string): KanjiNote | null {
  return NOTES[char] ?? null;
}
