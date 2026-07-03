/**
 * Extended "class-like" notes for kanji shown in the learning phase: how the
 * kanji is really used, which particles / patterns it combines with, common
 * words it forms, and real-life example sentences.
 *
 * Bilingual: every explanation has a Spanish and an English version so the
 * learner can choose the narration language. All Japanese is hand-written and
 * verified (N5). Authored for the early lessons first; kanji without an entry
 * fall back to the lesson's short note.
 */

export interface KanjiWord {
  jp: string;
  reading: string;
  meaning: string;
  meaningEn: string;
}

export interface KanjiNote {
  /** A short "class" paragraph: what it means and how it behaves. */
  usage: string;
  usageEn: string;
  /** How it combines — particles, patterns, ways to use it in a sentence. */
  combos: string[];
  combosEn: string[];
  /** Common words the kanji forms. */
  words: KanjiWord[];
  /** Real-life example sentences. */
  examples: KanjiWord[];
}

const NOTES: Record<string, KanjiNote> = {
  私: {
    usage:
      "私 (わたし) es la forma neutra y cortés de decir «yo». Sirve para hombres y mujeres en casi cualquier situación. En contextos muy formales las mujeres pueden leerlo «わたくし». Su lectura on'yomi シ aparece en palabras como 私立 (しりつ, privado).",
    usageEn:
      "私 (watashi) is the neutral, polite way to say “I”. It works for men and women in almost any situation. In very formal contexts women may read it “watakushi”. Its on'yomi reading シ appears in words like 私立 (shiritsu, private).",
    combos: [
      "私は… → presentarte o hablar de ti: 私は学生です (Yo soy estudiante).",
      "私の… → «mi / mío»: 私の名前 (mi nombre), 私の本 (mi libro).",
      "私も… → «yo también»: 私も行きます (Yo también voy).",
    ],
    combosEn: [
      "私は… → introduce yourself or talk about you: 私は学生です (I am a student).",
      "私の… → “my / mine”: 私の名前 (my name), 私の本 (my book).",
      "私も… → “me too”: 私も行きます (I'm going too).",
    ],
    words: [
      { jp: "私", reading: "わたし", meaning: "yo", meaningEn: "I / me" },
      { jp: "私たち", reading: "わたしたち", meaning: "nosotros", meaningEn: "we / us" },
      { jp: "私立", reading: "しりつ", meaning: "privado (escuela, etc.)", meaningEn: "private (school, etc.)" },
    ],
    examples: [
      { jp: "私は先生です。", reading: "わたしはせんせいです", meaning: "Yo soy profesor(a).", meaningEn: "I am a teacher." },
      { jp: "私の友だちです。", reading: "わたしのともだちです", meaning: "Es mi amigo(a).", meaningEn: "This is my friend." },
      { jp: "私も日本語を勉強します。", reading: "わたしもにほんごをべんきょうします", meaning: "Yo también estudio japonés.", meaningEn: "I study Japanese too." },
    ],
  },
  学: {
    usage:
      "学 significa «estudiar / aprender / conocimiento». Casi nunca va solo: forma palabras (compuestos). Como verbo se usa 学ぶ (まなぶ, aprender). Su on'yomi ガク es el que verás en la mayoría de las palabras.",
    usageEn:
      "学 means “study / learn / knowledge”. It almost never stands alone: it forms compound words. As a verb it is 学ぶ (manabu, to learn). Its on'yomi ガク is the reading you'll see in most words.",
    combos: [
      "Forma palabras de «escuela / estudio»: 学 + 校 = 学校 (escuela).",
      "学生 (がくせい) = estudiante · 大学 (だいがく) = universidad.",
      "Como verbo: 日本語を学ぶ (にほんごをまなぶ) = aprender japonés.",
    ],
    combosEn: [
      "Forms “school / study” words: 学 + 校 = 学校 (school).",
      "学生 (gakusei) = student · 大学 (daigaku) = university.",
      "As a verb: 日本語を学ぶ (nihongo o manabu) = to learn Japanese.",
    ],
    words: [
      { jp: "学校", reading: "がっこう", meaning: "escuela", meaningEn: "school" },
      { jp: "学生", reading: "がくせい", meaning: "estudiante", meaningEn: "student" },
      { jp: "大学", reading: "だいがく", meaning: "universidad", meaningEn: "university" },
      { jp: "学ぶ", reading: "まなぶ", meaning: "aprender", meaningEn: "to learn" },
    ],
    examples: [
      { jp: "私は日本語を学びます。", reading: "わたしはにほんごをまなびます", meaning: "Aprendo japonés.", meaningEn: "I learn Japanese." },
      { jp: "学校に行きます。", reading: "がっこうにいきます", meaning: "Voy a la escuela.", meaningEn: "I go to school." },
      { jp: "兄は大学生です。", reading: "あにはだいがくせいです", meaning: "Mi hermano mayor es universitario.", meaningEn: "My older brother is a university student." },
    ],
  },
  日: {
    usage:
      "日 significa «día» y «sol». Es uno de los kanji más frecuentes. Se lee de varias formas según la palabra: ニチ / ジツ (on'yomi) y ひ / か (kun'yomi). En fechas, el «día del mes» usa lecturas especiales.",
    usageEn:
      "日 means “day” and “sun”. It's one of the most common kanji. It's read several ways depending on the word: ニチ / ジツ (on'yomi) and ひ / か (kun'yomi). For dates, “day of the month” uses special readings.",
    combos: [
      "日本 (にほん) = Japón (literalmente «origen del sol»).",
      "今日 (きょう) = hoy · 毎日 (まいにち) = todos los días.",
      "日曜日 (にちようび) = domingo · contar días: 一日 (ついたち), 二日 (ふつか)…",
    ],
    combosEn: [
      "日本 (nihon) = Japan (literally “origin of the sun”).",
      "今日 (kyō) = today · 毎日 (mainichi) = every day.",
      "日曜日 (nichiyōbi) = Sunday · counting days: 一日 (tsuitachi), 二日 (futsuka)…",
    ],
    words: [
      { jp: "日本", reading: "にほん", meaning: "Japón", meaningEn: "Japan" },
      { jp: "今日", reading: "きょう", meaning: "hoy", meaningEn: "today" },
      { jp: "毎日", reading: "まいにち", meaning: "todos los días", meaningEn: "every day" },
      { jp: "日曜日", reading: "にちようび", meaning: "domingo", meaningEn: "Sunday" },
    ],
    examples: [
      { jp: "今日は日曜日です。", reading: "きょうはにちようびです", meaning: "Hoy es domingo.", meaningEn: "Today is Sunday." },
      { jp: "毎日、日本語を勉強します。", reading: "まいにちにほんごをべんきょうします", meaning: "Estudio japonés todos los días.", meaningEn: "I study Japanese every day." },
    ],
  },
  月: {
    usage:
      "月 significa «luna» y «mes». Con un número indica el mes del año usando ガツ: 一月 (enero), 二月 (febrero)… Con la lectura つき significa la luna. 月曜日 (げつようび) es lunes.",
    usageEn:
      "月 means “moon” and “month”. With a number it indicates the month of the year using ガツ: 一月 (January), 二月 (February)… With the reading つき it means the moon. 月曜日 (getsuyōbi) is Monday.",
    combos: [
      "Meses: 一月 (いちがつ, enero) … 十二月 (じゅうにがつ, diciembre).",
      "月曜日 (げつようび) = lunes · 今月 (こんげつ) = este mes.",
      "つき = la luna: 月がきれいです (La luna está bonita).",
    ],
    combosEn: [
      "Months: 一月 (ichigatsu, January) … 十二月 (jūnigatsu, December).",
      "月曜日 (getsuyōbi) = Monday · 今月 (kongetsu) = this month.",
      "つき = the moon: 月がきれいです (The moon is beautiful).",
    ],
    words: [
      { jp: "月曜日", reading: "げつようび", meaning: "lunes", meaningEn: "Monday" },
      { jp: "一月", reading: "いちがつ", meaning: "enero", meaningEn: "January" },
      { jp: "今月", reading: "こんげつ", meaning: "este mes", meaningEn: "this month" },
      { jp: "月", reading: "つき", meaning: "luna", meaningEn: "moon" },
    ],
    examples: [
      { jp: "一月は寒いです。", reading: "いちがつはさむいです", meaning: "Enero es frío.", meaningEn: "January is cold." },
      { jp: "来月、日本に行きます。", reading: "らいげつ、にほんにいきます", meaning: "El mes que viene voy a Japón.", meaningEn: "Next month I'm going to Japan." },
    ],
  },
  一: {
    usage:
      "一 es el número «uno»: una sola línea horizontal. Como número se lee いち; al contar objetos con 〜つ se lee ひと: 一つ (ひとつ, una cosa). Aparece en muchísimas palabras.",
    usageEn:
      "一 is the number “one”: a single horizontal line. As a number it's read いち; when counting objects with 〜つ it's read ひと: 一つ (hitotsu, one thing). It appears in a huge number of words.",
    combos: [
      "一つ (ひとつ) = una cosa · 一人 (ひとり) = una persona.",
      "一番 (いちばん) = el número uno / el mejor.",
      "一日 (ついたち = día 1 del mes; いちにち = un día entero).",
    ],
    combosEn: [
      "一つ (hitotsu) = one thing · 一人 (hitori) = one person.",
      "一番 (ichiban) = number one / the best.",
      "一日 (tsuitachi = the 1st of the month; ichinichi = a whole day).",
    ],
    words: [
      { jp: "一つ", reading: "ひとつ", meaning: "uno (cosa)", meaningEn: "one (thing)" },
      { jp: "一人", reading: "ひとり", meaning: "una persona / solo", meaningEn: "one person / alone" },
      { jp: "一番", reading: "いちばん", meaning: "el primero / el mejor", meaningEn: "the first / the best" },
    ],
    examples: [
      { jp: "りんごを一つください。", reading: "りんごをひとつください", meaning: "Deme una manzana, por favor.", meaningEn: "One apple, please." },
      { jp: "一人で行きます。", reading: "ひとりでいきます", meaning: "Voy solo.", meaningEn: "I'm going alone." },
    ],
  },
  行: {
    usage:
      "行 significa «ir». El verbo es 行く (いく). Su on'yomi コウ aparece en palabras como 銀行 (ぎんこう, banco) y 旅行 (りょこう, viaje). Con verbos de movimiento se usa la partícula に (destino) o へ (dirección).",
    usageEn:
      "行 means “to go”. The verb is 行く (iku). Its on'yomi コウ appears in words like 銀行 (ginkō, bank) and 旅行 (ryokō, trip). With motion verbs you use the particle に (destination) or へ (direction).",
    combos: [
      "場所 + に + 行きます = «voy a (lugar)»: 学校に行きます.",
      "銀行 (ぎんこう) = banco · 旅行 (りょこう) = viaje.",
      "急行 (きゅうこう) = tren expreso.",
    ],
    combosEn: [
      "place + に + 行きます = “I go to (place)”: 学校に行きます.",
      "銀行 (ginkō) = bank · 旅行 (ryokō) = trip.",
      "急行 (kyūkō) = express train.",
    ],
    words: [
      { jp: "行く", reading: "いく", meaning: "ir", meaningEn: "to go" },
      { jp: "銀行", reading: "ぎんこう", meaning: "banco", meaningEn: "bank" },
      { jp: "旅行", reading: "りょこう", meaning: "viaje", meaningEn: "trip / travel" },
    ],
    examples: [
      { jp: "明日、東京に行きます。", reading: "あした、とうきょうにいきます", meaning: "Mañana voy a Tokio.", meaningEn: "Tomorrow I'm going to Tokyo." },
      { jp: "銀行はどこですか。", reading: "ぎんこうはどこですか", meaning: "¿Dónde está el banco?", meaningEn: "Where is the bank?" },
    ],
  },
};

export function kanjiNoteFor(char: string): KanjiNote | null {
  return NOTES[char] ?? null;
}
