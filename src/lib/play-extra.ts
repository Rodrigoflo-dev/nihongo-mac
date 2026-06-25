/**
 * Curated, verified N5 datasets for the two new mini-games:
 *  - "Completa la frase": pick the missing particle/word in a real sentence.
 *  - "Responde": hear what someone says and pick the natural reply.
 * Hand-written Japanese (never generated).
 */

export interface PhraseItem {
  /** Japanese shown big; for the "response" game it's also played as audio. */
  promptJp: string;
  promptReading: string;
  /** Spanish context/hint. */
  promptMeaning: string;
  correct: string;
  options: string[];
  explanation: string;
}

// ── Completa la frase (partículas/palabras) ────────────────────────────────
// promptJp uses ＿＿ for the blank.
export const SENTENCE_COMPLETE: PhraseItem[] = [
  { promptJp: "わたし＿＿がくせいです。", promptReading: "watashi __ gakusei desu", promptMeaning: "Yo soy estudiante.", correct: "は", options: ["は", "を", "に", "で"], explanation: "は marca el tema: «en cuanto a mí, soy estudiante»." },
  { promptJp: "パン＿＿たべます。", promptReading: "pan __ tabemasu", promptMeaning: "Como pan.", correct: "を", options: ["を", "は", "に", "へ"], explanation: "を marca el objeto directo (lo que se come)." },
  { promptJp: "がっこう＿＿いきます。", promptReading: "gakkou __ ikimasu", promptMeaning: "Voy a la escuela.", correct: "に", options: ["に", "を", "で", "と"], explanation: "に marca el destino del movimiento (también vale へ)." },
  { promptJp: "としょかん＿＿べんきょうします。", promptReading: "toshokan __ benkyou shimasu", promptMeaning: "Estudio en la biblioteca.", correct: "で", options: ["で", "に", "を", "へ"], explanation: "で marca el lugar donde ocurre la acción." },
  { promptJp: "みず＿＿のみます。", promptReading: "mizu __ nomimasu", promptMeaning: "Bebo agua.", correct: "を", options: ["を", "が", "に", "は"], explanation: "を marca el objeto directo (lo que se bebe)." },
  { promptJp: "ともだち＿＿いきます。", promptReading: "tomodachi __ ikimasu", promptMeaning: "Voy con un amigo.", correct: "と", options: ["と", "を", "に", "で"], explanation: "と marca «con» (compañía)." },
  { promptJp: "コーヒー＿＿ください。", promptReading: "koohii __ kudasai", promptMeaning: "Un café, por favor.", correct: "を", options: ["を", "は", "が", "に"], explanation: "を + ください para pedir algo." },
  { promptJp: "７じ＿＿おきます。", promptReading: "shichi-ji __ okimasu", promptMeaning: "Me levanto a las 7.", correct: "に", options: ["に", "で", "を", "は"], explanation: "に marca el momento exacto (hora)." },
  { promptJp: "でんしゃ＿＿いきます。", promptReading: "densha __ ikimasu", promptMeaning: "Voy en tren.", correct: "で", options: ["で", "に", "を", "へ"], explanation: "で marca el medio de transporte." },
  { promptJp: "にほんご＿＿すきです。", promptReading: "nihongo __ suki desu", promptMeaning: "Me gusta el japonés.", correct: "が", options: ["が", "を", "は", "に"], explanation: "Con 好き se usa が, no を." },
  { promptJp: "これ＿＿わたしのほんです。", promptReading: "kore __ watashi no hon desu", promptMeaning: "Este es mi libro.", correct: "は", options: ["は", "を", "が", "で"], explanation: "は presenta el tema; の indica posesión." },
  { promptJp: "いえ＿＿かえります。", promptReading: "ie __ kaerimasu", promptMeaning: "Regreso a casa.", correct: "に", options: ["に", "で", "を", "が"], explanation: "に (o へ) marca el destino con 帰ります." },
];

// ── Responde (escucha y elige la respuesta natural) ────────────────────────
export const RESPONSES: PhraseItem[] = [
  { promptJp: "おはようございます。", promptReading: "ohayou gozaimasu", promptMeaning: "Buenos días (formal).", correct: "おはようございます。", options: ["おはようございます。", "こんばんは。", "さようなら。", "おやすみなさい。"], explanation: "Se responde el mismo saludo: おはようございます。" },
  { promptJp: "ありがとうございます。", promptReading: "arigatou gozaimasu", promptMeaning: "Gracias.", correct: "どういたしまして。", options: ["どういたしまして。", "すみません。", "はじめまして。", "いただきます。"], explanation: "«De nada» = どういたしまして。" },
  { promptJp: "はじめまして。", promptReading: "hajimemashite", promptMeaning: "Mucho gusto (al conocerse).", correct: "よろしくおねがいします。", options: ["よろしくおねがいします。", "おかえりなさい。", "ごちそうさま。", "おやすみ。"], explanation: "Tras はじめまして se dice よろしくおねがいします。" },
  { promptJp: "お元気ですか。", promptReading: "ogenki desu ka", promptMeaning: "¿Cómo estás?", correct: "はい、元気です。", options: ["はい、元気です。", "いいえ、ちがいます。", "どういたしまして。", "いってきます。"], explanation: "Se responde sobre tu estado: はい、元気です。" },
  { promptJp: "いってきます。", promptReading: "ittekimasu", promptMeaning: "Me voy (y vuelvo).", correct: "いってらっしゃい。", options: ["いってらっしゃい。", "おかえりなさい。", "ただいま。", "こんにちは。"], explanation: "A いってきます se responde いってらっしゃい。" },
  { promptJp: "ただいま。", promptReading: "tadaima", promptMeaning: "Ya llegué (a casa).", correct: "おかえりなさい。", options: ["おかえりなさい。", "いってらっしゃい。", "はじめまして。", "ごめんなさい。"], explanation: "A ただいま se responde おかえりなさい。" },
  { promptJp: "すみません。", promptReading: "sumimasen", promptMeaning: "Disculpe.", correct: "はい、何ですか。", options: ["はい、何ですか。", "どういたしまして。", "おやすみなさい。", "いただきます。"], explanation: "Para atender a alguien: はい、何ですか。" },
  { promptJp: "おやすみなさい。", promptReading: "oyasumi nasai", promptMeaning: "Buenas noches (al dormir).", correct: "おやすみなさい。", options: ["おやすみなさい。", "おはようございます。", "こんにちは。", "いってきます。"], explanation: "Se responde igual: おやすみなさい。" },
  { promptJp: "いくらですか。", promptReading: "ikura desu ka", promptMeaning: "¿Cuánto cuesta?", correct: "千円です。", options: ["千円です。", "三時です。", "元気です。", "学生です。"], explanation: "Una respuesta de precio: 千円です (1000 yenes)." },
  { promptJp: "お名前は？", promptReading: "onamae wa?", promptMeaning: "¿Cuál es tu nombre?", correct: "田中です。", options: ["田中です。", "七時です。", "日本です。", "元気です。"], explanation: "Se responde con el nombre: 田中です。" },
  { promptJp: "コーヒーをください。", promptReading: "koohii wo kudasai", promptMeaning: "Un café, por favor.", correct: "かしこまりました。", options: ["かしこまりました。", "いってきます。", "はじめまして。", "おやすみ。"], explanation: "El empleado responde: かしこまりました (de acuerdo)." },
  { promptJp: "さようなら。", promptReading: "sayounara", promptMeaning: "Adiós.", correct: "さようなら。", options: ["さようなら。", "おはよう。", "いただきます。", "ただいま。"], explanation: "Se responde さようなら (o またね)." },
];
