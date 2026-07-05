/**
 * Extended "class-like" notes for VOCABULARY words shown in the learning phase —
 * the same depth the kanji cards already have: how/when to use the word, useful
 * notes (formality, related words) and several real example sentences.
 *
 * Bilingual (ES/EN) so the narration language toggle works. All Japanese is
 * hand-written and verified. Authored in batches; words without an entry fall
 * back to the simple card.
 */

export interface VocabExample {
  jp: string;
  reading: string;
  meaning: string;
  meaningEn: string;
}

export interface VocabNote {
  /** How/when the word is used. */
  usage: string;
  usageEn: string;
  /** Bullet notes: formality, related words, tips. */
  notes: string[];
  notesEn: string[];
  /** Real example sentences. */
  examples: VocabExample[];
}

const NOTES: Record<string, VocabNote> = {
  おはようございます: {
    usage:
      "Es el saludo FORMAL de la mañana («buenos días»), hasta media mañana (~10-11am). La versión casual con amigos o familia es おはよう (sin ございます).",
    usageEn:
      "It's the FORMAL morning greeting (“good morning”), used until late morning (~10-11am). The casual version with friends or family is おはよう (without ございます).",
    notes: [
      "Formal (con ございます): en el trabajo, con desconocidos, profesores.",
      "Casual (おはよう): con amigos y familia.",
      "Se dice al ver a alguien por primera vez ese día.",
    ],
    notesEn: [
      "Formal (with ございます): at work, with strangers, teachers.",
      "Casual (おはよう): with friends and family.",
      "Said when you see someone for the first time that day.",
    ],
    examples: [
      { jp: "おはようございます、先生。", reading: "おはようございます、せんせい", meaning: "Buenos días, profesor.", meaningEn: "Good morning, teacher." },
      { jp: "部長、おはようございます。", reading: "ぶちょう、おはようございます", meaning: "Buenos días, jefe.", meaningEn: "Good morning, boss." },
      { jp: "おはよう、みんな。", reading: "おはよう、みんな", meaning: "Buenos días a todos. (casual)", meaningEn: "Morning, everyone. (casual)" },
    ],
  },
  こんにちは: {
    usage:
      "Saludo de día («hola / buenas tardes»), desde media mañana hasta el atardecer. Es el «hola» general más seguro. Termina en は (partícula), que suena «wa».",
    usageEn:
      "Daytime greeting (“hello / good afternoon”), from late morning until dusk. It's the safest general “hello”. It ends in は (a particle), pronounced “wa”.",
    notes: [
      "Se usa de ~11am hasta el anochecer.",
      "No se usa para contestar el teléfono (ahí es もしもし).",
      "Termina en は aunque suene «wa».",
    ],
    notesEn: [
      "Used from ~11am until nightfall.",
      "Not used to answer the phone (that's もしもし).",
      "Ends in は even though it sounds like “wa”.",
    ],
    examples: [
      { jp: "こんにちは、田中さん。", reading: "こんにちは、たなかさん", meaning: "Hola, Sr. Tanaka.", meaningEn: "Hello, Mr. Tanaka." },
      { jp: "こんにちは、お元気ですか。", reading: "こんにちは、おげんきですか", meaning: "Hola, ¿cómo está?", meaningEn: "Hello, how are you?" },
    ],
  },
  こんばんは: {
    usage:
      "Saludo de la NOCHE («buenas noches» al saludar, no al despedirse). Se usa desde el atardecer. Termina en は (suena «wa»).",
    usageEn:
      "EVENING greeting (“good evening” when meeting, not when leaving). Used from dusk. It ends in は (sounds like “wa”).",
    notes: [
      "Es para SALUDAR de noche.",
      "Para despedirse antes de dormir es おやすみなさい.",
      "Termina en は (suena «wa»).",
    ],
    notesEn: [
      "It's for GREETING at night.",
      "To say goodnight before sleeping, use おやすみなさい.",
      "Ends in は (sounds like “wa”).",
    ],
    examples: [
      { jp: "こんばんは。", reading: "こんばんは", meaning: "Buenas noches.", meaningEn: "Good evening." },
      { jp: "こんばんは、遅くなってすみません。", reading: "こんばんは、おそくなってすみません", meaning: "Buenas noches, perdón por la tardanza.", meaningEn: "Good evening, sorry I'm late." },
    ],
  },
  ありがとうございます: {
    usage:
      "«Muchas gracias» FORMAL. La versión casual es ありがとう. Por algo ya terminado se usa el pasado ありがとうございました.",
    usageEn:
      "FORMAL “thank you very much”. The casual version is ありがとう. For something already done, use the past ありがとうございました.",
    notes: [
      "Formal: ありがとうございます · Casual: ありがとう.",
      "Por algo ya hecho: ありがとうございました.",
      "Respuesta común: どういたしまして (de nada).",
    ],
    notesEn: [
      "Formal: ありがとうございます · Casual: ありがとう.",
      "For something already done: ありがとうございました.",
      "Common reply: どういたしまして (you're welcome).",
    ],
    examples: [
      { jp: "ありがとうございます。", reading: "ありがとうございます", meaning: "Muchas gracias.", meaningEn: "Thank you very much." },
      { jp: "昨日はありがとうございました。", reading: "きのうはありがとうございました", meaning: "Gracias por lo de ayer.", meaningEn: "Thank you for yesterday." },
      { jp: "手伝ってくれてありがとう。", reading: "てつだってくれてありがとう", meaning: "Gracias por ayudarme. (casual)", meaningEn: "Thanks for helping. (casual)" },
    ],
  },
  さようなら: {
    usage:
      "«Adiós» algo formal o para una despedida larga. En el día a día con conocidos se usan más じゃあね / またね (nos vemos).",
    usageEn:
      "“Goodbye”, somewhat formal or for a long parting. Day-to-day with people you know, じゃあね / またね (see you) are more common.",
    notes: [
      "Suena a despedida formal o «por un buen rato».",
      "Con amigos: じゃあね, またね, また明日 (hasta mañana).",
    ],
    notesEn: [
      "Sounds formal or like a long goodbye.",
      "With friends: じゃあね, またね, また明日 (see you tomorrow).",
    ],
    examples: [
      { jp: "さようなら、また来週。", reading: "さようなら、またらいしゅう", meaning: "Adiós, hasta la próxima semana.", meaningEn: "Goodbye, see you next week." },
      { jp: "先生、さようなら。", reading: "せんせい、さようなら", meaning: "Adiós, profesor.", meaningEn: "Goodbye, teacher." },
    ],
  },
  ありがとう: {
    usage:
      "«Gracias» casual, entre amigos y familia. En situaciones formales añade ございます: ありがとうございます.",
    usageEn:
      "Casual “thanks”, among friends and family. In formal situations add ございます: ありがとうございます.",
    notes: [
      "Casual: ありがとう · Formal: ありがとうございます.",
      "Aún más casual: どうも.",
    ],
    notesEn: [
      "Casual: ありがとう · Formal: ありがとうございます.",
      "Even more casual: どうも.",
    ],
    examples: [
      { jp: "手伝ってくれてありがとう。", reading: "てつだってくれてありがとう", meaning: "Gracias por ayudar.", meaningEn: "Thanks for helping." },
      { jp: "プレゼント、ありがとう。", reading: "ぷれぜんと、ありがとう", meaning: "Gracias por el regalo.", meaningEn: "Thanks for the gift." },
    ],
  },
  学生: {
    usage:
      "«Estudiante». Se usa para estudiantes en general. Palabras relacionadas: 大学生 (universitario), 高校生 (de preparatoria), 小学生 (de primaria).",
    usageEn:
      "“Student”. Used for students in general. Related: 大学生 (university student), 高校生 (high schooler), 小学生 (elementary schooler).",
    notes: [
      "Para presentarte: 私は学生です (Soy estudiante).",
      "大学生 (universitario) · 高校生 (prepa) · 小学生 (primaria).",
    ],
    notesEn: [
      "To introduce yourself: 私は学生です (I'm a student).",
      "大学生 (university) · 高校生 (high school) · 小学生 (elementary).",
    ],
    examples: [
      { jp: "私は学生です。", reading: "わたしはがくせいです", meaning: "Soy estudiante.", meaningEn: "I am a student." },
      { jp: "兄は大学生です。", reading: "あにはだいがくせいです", meaning: "Mi hermano mayor es universitario.", meaningEn: "My older brother is a university student." },
    ],
  },
  今日: {
    usage:
      "«Hoy». Tiene una lectura especial e irregular: きょう (no se lee «konnichi»). Relacionadas: 明日 (mañana), 昨日 (ayer), 毎日 (todos los días).",
    usageEn:
      "“Today”. It has a special irregular reading: きょう (not “konnichi”). Related: 明日 (tomorrow), 昨日 (yesterday), 毎日 (every day).",
    notes: [
      "Lectura irregular: きょう.",
      "明日 (あした, mañana) · 昨日 (きのう, ayer) · 毎日 (まいにち, cada día).",
    ],
    notesEn: [
      "Irregular reading: きょう.",
      "明日 (ashita, tomorrow) · 昨日 (kinō, yesterday) · 毎日 (mainichi, every day).",
    ],
    examples: [
      { jp: "今日は日曜日です。", reading: "きょうはにちようびです", meaning: "Hoy es domingo.", meaningEn: "Today is Sunday." },
      { jp: "今日は暑いです。", reading: "きょうはあついです", meaning: "Hoy hace calor.", meaningEn: "It's hot today." },
    ],
  },
};

export function vocabNoteFor(word: string): VocabNote | null {
  return NOTES[word] ?? null;
}
