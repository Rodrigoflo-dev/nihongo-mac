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
  /** Matiz / detalle fino ("En detalle") — opcional. */
  nuance?: string;
  nuanceEn?: string;
}

const NOTES: Record<string, KanjiNote> = {
  私: {
    nuance:
      "私 se lee わたし en el uso diario y significa 'yo' de forma neutra y educada, válido para hombres y mujeres. En contextos muy formales, las mujeres pueden leerlo わたくし. Su lectura on'yomi シ aparece en compuestos como 私立 (しりつ, privado). Detalle cultural: en japonés se omite 私 casi siempre si el contexto ya deja claro que hablas de ti — repetir 私は… suena poco natural. En habla casual, los hombres suelen usar 僕 (ぼく) u 俺 (おれ) en vez de 私.",
    nuanceEn:
      "私 is read わたし and means 'I' in a neutral, polite way — fine for men and women. In very formal settings women may read it わたくし. Its on'yomi シ shows up in compounds like 私立 (しりつ, private). Note: Japanese usually drops 私 when context already makes it clear — repeating 私は… sounds unnatural. In casual speech men often use 僕 (ぼく) or 俺 (おれ) instead.",
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
      { jp: "私は日本人です。", reading: "わたしはにほんじんです", meaning: "Yo soy japonés.", meaningEn: "I am Japanese." },
    ],
  },
  学: {
    nuance:
      "学 transmite la idea de 'aprender / estudio'. Su kun'yomi es まな(ぶ) — 学ぶ (aprender) — y su on'yomi ガク・ガッ aparece en muchísimas palabras del ámbito educativo: 学生 (がくせい, estudiante), 学校 (がっこう, escuela), 大学 (だいがく, universidad), 科学 (かがく, ciencia). Fíjate en el cambio fonético: 学 + 校 → がっこう (la く se vuelve っ). Es uno de los kanji más productivos para formar vocabulario, así que reconocerlo te abre decenas de palabras.",
    nuanceEn:
      "学 carries the idea of 'learning / study'. Its kun'yomi is まな(ぶ) — 学ぶ (to learn) — and its on'yomi ガク・ガッ appears in many school words: 学生 (student), 学校 (school), 大学 (university), 科学 (science). Note the sound change: 学 + 校 → がっこう. It's one of the most productive kanji for building vocabulary.",
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
      { jp: "大学で日本語を勉強します。", reading: "だいがくでにほんごをべんきょうします", meaning: "Estudio japonés en la universidad.", meaningEn: "I study Japanese at university." },
    ],
  },
  日: {
    nuance:
      "日 significa 'día' y también 'sol'. Tiene muchas lecturas: ひ (día, sol: 日が昇る), か en fechas (三日, みっか, día 3), にち・じつ en compuestos (日曜日 にちようび domingo, 本日 ほんじつ hoy formal). Es la raíz de 日本 (にほん／にっぽん, Japón, lit. 'origen del sol'). Cuidado con las fechas del 1 al 10, que son irregulares (ついたち, ふつか, みっか…). Aparece en incontables palabras de tiempo, así que es de los primeros kanji imprescindibles.",
    nuanceEn:
      "日 means 'day' and also 'sun'. It has many readings: ひ (day/sun), か in dates (三日 みっか, the 3rd), にち・じつ in compounds (日曜日 Sunday, 本日 today, formal). It's the root of 日本 (Japan, lit. 'origin of the sun'). Careful with dates 1–10, which are irregular (ついたち, ふつか, みっか…).",
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
      { jp: "日本語を勉強します。", reading: "にほんごをべんきょうします", meaning: "Estudio japonés.", meaningEn: "I study Japanese." },
      { jp: "今日はいい天気です。", reading: "きょうはいいてんきです", meaning: "Hoy hace buen tiempo.", meaningEn: "The weather is nice today." },
    ],
  },
  月: {
    nuance:
      "月 significa 'luna' y 'mes'. Kun'yomi つき (luna: 月がきれい); on'yomi ゲツ・ガツ para meses y días: 月曜日 (げつようび, lunes), 一月 (いちがつ, enero), 今月 (こんげつ, este mes). Detalle clave: para 'el mes número X' se usa ガツ (三月 さんがつ = marzo), pero para 'X meses de duración' se usa かげつ (三か月 = tres meses). Es la pareja de 日 en el calendario y aparece en todos los días de la semana y meses del año.",
    nuanceEn:
      "月 means 'moon' and 'month'. Kun'yomi つき (moon); on'yomi ゲツ・ガツ for months and days: 月曜日 (Monday), 一月 (January), 今月 (this month). Key detail: for 'the Nth month' use ガツ (三月 = March), but for 'a span of N months' use かげつ (三か月 = three months). It's the partner of 日 in the calendar.",
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
      { jp: "今月は忙しいです。", reading: "こんげつはいそがしいです", meaning: "Este mes estoy ocupado.", meaningEn: "I'm busy this month." },
      { jp: "月曜日に会いましょう。", reading: "げつようびにあいましょう", meaning: "Nos vemos el lunes.", meaningEn: "Let's meet on Monday." },
    ],
  },
  一: {
    nuance:
      "一 es el número 'uno' y el trazo más simple, pero sus lecturas cambian mucho según lo que cuentes: いち (uno abstracto, 一番 いちばん = número uno / el más…), ひと(つ) al contar cosas (一つ ひとつ), ついたち para el día 1 del mes. También significa 'el mismo / único' en 一緒 (いっしょ, juntos). Fíjate en los cambios sonoros: 一杯 (いっぱい, un vaso / lleno), 一分 (いっぷん, un minuto). Dominar 一 te prepara para el patrón de los contadores japoneses.",
    nuanceEn:
      "一 is the number 'one' and the simplest stroke, but its readings vary a lot with what you count: いち (abstract one, 一番 = number one/most), ひと(つ) when counting things (一つ), ついたち for the 1st of the month. It also means 'same/single' in 一緒 (いっしょ, together). Note the sound changes: 一杯 (いっぱい), 一分 (いっぷん).",
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
      { jp: "コーヒーを一つください。", reading: "コーヒーをひとつください", meaning: "Un café, por favor.", meaningEn: "One coffee, please." },
      { jp: "一月は寒いです。", reading: "いちがつはさむいです", meaning: "Enero es frío.", meaningEn: "January is cold." },
    ],
  },
  行: {
    nuance:
      "行 transmite 'ir / desplazarse'. Su kun'yomi い(く) da 行く (ir), y おこな(う) da 行う (llevar a cabo, formal). Su on'yomi コウ・ギョウ aparece en 旅行 (りょこう, viaje), 銀行 (ぎんこう, banco) y 行動 (こうどう, acción). Recuerda que 行く es irregular en la forma て/た: 行く→行って／行った (no 行いて). Como verbo de movimiento, el destino se marca con に o へ, y el lugar por el que pasas con を (道を行く).",
    nuanceEn:
      "行 conveys 'go / move'. Its kun'yomi い(く) gives 行く (to go), and おこな(う) gives 行う (to carry out, formal). Its on'yomi コウ・ギョウ appears in 旅行 (trip), 銀行 (bank), 行動 (action). Remember 行く is irregular in the て/た form: 行く→行って／行った. As a motion verb, the destination takes に or へ.",
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
      { jp: "学校に行きます。", reading: "がっこうにいきます", meaning: "Voy a la escuela.", meaningEn: "I go to school." },
      { jp: "来月、旅行します。", reading: "らいげつ、りょこうします", meaning: "El mes que viene viajo.", meaningEn: "I'm traveling next month." },
    ],
  },
};

export function kanjiNoteFor(char: string): KanjiNote | null {
  return NOTES[char] ?? null;
}
