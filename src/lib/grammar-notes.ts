/**
 * Curated, verified N5 grammar knowledge base. Each lesson's `intro_grammar`
 * activity carries a short pattern (e.g. "場所 で 動詞"); we detect the core
 * particle / grammar point and surface a THOROUGH explanation — why it's used,
 * when to use it, common mistakes and extra examples — so the learning phase
 * really teaches, not just states. Content is hand-written and verified (never
 * machine-generated Japanese).
 *
 * Shared frontend module → identical on Mac and Windows.
 */

export interface GrammarExample {
  jp: string;
  reading: string;
  meaning: string;
}

export interface GrammarNote {
  /** The particle/marker (shown big). */
  jp: string;
  /** Spanish title. */
  title: string;
  /** Función: por qué / para qué se usa. */
  why: string;
  /** Casos concretos en los que se usa. */
  whenToUse: string[];
  /** Errores frecuentes a evitar. */
  mistakes: string[];
  examples: GrammarExample[];
}

export const GRAMMAR_NOTES: Record<string, GrammarNote> = {
  は: {
    jp: "は",
    title: "La partícula は — el tema",
    why: "Marca el TEMA de la oración: aquello de lo que vas a hablar ('en cuanto a…'). No es exactamente el sujeto, sino el marco de la frase. Se escribe は pero, como partícula, se pronuncia «wa».",
    whenToUse: [
      "Presentar de qué trata la frase: 私は学生です (En cuanto a mí, soy estudiante).",
      "Contrastar dos cosas: コーヒーは好きですが、お茶は好きじゃないです (El café sí me gusta, el té no).",
      "Hablar de información ya conocida por ambos.",
    ],
    mistakes: [
      "は vs が: は presenta el tema (información conocida); が marca un sujeto nuevo o lo enfatiza. «¿Quién vino?» → 私が来ました (が, respuesta nueva).",
      "Como partícula se pronuncia «wa», no «ha».",
    ],
    examples: [
      { jp: "私は田中です。", reading: "わたしはたなかです", meaning: "Yo soy Tanaka." },
      { jp: "これは本です。", reading: "これはほんです", meaning: "Esto es un libro." },
    ],
  },
  が: {
    jp: "が",
    title: "La partícula が — el sujeto",
    why: "Marca el SUJETO gramatical, sobre todo cuando es información nueva o se quiere enfatizar, y con verbos/adjetivos de existencia, gusto y habilidad.",
    whenToUse: [
      "Sujeto nuevo o enfatizado: 猫がいます (Hay un gato).",
      "Con 好き / 嫌い / 上手 / 下手: 日本語が好きです (Me gusta el japonés).",
      "Con あります / います (existir): お金があります (Tengo dinero).",
      "Cuando la respuesta es el sujeto: だれが来ますか (¿Quién viene?).",
    ],
    mistakes: [
      "Con 好き se usa が, no を: 〜が好きです (no 〜を好きです).",
      "は presenta el tema; が introduce o enfatiza el sujeto.",
    ],
    examples: [
      { jp: "水が好きです。", reading: "みずがすきです", meaning: "Me gusta el agua." },
      { jp: "犬がいます。", reading: "いぬがいます", meaning: "Hay un perro." },
    ],
  },
  を: {
    jp: "を",
    title: "La partícula を — el objeto directo",
    why: "Marca el OBJETO DIRECTO: la cosa que recibe la acción del verbo. Se escribe を y, como partícula, se pronuncia «o».",
    whenToUse: [
      "Lo que comes, bebes, ves, haces…: パンを食べます (Como pan).",
      "En peticiones: コーヒーをください (Un café, por favor).",
      "El lugar que se recorre con verbos de movimiento: 公園を散歩します (Paseo por el parque).",
    ],
    mistakes: [
      "No se usa con 好き (eso lleva が).",
      "Para el destino de un movimiento se usa に/へ, no を.",
    ],
    examples: [
      { jp: "ご飯を食べます。", reading: "ごはんをたべます", meaning: "Como (arroz/comida)." },
      { jp: "水を飲みます。", reading: "みずをのみます", meaning: "Bebo agua." },
    ],
  },
  に: {
    jp: "に",
    title: "La partícula に — destino, tiempo y existencia",
    why: "Muy versátil: marca el destino de un movimiento, el momento exacto en el tiempo, el lugar donde algo EXISTE y el receptor de una acción.",
    whenToUse: [
      "Destino: 学校に行きます (Voy a la escuela).",
      "Momento concreto (hora/fecha): 7時に起きます (Me levanto a las 7).",
      "Lugar donde algo existe (con あります/います): 部屋に猫がいます (Hay un gato en la habitación).",
      "Receptor: 友達にメールを送ります (Le mando un correo a un amigo).",
    ],
    mistakes: [
      "に (existencia/destino) vs で (acción): 図書館で勉強します (acción) pero 図書館にいます (existencia).",
      "Palabras como 今日 / 明日 no llevan に para la hora relativa.",
    ],
    examples: [
      { jp: "日本に行きます。", reading: "にほんにいきます", meaning: "Voy a Japón." },
      { jp: "8時に来ます。", reading: "はちじにきます", meaning: "Vengo a las 8." },
    ],
  },
  へ: {
    jp: "へ",
    title: "La partícula へ — la dirección",
    why: "Marca la DIRECCIÓN hacia la que te mueves. Se escribe へ y, como partícula, se pronuncia «e». Es muy parecida a に para el destino, pero subraya el «hacia».",
    whenToUse: [
      "Con verbos de movimiento (行く, 来る, 帰る): 家へ帰ります (Regreso a casa).",
      "En la mayoría de casos cotidianos es intercambiable con に para el destino.",
    ],
    mistakes: [
      "Como partícula se pronuncia «e», no «he».",
      "へ marca dirección, no el lugar donde algo existe (eso es に).",
    ],
    examples: [
      { jp: "学校へ行きます。", reading: "がっこうへいきます", meaning: "Voy hacia la escuela." },
      { jp: "日本へようこそ。", reading: "にほんへようこそ", meaning: "Bienvenido a Japón." },
    ],
  },
  で: {
    jp: "で",
    title: "La partícula で — lugar de la acción y medio",
    why: "Marca DÓNDE ocurre una acción, o el MEDIO/herramienta con el que se hace algo.",
    whenToUse: [
      "Lugar donde realizas una acción: レストランで食べます (Como en un restaurante).",
      "Medio de transporte o herramienta: 電車で行きます (Voy en tren); 箸で食べます (Como con palillos).",
      "Material o idioma: 日本語で話します (Hablo en japonés).",
    ],
    mistakes: [
      "で (acción) vs に (existencia): 公園で遊びます (juego EN el parque) vs 公園にいます (estoy en el parque).",
    ],
    examples: [
      { jp: "家で勉強します。", reading: "いえでべんきょうします", meaning: "Estudio en casa." },
      { jp: "バスで行きます。", reading: "ばすでいきます", meaning: "Voy en autobús." },
    ],
  },
  の: {
    jp: "の",
    title: "La partícula の — posesión y relación",
    why: "Une dos sustantivos indicando posesión o relación: «A の B» = «B de A».",
    whenToUse: [
      "Posesión: 私の本 (mi libro).",
      "Origen/pertenencia: 日本の車 (un coche de Japón).",
      "Relación entre nombres: 日本語の先生 (profesor de japonés).",
    ],
    mistakes: [
      "El orden es inverso al español: el poseedor va primero (私の本 = «libro de mí» → «mi libro»).",
      "No se usa の entre un adjetivo い y el nombre (高い山, no 高いの山).",
    ],
    examples: [
      { jp: "友達の電話。", reading: "ともだちのでんわ", meaning: "El teléfono de un amigo." },
      { jp: "これは私のかばんです。", reading: "これはわたしのかばんです", meaning: "Esta es mi bolsa." },
    ],
  },
  と: {
    jp: "と",
    title: "La partícula と — «y» / «con»",
    why: "Une sustantivos como «y» (lista completa), o marca con quién haces algo («con»).",
    whenToUse: [
      "«Y» entre sustantivos (lista cerrada): パンと卵 (pan y huevo).",
      "«Con» (compañía): 友達と行きます (Voy con un amigo).",
    ],
    mistakes: [
      "と enumera una lista COMPLETA; para «entre otros» se usa や.",
      "と (y) solo une sustantivos, no frases ni verbos.",
    ],
    examples: [
      { jp: "犬と猫。", reading: "いぬとねこ", meaning: "Perro y gato." },
      { jp: "家族と住んでいます。", reading: "かぞくとすんでいます", meaning: "Vivo con mi familia." },
    ],
  },
  か: {
    jp: "か",
    title: "La partícula か — la pregunta",
    why: "Convierte la frase en PREGUNTA. Se añade al final; en japonés no hace falta el signo «¿?».",
    whenToUse: [
      "Preguntas de sí/no: 学生ですか (¿Eres estudiante?).",
      "Con interrogativos: 何ですか (¿Qué es?), どこですか (¿Dónde está?).",
    ],
    mistakes: [
      "か ya marca la pregunta; no hace falta exagerar la entonación.",
      "No olvides です antes de か con nombres y adjetivos: 元気ですか.",
    ],
    examples: [
      { jp: "お元気ですか。", reading: "おげんきですか", meaning: "¿Cómo estás?" },
      { jp: "これは何ですか。", reading: "これはなんですか", meaning: "¿Qué es esto?" },
    ],
  },
  です: {
    jp: "です",
    title: "です — la cópula (ser/estar)",
    why: "Es la cópula cortés: equivale a «ser/estar». Afirma qué es algo y da un tono educado.",
    whenToUse: [
      "Con sustantivos: 学生です (Soy estudiante).",
      "Con adjetivos: 高いです (Es caro); きれいです (Es bonito).",
      "Negativo: 〜じゃないです / 〜ではありません.",
    ],
    mistakes: [
      "No se pone con verbos: se dice 食べます, no 食べるです.",
      "El pasado es でした (era/fue), no «です + た».",
    ],
    examples: [
      { jp: "私は先生です。", reading: "わたしはせんせいです", meaning: "Soy profesor." },
      { jp: "今日は寒いです。", reading: "きょうはさむいです", meaning: "Hoy hace frío." },
    ],
  },
  "adj-i": {
    jp: "い",
    title: "Adjetivos い",
    why: "Los adjetivos terminados en い describen y pueden ir directos antes del nombre o al final de la frase con です.",
    whenToUse: [
      "Antes del sustantivo, sin の: 高い山 (montaña alta).",
      "Al final con です: この山は高いです (Esta montaña es alta).",
      "Negativo: い → くない (高くないです = no es caro).",
    ],
    mistakes: [
      "No pongas の entre el adjetivo い y el nombre (高い山, no 高いの山).",
      "Para el negativo cambia い→くない, no añadas じゃない (高くない, no 高いじゃない).",
    ],
    examples: [
      { jp: "新しい車。", reading: "あたらしいくるま", meaning: "Coche nuevo." },
      { jp: "このパンは安いです。", reading: "このぱんはやすいです", meaning: "Este pan es barato." },
    ],
  },
};

// Particle priority: pick the most teachable point when a pattern has several.
const PARTICLE_PRIORITY = ["を", "へ", "で", "に", "が", "は", "と", "の"];

/**
 * Detect the core grammar point of a lesson's grammar pattern/title and return
 * its thorough note, or undefined if none matches.
 */
export function grammarNoteFor(
  pattern: string,
  title?: string
): GrammarNote | undefined {
  const tokens = pattern.split(/[\s　]+/).filter(Boolean);
  const hay = `${pattern} ${title ?? ""}`;

  // 1. Standalone particle token (avoids matching で inside です, etc.).
  for (const p of PARTICLE_PRIORITY) {
    if (tokens.includes(p)) return GRAMMAR_NOTES[p];
  }
  // 2. Adjetivos い
  if (/adj|形容詞|い\s*\+|Adj-い/i.test(hay)) return GRAMMAR_NOTES["adj-i"];
  // 3. か (incluye ですか como un solo token)
  if (tokens.some((t) => t === "か" || t.endsWith("か"))) return GRAMMAR_NOTES["か"];
  // 4. Partícula pegada al final de un token (これは, （時）に, …).
  for (const p of PARTICLE_PRIORITY) {
    if (tokens.some((t) => t.length > 1 && t.endsWith(p))) return GRAMMAR_NOTES[p];
  }
  // 5. です como cópula
  if (tokens.some((t) => t.includes("です"))) return GRAMMAR_NOTES["です"];
  return undefined;
}
