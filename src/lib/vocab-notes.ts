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

  // ---- Expresiones ---------------------------------------------------------
  すみません: {
    usage:
      "Palabra clave: «disculpe / perdón / gracias por la molestia». Sirve para llamar la atención (a un mesero), disculparte por una molestia o agradecer que alguien se moleste por ti.",
    usageEn:
      "A key word: “excuse me / sorry / thanks for the trouble”. Use it to get attention (a waiter), to apologize for a bother, or to thank someone for going out of their way.",
    notes: [
      "Llamar la atención: すみません (¡disculpe!).",
      "Disculpa sincera: ごめんなさい.",
      "Agradecer una molestia: すみません.",
    ],
    notesEn: [
      "Get attention: すみません (excuse me!).",
      "Sincere apology: ごめんなさい.",
      "Thank for the trouble: すみません.",
    ],
    examples: [
      { jp: "すみません、メニューをください。", reading: "すみません、メニューをください", meaning: "Disculpe, el menú por favor.", meaningEn: "Excuse me, the menu please." },
      { jp: "遅れてすみません。", reading: "おくれてすみません", meaning: "Perdón por llegar tarde.", meaningEn: "Sorry I'm late." },
    ],
  },
  はじめまして: {
    usage:
      "«Mucho gusto», se dice al conocer a alguien por PRIMERA vez. Suele ir seguido de tu nombre y de どうぞよろしくおねがいします.",
    usageEn:
      "“Nice to meet you”, said when you meet someone for the FIRST time. Usually followed by your name and どうぞよろしくおねがいします.",
    notes: [
      "Solo la primera vez que conoces a alguien.",
      "Combo típico: はじめまして。田中です。どうぞよろしく。",
    ],
    notesEn: [
      "Only the first time you meet someone.",
      "Typical combo: はじめまして。田中です。どうぞよろしく。",
    ],
    examples: [
      { jp: "はじめまして、田中です。", reading: "はじめまして、たなかです", meaning: "Mucho gusto, soy Tanaka.", meaningEn: "Nice to meet you, I'm Tanaka." },
      { jp: "はじめまして、どうぞよろしくおねがいします。", reading: "はじめまして、どうぞよろしくおねがいします", meaning: "Mucho gusto, encantado.", meaningEn: "Nice to meet you, I look forward to it." },
    ],
  },
  ごちそうさま: {
    usage:
      "«Gracias por la comida», se dice al TERMINAR de comer. Antes de comer se dice いただきます. La versión cortés es ごちそうさまでした.",
    usageEn:
      "“Thanks for the meal”, said when you FINISH eating. Before eating you say いただきます. The polite version is ごちそうさまでした.",
    notes: [
      "Al terminar de comer.",
      "Antes de comer: いただきます.",
      "Cortés: ごちそうさまでした.",
    ],
    notesEn: [
      "When you finish eating.",
      "Before eating: いただきます.",
      "Polite: ごちそうさまでした.",
    ],
    examples: [
      { jp: "ごちそうさまでした。", reading: "ごちそうさまでした", meaning: "Gracias por la comida.", meaningEn: "Thank you for the meal." },
      { jp: "ごちそうさま、おいしかったです。", reading: "ごちそうさま、おいしかったです", meaning: "Gracias, estuvo delicioso.", meaningEn: "Thanks, it was delicious." },
    ],
  },
  はい: {
    usage:
      "«Sí». También confirma («entendido») y sirve como «aquí tienes» al entregar algo. Lo contrario es いいえ (no).",
    usageEn:
      "“Yes”. It also confirms (“got it”) and works as “here you go” when handing something over. The opposite is いいえ (no).",
    notes: [
      "«Sí» o confirmación.",
      "Al dar algo: はい、どうぞ.",
      "Contrario: いいえ.",
    ],
    notesEn: [
      "“Yes” or confirmation.",
      "When handing something: はい、どうぞ.",
      "Opposite: いいえ.",
    ],
    examples: [
      { jp: "はい、そうです。", reading: "はい、そうです", meaning: "Sí, así es.", meaningEn: "Yes, that's right." },
      { jp: "はい、わかりました。", reading: "はい、わかりました", meaning: "Sí, entendido.", meaningEn: "Yes, understood." },
    ],
  },
  いいえ: {
    usage:
      "«No», para negar. Para rechazar algo cortésmente se usa いいえ、けっこうです («no, gracias»). Lo contrario es はい.",
    usageEn:
      "“No”, to negate. To decline politely, use いいえ、けっこうです (“no, thank you”). The opposite is はい.",
    notes: [
      "«No» / negación.",
      "«No, gracias»: いいえ、けっこうです.",
      "Contrario: はい.",
    ],
    notesEn: [
      "“No” / negation.",
      "“No, thanks”: いいえ、けっこうです.",
      "Opposite: はい.",
    ],
    examples: [
      { jp: "いいえ、ちがいます。", reading: "いいえ、ちがいます", meaning: "No, no es así.", meaningEn: "No, that's not right." },
      { jp: "いいえ、学生じゃないです。", reading: "いいえ、がくせいじゃないです", meaning: "No, no soy estudiante.", meaningEn: "No, I'm not a student." },
    ],
  },
  また: {
    usage:
      "«Otra vez / de nuevo». En despedidas significa «hasta…»: また明日 (hasta mañana), またね (nos vemos).",
    usageEn:
      "“Again”. In goodbyes it means “see you…”: また明日 (see you tomorrow), またね (see you).",
    notes: [
      "また明日 (hasta mañana) · またね (nos vemos).",
      "«De nuevo»: また来ます (vuelvo otra vez).",
    ],
    notesEn: [
      "また明日 (see you tomorrow) · またね (see you).",
      "“Again”: また来ます (I'll come again).",
    ],
    examples: [
      { jp: "また明日。", reading: "またあした", meaning: "Hasta mañana.", meaningEn: "See you tomorrow." },
      { jp: "また来ますね。", reading: "またきますね", meaning: "Vuelvo otra vez.", meaningEn: "I'll come again." },
    ],
  },
  少々お待ちください: {
    usage:
      "«Espere un momento, por favor», muy cortés — lo dice el personal de servicio (tiendas, teléfono). La versión casual es ちょっと待って.",
    usageEn:
      "“Please wait a moment”, very polite — used by service staff (shops, phone). The casual version is ちょっと待って.",
    notes: [
      "Muy cortés, típico del personal.",
      "Casual: ちょっと待って.",
    ],
    notesEn: [
      "Very polite, typical of staff.",
      "Casual: ちょっと待って.",
    ],
    examples: [
      { jp: "少々お待ちください。", reading: "しょうしょうおまちください", meaning: "Espere un momento, por favor.", meaningEn: "Please wait a moment." },
      { jp: "はい、少々お待ちください。", reading: "はい、しょうしょうおまちください", meaning: "Sí, un momento por favor.", meaningEn: "Yes, one moment please." },
    ],
  },

  // ---- Demostrativos -------------------------------------------------------
  これ: {
    usage:
      "«Esto», algo CERCA DE MÍ. Para señalar objetos. Antes de un nombre se usa この (この本 = este libro). Serie: これ / それ / あれ / どれ.",
    usageEn:
      "“This”, something NEAR ME. To point at objects. Before a noun use この (この本 = this book). Series: これ / それ / あれ / どれ.",
    notes: [
      "これ = cerca de mí · それ = cerca de ti · あれ = lejos.",
      "Antes de un nombre: この本 (este libro).",
      "«¿Cuál?»: どれ.",
    ],
    notesEn: [
      "これ = near me · それ = near you · あれ = far.",
      "Before a noun: この本 (this book).",
      "“Which one?”: どれ.",
    ],
    examples: [
      { jp: "これはいくらですか。", reading: "これはいくらですか", meaning: "¿Cuánto cuesta esto?", meaningEn: "How much is this?" },
      { jp: "これをください。", reading: "これをください", meaning: "Deme esto.", meaningEn: "This one, please." },
    ],
  },
  それ: {
    usage:
      "«Eso», algo CERCA DE TI (el oyente). Antes de un nombre se usa その (その本 = ese libro).",
    usageEn:
      "“That”, something NEAR YOU (the listener). Before a noun use その (その本 = that book).",
    notes: [
      "それ = cerca de ti.",
      "Antes de un nombre: その本 (ese libro).",
    ],
    notesEn: [
      "それ = near you.",
      "Before a noun: その本 (that book).",
    ],
    examples: [
      { jp: "それは何ですか。", reading: "それはなんですか", meaning: "¿Qué es eso?", meaningEn: "What is that?" },
      { jp: "それをください。", reading: "それをください", meaning: "Deme eso.", meaningEn: "That one, please." },
    ],
  },
  あれ: {
    usage:
      "«Aquello», algo LEJOS de ambos. Antes de un nombre se usa あの (あの人 = aquella persona).",
    usageEn:
      "“That over there”, something FAR from both of us. Before a noun use あの (あの人 = that person).",
    notes: [
      "あれ = lejos de los dos.",
      "Antes de un nombre: あの人 (aquella persona).",
    ],
    notesEn: [
      "あれ = far from both.",
      "Before a noun: あの人 (that person).",
    ],
    examples: [
      { jp: "あれは駅です。", reading: "あれはえきです", meaning: "Aquello es la estación.", meaningEn: "That's the station." },
      { jp: "あれは私の車です。", reading: "あれはわたしのくるまです", meaning: "Aquello es mi coche.", meaningEn: "That's my car." },
    ],
  },

  // ---- Números -------------------------------------------------------------
  一: {
    usage:
      "«Uno». Como número se lee いち. Para contar cosas con 〜つ se lee ひと (一つ). Con meses/horas: 一月 (enero), 一時 (la 1).",
    usageEn:
      "“One”. As a number it's read いち. To count things with 〜つ it's read ひと (一つ). With months/hours: 一月 (January), 一時 (1 o'clock).",
    notes: [
      "Número: いち · una cosa: 一つ (ひとつ).",
      "一人 (ひとり) = una persona.",
    ],
    notesEn: [
      "Number: いち · one thing: 一つ (ひとつ).",
      "一人 (ひとり) = one person.",
    ],
    examples: [
      { jp: "コーヒーを一つください。", reading: "コーヒーをひとつください", meaning: "Un café, por favor.", meaningEn: "One coffee, please." },
      { jp: "今、一時です。", reading: "いま、いちじです", meaning: "Ahora es la 1.", meaningEn: "It's 1 o'clock now." },
    ],
  },
  二: {
    usage:
      "«Dos». Número: に. Para personas: 二人 (ふたり). Para cosas con 〜つ: 二つ (ふたつ). Mes: 二月 (febrero).",
    usageEn:
      "“Two”. Number: に. For people: 二人 (ふたり). For things with 〜つ: 二つ (ふたつ). Month: 二月 (February).",
    notes: [
      "二人 (ふたり) = dos personas.",
      "二つ (ふたつ) = dos cosas.",
    ],
    notesEn: [
      "二人 (ふたり) = two people.",
      "二つ (ふたつ) = two things.",
    ],
    examples: [
      { jp: "二人です。", reading: "ふたりです", meaning: "Somos dos.", meaningEn: "Two people." },
      { jp: "二月は寒いです。", reading: "にがつはさむいです", meaning: "Febrero es frío.", meaningEn: "February is cold." },
    ],
  },
  三: {
    usage: "«Tres». Número: さん. Mes: 三月 (marzo). Hora: 三時 (las 3).",
    usageEn: "“Three”. Number: さん. Month: 三月 (March). Hour: 三時 (3 o'clock).",
    notes: ["Número: さん.", "三つ (みっつ) = tres cosas."],
    notesEn: ["Number: さん.", "三つ (みっつ) = three things."],
    examples: [
      { jp: "三時に会いましょう。", reading: "さんじにあいましょう", meaning: "Veámonos a las 3.", meaningEn: "Let's meet at 3." },
      { jp: "三月です。", reading: "さんがつです", meaning: "Es marzo.", meaningEn: "It's March." },
    ],
  },
  四: {
    usage:
      "«Cuatro». Se lee よん o し. Para horas se usa よ: 四時 (las 4). Mes: 四月 (abril, しがつ).",
    usageEn:
      "“Four”. Read よん or し. For hours use よ: 四時 (4 o'clock). Month: 四月 (April, しがつ).",
    notes: [
      "Lecturas: よん / し.",
      "四時 (よじ) = las 4 · 四月 (しがつ) = abril.",
    ],
    notesEn: [
      "Readings: よん / し.",
      "四時 (よじ) = 4 o'clock · 四月 (しがつ) = April.",
    ],
    examples: [
      { jp: "四時です。", reading: "よじです", meaning: "Son las 4.", meaningEn: "It's 4 o'clock." },
      { jp: "四つください。", reading: "よっつください", meaning: "Deme cuatro.", meaningEn: "Four, please." },
    ],
  },
  五: {
    usage: "«Cinco». Número: ご. Hora: 五時 (las 5). Mes: 五月 (mayo).",
    usageEn: "“Five”. Number: ご. Hour: 五時 (5 o'clock). Month: 五月 (May).",
    notes: ["Número: ご.", "五つ (いつつ) = cinco cosas."],
    notesEn: ["Number: ご.", "五つ (いつつ) = five things."],
    examples: [
      { jp: "五時に起きます。", reading: "ごじにおきます", meaning: "Me levanto a las 5.", meaningEn: "I get up at 5." },
      { jp: "りんごを五つ。", reading: "りんごをいつつ", meaning: "Cinco manzanas.", meaningEn: "Five apples." },
    ],
  },
  六: {
    usage: "«Seis». Número: ろく. Hora: 六時 (las 6). Mes: 六月 (junio).",
    usageEn: "“Six”. Number: ろく. Hour: 六時 (6 o'clock). Month: 六月 (June).",
    notes: ["Número: ろく.", "六月 (ろくがつ) = junio."],
    notesEn: ["Number: ろく.", "六月 (ろくがつ) = June."],
    examples: [
      { jp: "六時に帰ります。", reading: "ろくじにかえります", meaning: "Vuelvo a las 6.", meaningEn: "I go home at 6." },
      { jp: "六人います。", reading: "ろくにんいます", meaning: "Somos seis.", meaningEn: "There are six of us." },
    ],
  },
  七: {
    usage:
      "«Siete». Se lee なな o しち. Para horas suele usarse しち: 七時 (las 7). Mes: 七月 (julio, しちがつ).",
    usageEn:
      "“Seven”. Read なな or しち. For hours usually しち: 七時 (7 o'clock). Month: 七月 (July, しちがつ).",
    notes: [
      "Lecturas: なな / しち.",
      "七時 (しちじ) = las 7.",
    ],
    notesEn: [
      "Readings: なな / しち.",
      "七時 (しちじ) = 7 o'clock.",
    ],
    examples: [
      { jp: "七時です。", reading: "しちじです", meaning: "Son las 7.", meaningEn: "It's 7 o'clock." },
      { jp: "七月は暑いです。", reading: "しちがつはあついです", meaning: "Julio es caluroso.", meaningEn: "July is hot." },
    ],
  },
  八: {
    usage: "«Ocho». Número: はち. Hora: 八時 (las 8). Mes: 八月 (agosto).",
    usageEn: "“Eight”. Number: はち. Hour: 八時 (8 o'clock). Month: 八月 (August).",
    notes: ["Número: はち.", "八月 (はちがつ) = agosto."],
    notesEn: ["Number: はち.", "八月 (はちがつ) = August."],
    examples: [
      { jp: "八時に行きます。", reading: "はちじにいきます", meaning: "Voy a las 8.", meaningEn: "I go at 8." },
      { jp: "八人家族です。", reading: "はちにんかぞくです", meaning: "Somos una familia de ocho.", meaningEn: "We're a family of eight." },
    ],
  },
  九: {
    usage:
      "«Nueve». Se lee きゅう o く. Para horas se usa く: 九時 (las 9). Mes: 九月 (septiembre, くがつ).",
    usageEn:
      "“Nine”. Read きゅう or く. For hours use く: 九時 (9 o'clock). Month: 九月 (September, くがつ).",
    notes: [
      "Lecturas: きゅう / く.",
      "九時 (くじ) = las 9.",
    ],
    notesEn: [
      "Readings: きゅう / く.",
      "九時 (くじ) = 9 o'clock.",
    ],
    examples: [
      { jp: "九時に寝ます。", reading: "くじにねます", meaning: "Me acuesto a las 9.", meaningEn: "I go to bed at 9." },
      { jp: "九月です。", reading: "くがつです", meaning: "Es septiembre.", meaningEn: "It's September." },
    ],
  },
  十: {
    usage: "«Diez». Número: じゅう. Hora: 十時 (las 10). Mes: 十月 (octubre).",
    usageEn: "“Ten”. Number: じゅう. Hour: 十時 (10 o'clock). Month: 十月 (October).",
    notes: ["Número: じゅう.", "十一 (じゅういち) = 11, 十二 (じゅうに) = 12…"],
    notesEn: ["Number: じゅう.", "十一 (じゅういち) = 11, 十二 (じゅうに) = 12…"],
    examples: [
      { jp: "十時に会議があります。", reading: "じゅうじにかいぎがあります", meaning: "Hay reunión a las 10.", meaningEn: "There's a meeting at 10." },
      { jp: "十人います。", reading: "じゅうにんいます", meaning: "Hay diez personas.", meaningEn: "There are ten people." },
    ],
  },
  ひとつ: {
    usage:
      "«Uno» (una cosa). Es el contador general 〜つ para objetos: ひとつ, ふたつ, みっつ… Sirve cuando no sabes el contador específico.",
    usageEn:
      "“One (thing)”. It's the general 〜つ counter for objects: ひとつ, ふたつ, みっつ… Handy when you don't know the specific counter.",
    notes: [
      "Serie: ひとつ, ふたつ, みっつ, よっつ, いつつ…",
      "Contador «comodín» para casi cualquier cosa.",
    ],
    notesEn: [
      "Series: ひとつ, ふたつ, みっつ, よっつ, いつつ…",
      "A “catch-all” counter for almost anything.",
    ],
    examples: [
      { jp: "これをひとつください。", reading: "これをひとつください", meaning: "Deme uno de esto.", meaningEn: "One of these, please." },
      { jp: "ケーキをひとつ。", reading: "ケーキをひとつ", meaning: "Un pastel.", meaningEn: "One cake." },
    ],
  },
  ふたつ: {
    usage:
      "«Dos» (cosas), del contador general 〜つ. Para personas se usa 二人 (ふたり).",
    usageEn:
      "“Two (things)”, from the general 〜つ counter. For people use 二人 (ふたり).",
    notes: [
      "Serie: ひとつ, ふたつ, みっつ…",
      "Dos personas: 二人 (ふたり).",
    ],
    notesEn: [
      "Series: ひとつ, ふたつ, みっつ…",
      "Two people: 二人 (ふたり).",
    ],
    examples: [
      { jp: "コーヒーをふたつください。", reading: "コーヒーをふたつください", meaning: "Dos cafés, por favor.", meaningEn: "Two coffees, please." },
      { jp: "ふたつで十分です。", reading: "ふたつでじゅうぶんです", meaning: "Con dos es suficiente.", meaningEn: "Two is enough." },
    ],
  },
  一枚: {
    usage:
      "«Una (hoja)». 〜枚 (まい) es el contador para cosas PLANAS y finas: papel, boletos, platos, camisetas.",
    usageEn:
      "“One (flat thing)”. 〜枚 (まい) is the counter for FLAT, thin things: paper, tickets, plates, shirts.",
    notes: [
      "枚 (まい) = cosas planas.",
      "一枚, 二枚 (にまい), 三枚 (さんまい)…",
    ],
    notesEn: [
      "枚 (まい) = flat things.",
      "一枚, 二枚 (にまい), 三枚 (さんまい)…",
    ],
    examples: [
      { jp: "切符を一枚ください。", reading: "きっぷをいちまいください", meaning: "Un boleto, por favor.", meaningEn: "One ticket, please." },
      { jp: "紙を一枚ください。", reading: "かみをいちまいください", meaning: "Una hoja de papel, por favor.", meaningEn: "One sheet of paper, please." },
    ],
  },
  二人: {
    usage:
      "«Dos personas». 〜人 (にん) es el contador para personas, pero 1 y 2 son irregulares: 一人 (ひとり), 二人 (ふたり).",
    usageEn:
      "“Two people”. 〜人 (にん) counts people, but 1 and 2 are irregular: 一人 (ひとり), 二人 (ふたり).",
    notes: [
      "一人 (ひとり) = 1 persona · 二人 (ふたり) = 2.",
      "Desde 3: 三人 (さんにん), 四人 (よにん)…",
    ],
    notesEn: [
      "一人 (ひとり) = 1 person · 二人 (ふたり) = 2.",
      "From 3: 三人 (さんにん), 四人 (よにん)…",
    ],
    examples: [
      { jp: "二人です。", reading: "ふたりです", meaning: "Somos dos.", meaningEn: "Two, please. / We're two." },
      { jp: "家族は二人です。", reading: "かぞくはふたりです", meaning: "Somos dos en la familia.", meaningEn: "There are two of us in the family." },
    ],
  },

  // ---- Días de la semana ---------------------------------------------------
  月曜日: {
    usage:
      "«Lunes». Todos los días terminan en 曜日 (ようび). Lunes usa 月 (luna): 月曜日.",
    usageEn:
      "“Monday”. Every weekday ends in 曜日 (ようび). Monday uses 月 (moon): 月曜日.",
    notes: [
      "曜日 = día de la semana.",
      "¿Qué día es hoy?: 今日は何曜日ですか.",
    ],
    notesEn: [
      "曜日 = day of the week.",
      "What day is it today?: 今日は何曜日ですか.",
    ],
    examples: [
      { jp: "今日は月曜日です。", reading: "きょうはげつようびです", meaning: "Hoy es lunes.", meaningEn: "Today is Monday." },
      { jp: "月曜日に会議があります。", reading: "げつようびにかいぎがあります", meaning: "El lunes hay reunión.", meaningEn: "There's a meeting on Monday." },
    ],
  },
  火曜日: {
    usage: "«Martes». Usa 火 (fuego): 火曜日.",
    usageEn: "“Tuesday”. Uses 火 (fire): 火曜日.",
    notes: ["火 (fuego) → martes.", "Orden: 月火水木金土日."],
    notesEn: ["火 (fire) → Tuesday.", "Order: 月火水木金土日."],
    examples: [
      { jp: "火曜日は忙しいです。", reading: "かようびはいそがしいです", meaning: "El martes estoy ocupado.", meaningEn: "I'm busy on Tuesday." },
      { jp: "火曜日に行きます。", reading: "かようびにいきます", meaning: "Voy el martes.", meaningEn: "I'll go on Tuesday." },
    ],
  },
  水曜日: {
    usage: "«Miércoles». Usa 水 (agua): 水曜日.",
    usageEn: "“Wednesday”. Uses 水 (water): 水曜日.",
    notes: ["水 (agua) → miércoles.", "Está a mitad de semana."],
    notesEn: ["水 (water) → Wednesday.", "It's midweek."],
    examples: [
      { jp: "水曜日は休みです。", reading: "すいようびはやすみです", meaning: "El miércoles es día libre.", meaningEn: "Wednesday is a day off." },
      { jp: "水曜日に会いましょう。", reading: "すいようびにあいましょう", meaning: "Veámonos el miércoles.", meaningEn: "Let's meet on Wednesday." },
    ],
  },
  土曜日: {
    usage: "«Sábado». Usa 土 (tierra): 土曜日. Junto con el domingo forma el 週末 (fin de semana).",
    usageEn: "“Saturday”. Uses 土 (earth): 土曜日. With Sunday it makes the 週末 (weekend).",
    notes: ["土 (tierra) → sábado.", "週末 = fin de semana."],
    notesEn: ["土 (earth) → Saturday.", "週末 = weekend."],
    examples: [
      { jp: "土曜日に映画を見ます。", reading: "どようびにえいがをみます", meaning: "El sábado veo una película.", meaningEn: "I watch a movie on Saturday." },
      { jp: "土曜日は休みです。", reading: "どようびはやすみです", meaning: "El sábado es libre.", meaningEn: "Saturday is off." },
    ],
  },
  日曜日: {
    usage: "«Domingo». Usa 日 (sol): 日曜日. Suele ser día de descanso.",
    usageEn: "“Sunday”. Uses 日 (sun): 日曜日. Usually a rest day.",
    notes: ["日 (sol) → domingo.", "週末 = fin de semana (con el sábado)."],
    notesEn: ["日 (sun) → Sunday.", "週末 = weekend (with Saturday)."],
    examples: [
      { jp: "今日は日曜日です。", reading: "きょうはにちようびです", meaning: "Hoy es domingo.", meaningEn: "Today is Sunday." },
      { jp: "日曜日は家にいます。", reading: "にちようびはいえにいます", meaning: "El domingo estoy en casa.", meaningEn: "On Sunday I'm at home." },
    ],
  },

  // ---- Tiempo --------------------------------------------------------------
  今: {
    usage: "«Ahora, en este momento». Aparece en 今日 (hoy), 今月 (este mes), 今年 (este año).",
    usageEn: "“Now, at this moment”. It appears in 今日 (today), 今月 (this month), 今年 (this year).",
    notes: ["今 = ahora.", "今日 (hoy) · 今月 (este mes) · 今年 (este año)."],
    notesEn: ["今 = now.", "今日 (today) · 今月 (this month) · 今年 (this year)."],
    examples: [
      { jp: "今、何時ですか。", reading: "いま、なんじですか", meaning: "¿Qué hora es ahora?", meaningEn: "What time is it now?" },
      { jp: "今、行きます。", reading: "いま、いきます", meaning: "Voy ahora.", meaningEn: "I'm coming now." },
    ],
  },
  何時: {
    usage: "«¿Qué hora?». 何 (qué) + 時 (hora). Para preguntar la hora: 今、何時ですか.",
    usageEn: "“What time?”. 何 (what) + 時 (hour). To ask the time: 今、何時ですか.",
    notes: ["何時 = ¿qué hora?", "何時に…？ = ¿a qué hora…?"],
    notesEn: ["何時 = what time?", "何時に…？ = at what time…?"],
    examples: [
      { jp: "今、何時ですか。", reading: "いま、なんじですか", meaning: "¿Qué hora es?", meaningEn: "What time is it?" },
      { jp: "何時に起きますか。", reading: "なんじにおきますか", meaning: "¿A qué hora te levantas?", meaningEn: "What time do you get up?" },
    ],
  },
  時: {
    usage:
      "«…en punto», el contador de horas: 一時 (la 1), 二時 (las 2)… Cuidado: 4 y 9 son irregulares (よじ, くじ).",
    usageEn:
      "“…o'clock”, the hour counter: 一時 (1), 二時 (2)… Careful: 4 and 9 are irregular (よじ, くじ).",
    notes: ["Irregulares: 四時 (よじ), 九時 (くじ).", "Minutos: 〜分 (ふん／ぷん)."],
    notesEn: ["Irregulars: 四時 (よじ), 九時 (くじ).", "Minutes: 〜分 (ふん／ぷん)."],
    examples: [
      { jp: "三時に会いましょう。", reading: "さんじにあいましょう", meaning: "Veámonos a las 3.", meaningEn: "Let's meet at 3." },
      { jp: "今、七時です。", reading: "いま、しちじです", meaning: "Son las 7.", meaningEn: "It's 7 o'clock." },
    ],
  },
  歳: {
    usage:
      "Contador de EDAD: 〜歳. 一歳 (1 año), 十歳 (10 años). Ojo: 20 años es irregular, 二十歳 (はたち).",
    usageEn:
      "AGE counter: 〜歳. 一歳 (1 yr), 十歳 (10 yrs). Note: 20 is irregular, 二十歳 (はたち).",
    notes: ["〜歳 = años de edad.", "20 años: 二十歳 (はたち)."],
    notesEn: ["〜歳 = years old.", "20 years: 二十歳 (はたち)."],
    examples: [
      { jp: "二十歳です。", reading: "はたちです", meaning: "Tengo 20 años.", meaningEn: "I'm 20 years old." },
      { jp: "妹は十歳です。", reading: "いもうとはじゅっさいです", meaning: "Mi hermana tiene 10 años.", meaningEn: "My sister is 10." },
    ],
  },
  何歳: {
    usage: "«¿Cuántos años?». 何 + 歳. La forma más cortés de preguntar la edad es おいくつですか.",
    usageEn: "“How old?”. 何 + 歳. The most polite way to ask age is おいくつですか.",
    notes: ["何歳ですか = ¿cuántos años tienes?", "Cortés: おいくつですか."],
    notesEn: ["何歳ですか = how old are you?", "Polite: おいくつですか."],
    examples: [
      { jp: "何歳ですか。", reading: "なんさいですか", meaning: "¿Cuántos años tienes?", meaningEn: "How old are you?" },
      { jp: "お子さんは何歳ですか。", reading: "おこさんはなんさいですか", meaning: "¿Cuántos años tiene su hijo?", meaningEn: "How old is your child?" },
    ],
  },
  次: {
    usage: "«Siguiente, próximo». 次の駅 (la próxima estación), 次は… (el siguiente es…).",
    usageEn: "“Next”. 次の駅 (the next station), 次は… (next is…).",
    notes: ["次の… = el/la próximo/a…", "Contrario: 前 (まえ, anterior)."],
    notesEn: ["次の… = the next…", "Opposite: 前 (まえ, previous)."],
    examples: [
      { jp: "次の駅で降ります。", reading: "つぎのえきでおります", meaning: "Bajo en la próxima estación.", meaningEn: "I get off at the next station." },
      { jp: "次は私です。", reading: "つぎはわたしです", meaning: "El siguiente soy yo.", meaningEn: "I'm next." },
    ],
  },
  毎日: {
    usage: "«Todos los días». 毎 (cada) + 日 (día). Relacionadas: 毎朝 (cada mañana), 毎週 (cada semana).",
    usageEn: "“Every day”. 毎 (every) + 日 (day). Related: 毎朝 (every morning), 毎週 (every week).",
    notes: ["毎朝 (cada mañana) · 毎週 (cada semana) · 毎月 (cada mes).", "Va bien con rutinas."],
    notesEn: ["毎朝 (every morning) · 毎週 (every week) · 毎月 (every month).", "Great for routines."],
    examples: [
      { jp: "毎日、日本語を勉強します。", reading: "まいにち、にほんごをべんきょうします", meaning: "Estudio japonés todos los días.", meaningEn: "I study Japanese every day." },
      { jp: "毎日、コーヒーを飲みます。", reading: "まいにち、コーヒーをのみます", meaning: "Bebo café todos los días.", meaningEn: "I drink coffee every day." },
    ],
  },

  // ---- Familia y personas --------------------------------------------------
  家族: {
    usage: "«Familia» (la tuya). La familia de otra persona, de forma cortés, es ご家族.",
    usageEn: "“Family” (yours). Someone else's family, politely, is ご家族.",
    notes: ["Tu familia: 家族 · la de otro: ご家族.", "Miembros: 父, 母, 兄, 姉…"],
    notesEn: ["Your family: 家族 · someone's: ご家族.", "Members: 父, 母, 兄, 姉…"],
    examples: [
      { jp: "家族と住んでいます。", reading: "かぞくとすんでいます", meaning: "Vivo con mi familia.", meaningEn: "I live with my family." },
      { jp: "家族は四人です。", reading: "かぞくはよにんです", meaning: "Somos cuatro en la familia.", meaningEn: "There are four in my family." },
    ],
  },
  母: {
    usage: "«(Mi) madre». Para TU propia madre se usa 母. La madre de otra persona es お母さん.",
    usageEn: "“(My) mother”. For YOUR own mother use 母. Someone else's mother is お母さん.",
    notes: ["Tu madre: 母 · la de otro: お母さん.", "Al llamarla: お母さん / ママ."],
    notesEn: ["Your mother: 母 · someone's: お母さん.", "Calling her: お母さん / ママ."],
    examples: [
      { jp: "母は先生です。", reading: "はははせんせいです", meaning: "Mi madre es profesora.", meaningEn: "My mother is a teacher." },
      { jp: "母に電話します。", reading: "ははにでんわします", meaning: "Llamo a mi madre.", meaningEn: "I'll call my mother." },
    ],
  },
  父: {
    usage: "«(Mi) padre». Tu propio padre: 父. El padre de otra persona: お父さん.",
    usageEn: "“(My) father”. Your own father: 父. Someone else's father: お父さん.",
    notes: ["Tu padre: 父 · el de otro: お父さん.", "Al llamarlo: お父さん / パパ."],
    notesEn: ["Your father: 父 · someone's: お父さん.", "Calling him: お父さん / パパ."],
    examples: [
      { jp: "父は会社員です。", reading: "ちちはかいしゃいんです", meaning: "Mi padre es oficinista.", meaningEn: "My father is an office worker." },
      { jp: "父と話します。", reading: "ちちとはなします", meaning: "Hablo con mi padre.", meaningEn: "I talk with my father." },
    ],
  },
  名前: {
    usage: "«Nombre». Para preguntarlo con cortesía se usa お名前: お名前は？ («¿su nombre?»).",
    usageEn: "“Name”. To ask politely use お名前: お名前は？ (“your name?”).",
    notes: ["Cortés: お名前.", "«Me llamo…»: 私の名前は…です."],
    notesEn: ["Polite: お名前.", "“My name is…”: 私の名前は…です."],
    examples: [
      { jp: "お名前は何ですか。", reading: "おなまえはなんですか", meaning: "¿Cómo se llama?", meaningEn: "What's your name?" },
      { jp: "名前を教えてください。", reading: "なまえをおしえてください", meaning: "Dígame su nombre, por favor.", meaningEn: "Please tell me your name." },
    ],
  },
  会社員: {
    usage: "«Empleado de empresa / oficinista». 会社 (empresa) + 員 (miembro). Sirve para decir tu profesión.",
    usageEn: "“Company employee / office worker”. 会社 (company) + 員 (member). Use it to state your job.",
    notes: ["会社 = empresa.", "Otras profesiones: 先生 (profesor), 医者 (médico)."],
    notesEn: ["会社 = company.", "Other jobs: 先生 (teacher), 医者 (doctor)."],
    examples: [
      { jp: "私は会社員です。", reading: "わたしはかいしゃいんです", meaning: "Soy oficinista.", meaningEn: "I'm an office worker." },
      { jp: "父も会社員です。", reading: "ちちもかいしゃいんです", meaning: "Mi padre también es oficinista.", meaningEn: "My father is an office worker too." },
    ],
  },
  国: {
    usage: "«País». De forma cortés, «¿de qué país es?» es お国はどこですか. También significa país natal.",
    usageEn: "“Country”. Politely, “which country are you from?” is お国はどこですか. It also means homeland.",
    notes: ["Cortés: お国.", "Relacionada: 出身 (lugar de origen)."],
    notesEn: ["Polite: お国.", "Related: 出身 (place of origin)."],
    examples: [
      { jp: "お国はどこですか。", reading: "おくにはどこですか", meaning: "¿De qué país es?", meaningEn: "What country are you from?" },
      { jp: "私の国はメキシコです。", reading: "わたしのくにはメキシコです", meaning: "Mi país es México.", meaningEn: "My country is Mexico." },
    ],
  },
  出身: {
    usage: "«Lugar de origen». 〜出身です = «soy de…»: メキシコ出身です. Cortés: ご出身はどこですか.",
    usageEn: "“Place of origin”. 〜出身です = “I'm from…”: メキシコ出身です. Polite: ご出身はどこですか.",
    notes: ["〜出身です = soy de…", "Pregunta: ご出身はどこですか."],
    notesEn: ["〜出身です = I'm from…", "Ask: ご出身はどこですか."],
    examples: [
      { jp: "メキシコ出身です。", reading: "メキシコしゅっしんです", meaning: "Soy de México.", meaningEn: "I'm from Mexico." },
      { jp: "ご出身はどこですか。", reading: "ごしゅっしんはどこですか", meaning: "¿De dónde es usted?", meaningEn: "Where are you from?" },
    ],
  },

  // ---- Comida y restaurante ------------------------------------------------
  ご飯: {
    usage: "«Arroz cocido» y, por extensión, «comida». 朝ご飯 (desayuno), 昼ご飯 (almuerzo), 晩ご飯 (cena).",
    usageEn: "“Cooked rice”, and by extension “a meal”. 朝ご飯 (breakfast), 昼ご飯 (lunch), 晩ご飯 (dinner).",
    notes: ["朝/昼/晩ご飯 = desayuno/almuerzo/cena.", "«Comer»: ご飯を食べる."],
    notesEn: ["朝/昼/晩ご飯 = breakfast/lunch/dinner.", "“To eat”: ご飯を食べる."],
    examples: [
      { jp: "ご飯を食べます。", reading: "ごはんをたべます", meaning: "Como (arroz/comida).", meaningEn: "I eat rice / a meal." },
      { jp: "朝ご飯はパンです。", reading: "あさごはんはパンです", meaning: "El desayuno es pan.", meaningEn: "Breakfast is bread." },
    ],
  },
  お弁当: {
    usage: "«Bento», comida en caja para llevar. Muy común en tiendas y estaciones de Japón.",
    usageEn: "“Bento”, a boxed meal to go. Very common in shops and stations in Japan.",
    notes: ["Se compra en コンビニ y estaciones.", "駅弁 (えきべん) = bento de estación."],
    notesEn: ["Sold in コンビニ and stations.", "駅弁 (ekiben) = station bento."],
    examples: [
      { jp: "お弁当を買います。", reading: "おべんとうをかいます", meaning: "Compro un bento.", meaningEn: "I'll buy a bento." },
      { jp: "このお弁当はおいしいです。", reading: "このおべんとうはおいしいです", meaning: "Este bento está rico.", meaningEn: "This bento is delicious." },
    ],
  },
  卵: {
    usage: "«Huevo». Ingrediente muy común. También se escribe たまご en kana.",
    usageEn: "“Egg”. A very common ingredient. Also written たまご in kana.",
    notes: ["卵焼き (たまごやき) = tortilla japonesa.", "Va con を para el objeto."],
    notesEn: ["卵焼き (tamagoyaki) = Japanese omelette.", "Takes を as the object."],
    examples: [
      { jp: "卵を食べます。", reading: "たまごをたべます", meaning: "Como huevo.", meaningEn: "I eat eggs." },
      { jp: "卵は好きですか。", reading: "たまごはすきですか", meaning: "¿Te gustan los huevos?", meaningEn: "Do you like eggs?" },
    ],
  },
  お茶: {
    usage: "«Té» (normalmente verde). La お lo hace natural/cortés. En restaurantes suele ser gratis.",
    usageEn: "“Tea” (usually green). The お makes it natural/polite. Often free in restaurants.",
    notes: ["緑茶 (ryokucha) = té verde.", "«Tomar el té» ~ お茶を飲む."],
    notesEn: ["緑茶 (ryokucha) = green tea.", "“Have tea” ~ お茶を飲む."],
    examples: [
      { jp: "お茶をください。", reading: "おちゃをください", meaning: "Un té, por favor.", meaningEn: "Tea, please." },
      { jp: "お茶を飲みます。", reading: "おちゃをのみます", meaning: "Bebo té.", meaningEn: "I drink tea." },
    ],
  },
  お水: {
    usage: "«Agua» (para beber). La お la hace más cortés/natural al pedirla. En restaurantes suele ser gratis.",
    usageEn: "“Water” (to drink). The お makes it more polite/natural when ordering. Often free in restaurants.",
    notes: ["水 (みず) = agua · お水 al pedir.", "«Agua fría»: 冷たいお水."],
    notesEn: ["水 (mizu) = water · お水 when ordering.", "“Cold water”: 冷たいお水."],
    examples: [
      { jp: "お水をください。", reading: "おみずをください", meaning: "Agua, por favor.", meaningEn: "Water, please." },
      { jp: "お水をお願いします。", reading: "おみずをおねがいします", meaning: "Un agua, por favor.", meaningEn: "Water, please." },
    ],
  },
  水: {
    usage: "«Agua». El kanji 水 también aparece en 水曜日 (miércoles). Al pedir agua en un restaurante suena mejor お水.",
    usageEn: "“Water”. The kanji 水 also appears in 水曜日 (Wednesday). To order it, お水 sounds better.",
    notes: ["水曜日 (miércoles) usa 水.", "Al pedir: お水をください."],
    notesEn: ["水曜日 (Wednesday) uses 水.", "To order: お水をください."],
    examples: [
      { jp: "水を飲みます。", reading: "みずをのみます", meaning: "Bebo agua.", meaningEn: "I drink water." },
      { jp: "冷たい水がほしいです。", reading: "つめたいみずがほしいです", meaning: "Quiero agua fría.", meaningEn: "I want cold water." },
    ],
  },
  コーヒー: {
    usage: "«Café» (préstamo, en katakana). ホットコーヒー (caliente), アイスコーヒー (frío).",
    usageEn: "“Coffee” (loanword, katakana). ホットコーヒー (hot), アイスコーヒー (iced).",
    notes: ["ホット / アイス = caliente / frío.", "Con leche/azúcar: ミルクと砂糖."],
    notesEn: ["ホット / アイス = hot / iced.", "With milk/sugar: ミルクと砂糖."],
    examples: [
      { jp: "コーヒーをください。", reading: "コーヒーをください", meaning: "Un café, por favor.", meaningEn: "A coffee, please." },
      { jp: "毎朝コーヒーを飲みます。", reading: "まいあさコーヒーをのみます", meaning: "Bebo café cada mañana.", meaningEn: "I drink coffee every morning." },
    ],
  },
  ビール: {
    usage: "«Cerveza» (préstamo). 生ビール (なまビール) es cerveza de barril, muy pedida en izakayas.",
    usageEn: "“Beer” (loanword). 生ビール (nama bīru) is draft beer, popular in izakayas.",
    notes: ["生ビール = de barril.", "«Salud»: 乾杯 (かんぱい)."],
    notesEn: ["生ビール = draft.", "“Cheers”: 乾杯 (kanpai)."],
    examples: [
      { jp: "ビールを一つください。", reading: "ビールをひとつください", meaning: "Una cerveza, por favor.", meaningEn: "One beer, please." },
      { jp: "生ビールをお願いします。", reading: "なまビールをおねがいします", meaning: "Una de barril, por favor.", meaningEn: "A draft beer, please." },
    ],
  },
  ミルク: {
    usage: "«Leche» (préstamo), sobre todo para el café. La leche en general también es 牛乳 (ぎゅうにゅう).",
    usageEn: "“Milk” (loanword), especially for coffee. Milk in general is also 牛乳 (gyūnyū).",
    notes: ["Para el café: ミルク.", "Leche general: 牛乳 (ぎゅうにゅう)."],
    notesEn: ["For coffee: ミルク.", "General milk: 牛乳 (gyūnyū)."],
    examples: [
      { jp: "ミルクを入れますか。", reading: "ミルクをいれますか", meaning: "¿Le pongo leche?", meaningEn: "Shall I add milk?" },
      { jp: "コーヒーにミルクをください。", reading: "コーヒーにミルクをください", meaning: "Leche para el café, por favor.", meaningEn: "Milk for the coffee, please." },
    ],
  },
  砂糖: {
    usage: "«Azúcar». En el café se pide junto con la leche: 砂糖とミルク.",
    usageEn: "“Sugar”. With coffee it's asked together with milk: 砂糖とミルク.",
    notes: ["砂糖とミルク = azúcar y leche.", "«Sin azúcar»: 砂糖なし."],
    notesEn: ["砂糖とミルク = sugar and milk.", "“No sugar”: 砂糖なし."],
    examples: [
      { jp: "砂糖をください。", reading: "さとうをください", meaning: "Azúcar, por favor.", meaningEn: "Sugar, please." },
      { jp: "砂糖は入れません。", reading: "さとうはいれません", meaning: "No le pongo azúcar.", meaningEn: "I don't add sugar." },
    ],
  },
  ケーキ: {
    usage: "«Pastel» (préstamo). Común en cafés como ケーキセット (pastel + bebida).",
    usageEn: "“Cake” (loanword). Common in cafés as a ケーキセット (cake + drink).",
    notes: ["ケーキセット = combo pastel + bebida.", "Contador: 一つ, 二つ…"],
    notesEn: ["ケーキセット = cake + drink combo.", "Counter: 一つ, 二つ…"],
    examples: [
      { jp: "ケーキを一つください。", reading: "ケーキをひとつください", meaning: "Un pastel, por favor.", meaningEn: "One cake, please." },
      { jp: "このケーキはおいしいです。", reading: "このケーキはおいしいです", meaning: "Este pastel está rico.", meaningEn: "This cake is delicious." },
    ],
  },
  おいしい: {
    usage: "«Delicioso, rico» (adjetivo い). Al terminar de comer: おいしかったです (estuvo rico). Muy casual/masculino: うまい.",
    usageEn: "“Delicious” (い-adjective). After eating: おいしかったです (it was delicious). Very casual/masculine: うまい.",
    notes: ["Adjetivo い: おいしい → おいしくない (no rico).", "Pasado: おいしかったです."],
    notesEn: ["い-adjective: おいしい → おいしくない (not tasty).", "Past: おいしかったです."],
    examples: [
      { jp: "このケーキはおいしいです。", reading: "このケーキはおいしいです", meaning: "Este pastel está rico.", meaningEn: "This cake is delicious." },
      { jp: "とてもおいしかったです。", reading: "とてもおいしかったです", meaning: "Estuvo muy rico.", meaningEn: "It was very delicious." },
    ],
  },
  メニュー: {
    usage: "«Menú / carta» (préstamo). Al pedirla: メニューをください / メニューをお願いします.",
    usageEn: "“Menu” (loanword). To ask for it: メニューをください / メニューをお願いします.",
    notes: ["メニューをください = el menú, por favor.", "«¿Tienen menú en inglés?»: 英語のメニューはありますか."],
    notesEn: ["メニューをください = the menu, please.", "“English menu?”: 英語のメニューはありますか."],
    examples: [
      { jp: "メニューをください。", reading: "メニューをください", meaning: "El menú, por favor.", meaningEn: "The menu, please." },
      { jp: "メニューを見せてください。", reading: "メニューをみせてください", meaning: "Muéstreme el menú.", meaningEn: "Please show me the menu." },
    ],
  },
  おすすめ: {
    usage: "«Recomendación». おすすめは何ですか = «¿qué recomienda?». Muy útil en restaurantes.",
    usageEn: "“Recommendation”. おすすめは何ですか = “what do you recommend?”. Very handy in restaurants.",
    notes: ["おすすめは何ですか = ¿qué recomienda?", "«Esto es lo recomendado»: これがおすすめです."],
    notesEn: ["おすすめは何ですか = what do you recommend?", "“This is recommended”: これがおすすめです."],
    examples: [
      { jp: "おすすめは何ですか。", reading: "おすすめはなんですか", meaning: "¿Qué recomienda?", meaningEn: "What do you recommend?" },
      { jp: "これがおすすめです。", reading: "これがおすすめです", meaning: "Esto es lo recomendado.", meaningEn: "This is our recommendation." },
    ],
  },
  席: {
    usage: "«Asiento». 窓側の席 (asiento junto a la ventana). Para preguntar: 席はありますか (¿hay asientos?).",
    usageEn: "“Seat”. 窓側の席 (window seat). To ask: 席はありますか (are there seats?).",
    notes: ["窓側の席 = junto a la ventana.", "禁煙席 = de no fumadores."],
    notesEn: ["窓側の席 = window seat.", "禁煙席 = non-smoking seat."],
    examples: [
      { jp: "窓側の席をお願いします。", reading: "まどがわのせきをおねがいします", meaning: "Un asiento junto a la ventana, por favor.", meaningEn: "A window seat, please." },
      { jp: "席はありますか。", reading: "せきはありますか", meaning: "¿Hay asiento?", meaningEn: "Are there any seats?" },
    ],
  },
  テーブル: {
    usage: "«Mesa» (préstamo). テーブル席 (mesa) frente a カウンター (barra).",
    usageEn: "“Table” (loanword). テーブル席 (table) vs カウンター (counter).",
    notes: ["テーブル席 vs カウンター (barra).", "«Reservar una mesa»: テーブルを予約する."],
    notesEn: ["テーブル席 vs カウンター (counter).", "“Reserve a table”: テーブルを予約する."],
    examples: [
      { jp: "テーブル席をお願いします。", reading: "テーブルせきをおねがいします", meaning: "Una mesa, por favor.", meaningEn: "A table, please." },
      { jp: "テーブルを予約しました。", reading: "テーブルをよやくしました", meaning: "Reservé una mesa.", meaningEn: "I reserved a table." },
    ],
  },
  持ち帰り: {
    usage: "«Para llevar». 持ち帰りで (para llevar), lo contrario de ここで (para comer aquí). También テイクアウト.",
    usageEn: "“To go / takeout”. 持ち帰りで (to go), the opposite of ここで (to eat here). Also テイクアウト.",
    notes: ["持ち帰りで = para llevar.", "Contrario: ここで (para aquí)."],
    notesEn: ["持ち帰りで = to go.", "Opposite: ここで (for here)."],
    examples: [
      { jp: "持ち帰りでお願いします。", reading: "もちかえりでおねがいします", meaning: "Para llevar, por favor.", meaningEn: "To go, please." },
      { jp: "持ち帰りできますか。", reading: "もちかえりできますか", meaning: "¿Se puede para llevar?", meaningEn: "Can I get it to go?" },
    ],
  },
  ここで: {
    usage: "«Aquí» (para hacer algo en este lugar). En el café: ここで食べます (como aquí), lo contrario de 持ち帰り.",
    usageEn: "“Here” (to do something in this place). At the café: ここで食べます (I'll eat here), the opposite of 持ち帰り.",
    notes: ["ここで食べます = como aquí.", "そこで (ahí) · あそこで (allá)."],
    notesEn: ["ここで食べます = I'll eat here.", "そこで (there) · あそこで (over there)."],
    examples: [
      { jp: "ここで食べます。", reading: "ここでたべます", meaning: "Como aquí.", meaningEn: "I'll eat here." },
      { jp: "ここで待ちます。", reading: "ここでまちます", meaning: "Espero aquí.", meaningEn: "I'll wait here." },
    ],
  },
  お会計: {
    usage: "«La cuenta». Al terminar: お会計をお願いします. También se dice お勘定 (おかんじょう).",
    usageEn: "“The bill/check”. When done: お会計をお願いします. Also お勘定 (okanjō).",
    notes: ["お会計をお願いします = la cuenta, por favor.", "«Por separado»: 別々で (べつべつで)."],
    notesEn: ["お会計をお願いします = the check, please.", "“Separately”: 別々で (betsubetsu de)."],
    examples: [
      { jp: "お会計をお願いします。", reading: "おかいけいをおねがいします", meaning: "La cuenta, por favor.", meaningEn: "The check, please." },
      { jp: "お会計は別々でお願いします。", reading: "おかいけいはべつべつでおねがいします", meaning: "Cuentas separadas, por favor.", meaningEn: "Separate checks, please." },
    ],
  },
  全部で: {
    usage: "«En total». Al pagar: 全部でいくらですか (¿cuánto es en total?).",
    usageEn: "“In total”. When paying: 全部でいくらですか (how much in total?).",
    notes: ["全部 = todo · 全部で = en total.", "«¿Cuánto en total?»: 全部でいくら."],
    notesEn: ["全部 = all · 全部で = in total.", "“How much total?”: 全部でいくら."],
    examples: [
      { jp: "全部でいくらですか。", reading: "ぜんぶでいくらですか", meaning: "¿Cuánto es en total?", meaningEn: "How much is it in total?" },
      { jp: "全部で千円です。", reading: "ぜんぶでせんえんです", meaning: "Son 1000 yenes en total.", meaningEn: "It's 1000 yen in total." },
    ],
  },
  食べます: {
    usage: "«Comer» (forma cortés ます). La forma diccionario es 食べる. El objeto lleva を: パンを食べます.",
    usageEn: "“To eat” (polite ます form). The dictionary form is 食べる. The object takes を: パンを食べます.",
    notes: ["Cortés: 食べます · casual: 食べる.", "Objeto con を: ご飯を食べます."],
    notesEn: ["Polite: 食べます · casual: 食べる.", "Object with を: ご飯を食べます."],
    examples: [
      { jp: "パンを食べます。", reading: "パンをたべます", meaning: "Como pan.", meaningEn: "I eat bread." },
      { jp: "朝ご飯を食べません。", reading: "あさごはんをたべません", meaning: "No desayuno.", meaningEn: "I don't eat breakfast." },
    ],
  },
  飲みます: {
    usage: "«Beber» (forma cortés ます). Diccionario: 飲む. El objeto lleva を: 水を飲みます.",
    usageEn: "“To drink” (polite ます form). Dictionary: 飲む. The object takes を: 水を飲みます.",
    notes: ["Cortés: 飲みます · casual: 飲む.", "También «tomar medicina»: 薬を飲む."],
    notesEn: ["Polite: 飲みます · casual: 飲む.", "Also “take medicine”: 薬を飲む."],
    examples: [
      { jp: "水を飲みます。", reading: "みずをのみます", meaning: "Bebo agua.", meaningEn: "I drink water." },
      { jp: "お酒は飲みません。", reading: "おさけはのみません", meaning: "No bebo alcohol.", meaningEn: "I don't drink alcohol." },
    ],
  },
  食べられません: {
    usage: "«No puedo comer» (forma potencial negativa de 食べる). Muy útil para alergias: 〜が食べられません.",
    usageEn: "“I can't eat” (negative potential of 食べる). Very handy for allergies: 〜が食べられません.",
    notes: ["Potencial: 食べられる → 食べられません.", "Para alergias: 〜が食べられません."],
    notesEn: ["Potential: 食べられる → 食べられません.", "For allergies: 〜が食べられません."],
    examples: [
      { jp: "肉が食べられません。", reading: "にくがたべられません", meaning: "No puedo comer carne.", meaningEn: "I can't eat meat." },
      { jp: "卵が食べられません。", reading: "たまごがたべられません", meaning: "No puedo comer huevo.", meaningEn: "I can't eat eggs." },
    ],
  },

  // ---- De compras ----------------------------------------------------------
  いくら: {
    usage: "«¿Cuánto (cuesta)?». Para preguntar el precio: これはいくらですか. En total: 全部でいくらですか.",
    usageEn: "“How much?”. To ask a price: これはいくらですか. In total: 全部でいくらですか.",
    notes: ["これはいくらですか = ¿cuánto cuesta esto?", "全部でいくら = ¿cuánto en total?"],
    notesEn: ["これはいくらですか = how much is this?", "全部でいくら = how much in total?"],
    examples: [
      { jp: "これはいくらですか。", reading: "これはいくらですか", meaning: "¿Cuánto cuesta esto?", meaningEn: "How much is this?" },
      { jp: "全部でいくらですか。", reading: "ぜんぶでいくらですか", meaning: "¿Cuánto es en total?", meaningEn: "How much is it in total?" },
    ],
  },
  サイズ: {
    usage: "«Talla / tamaño» (préstamo). En ropa y bebidas: S / M / L. サイズはありますか.",
    usageEn: "“Size” (loanword). For clothes and drinks: S / M / L. サイズはありますか.",
    notes: ["Mサイズ = talla M.", "«¿Tienen otra talla?»: 他のサイズはありますか."],
    notesEn: ["Mサイズ = size M.", "“Another size?”: 他のサイズはありますか."],
    examples: [
      { jp: "Mサイズをお願いします。", reading: "エムサイズをおねがいします", meaning: "Talla M, por favor.", meaningEn: "Size M, please." },
      { jp: "このサイズはありますか。", reading: "このサイズはありますか", meaning: "¿Tienen esta talla?", meaningEn: "Do you have this size?" },
    ],
  },
  カード: {
    usage: "«Tarjeta» (préstamo), normalmente de crédito. カードで払う = pagar con tarjeta.",
    usageEn: "“Card” (loanword), usually credit. カードで払う = to pay by card.",
    notes: ["カードで払う = pagar con tarjeta.", "«¿Aceptan tarjeta?»: カードは使えますか."],
    notesEn: ["カードで払う = pay by card.", "“Do you take cards?”: カードは使えますか."],
    examples: [
      { jp: "カードで払います。", reading: "カードではらいます", meaning: "Pago con tarjeta.", meaningEn: "I'll pay by card." },
      { jp: "カードは使えますか。", reading: "カードはつかえますか", meaning: "¿Aceptan tarjeta?", meaningEn: "Can I use a card?" },
    ],
  },
  現金: {
    usage: "«Efectivo». 現金で払う = pagar en efectivo. Lo contrario de カード. En Japón el efectivo se usa mucho.",
    usageEn: "“Cash”. 現金で払う = to pay in cash. The opposite of カード. Cash is still very common in Japan.",
    notes: ["現金で払う = pagar en efectivo.", "«Solo efectivo»: 現金だけ."],
    notesEn: ["現金で払う = pay in cash.", "“Cash only”: 現金だけ."],
    examples: [
      { jp: "現金で払います。", reading: "げんきんではらいます", meaning: "Pago en efectivo.", meaningEn: "I'll pay in cash." },
      { jp: "現金だけです。", reading: "げんきんだけです", meaning: "Solo efectivo.", meaningEn: "Cash only." },
    ],
  },
  袋: {
    usage: "«Bolsa». En la caja te preguntan 袋はいりますか (¿necesita bolsa?).",
    usageEn: "“Bag”. At the register they ask 袋はいりますか (do you need a bag?).",
    notes: ["袋はいりますか = ¿necesita bolsa?", "«No, gracias»: いりません / けっこうです."],
    notesEn: ["袋はいりますか = do you need a bag?", "“No thanks”: いりません / けっこうです."],
    examples: [
      { jp: "袋をください。", reading: "ふくろをください", meaning: "Una bolsa, por favor.", meaningEn: "A bag, please." },
      { jp: "袋はいりません。", reading: "ふくろはいりません", meaning: "No necesito bolsa.", meaningEn: "I don't need a bag." },
    ],
  },
  試着: {
    usage: "«Probarse (ropa)». 試着してもいいですか = ¿puedo probármelo? El probador es 試着室 (しちゃくしつ).",
    usageEn: "“Trying on (clothes)”. 試着してもいいですか = may I try it on? The fitting room is 試着室 (shichakushitsu).",
    notes: ["試着してもいいですか = ¿me lo pruebo?", "試着室 = probador."],
    notesEn: ["試着してもいいですか = may I try it on?", "試着室 = fitting room."],
    examples: [
      { jp: "試着してもいいですか。", reading: "しちゃくしてもいいですか", meaning: "¿Puedo probármelo?", meaningEn: "May I try it on?" },
      { jp: "試着室はどこですか。", reading: "しちゃくしつはどこですか", meaning: "¿Dónde está el probador?", meaningEn: "Where is the fitting room?" },
    ],
  },
  店: {
    usage: "«Tienda». De forma cortés/natural, お店. Relacionada: 店員 (てんいん, dependiente).",
    usageEn: "“Shop / store”. Politely/naturally, お店. Related: 店員 (ten'in, shop clerk).",
    notes: ["Cortés: お店.", "店員 (てんいん) = dependiente."],
    notesEn: ["Polite: お店.", "店員 (ten'in) = clerk."],
    examples: [
      { jp: "この店は安いです。", reading: "このみせはやすいです", meaning: "Esta tienda es barata.", meaningEn: "This shop is cheap." },
      { jp: "店は何時までですか。", reading: "みせはなんじまでですか", meaning: "¿Hasta qué hora abre la tienda?", meaningEn: "Until what time is the shop open?" },
    ],
  },
  コンビニ: {
    usage: "«Konbini», tienda 24 h (de «convenience store»). En Japón sirven para comida, pagos y cajero.",
    usageEn: "“Konbini”, a 24-hour convenience store. In Japan they're used for food, payments and ATMs.",
    notes: ["Abre 24 h.", "Cadenas: セブン, ローソン, ファミマ."],
    notesEn: ["Open 24/7.", "Chains: Seven, Lawson, FamilyMart."],
    examples: [
      { jp: "コンビニで買います。", reading: "コンビニでかいます", meaning: "Compro en el konbini.", meaningEn: "I'll buy it at the konbini." },
      { jp: "コンビニはどこですか。", reading: "コンビニはどこですか", meaning: "¿Dónde hay un konbini?", meaningEn: "Where is a konbini?" },
    ],
  },
  安い: {
    usage: "«Barato» (adjetivo い). Su contrario es 高い (caro). Negativo: 安くない.",
    usageEn: "“Cheap” (い-adjective). Its opposite is 高い (expensive). Negative: 安くない.",
    notes: ["Contrario: 高い (caro).", "Negativo: 安くない."],
    notesEn: ["Opposite: 高い (expensive).", "Negative: 安くない."],
    examples: [
      { jp: "この店は安いです。", reading: "このみせはやすいです", meaning: "Esta tienda es barata.", meaningEn: "This shop is cheap." },
      { jp: "もっと安いのはありますか。", reading: "もっとやすいのはありますか", meaning: "¿Hay uno más barato?", meaningEn: "Is there a cheaper one?" },
    ],
  },
  高い: {
    usage: "«Caro» y también «alto» (de altura), adjetivo い. Contrario de barato: 安い. Negativo: 高くない.",
    usageEn: "“Expensive”, and also “tall/high” (い-adjective). Opposite of cheap: 安い. Negative: 高くない.",
    notes: ["高い = caro / alto.", "Contrario (precio): 安い."],
    notesEn: ["高い = expensive / tall.", "Opposite (price): 安い."],
    examples: [
      { jp: "これは高いです。", reading: "これはたかいです", meaning: "Esto es caro.", meaningEn: "This is expensive." },
      { jp: "高いビルですね。", reading: "たかいビルですね", meaning: "Es un edificio alto, ¿no?", meaningEn: "That's a tall building, isn't it?" },
    ],
  },
  色: {
    usage: "«Color». 何色 (なにいろ) = ¿qué color? Se combina: 赤色 (rojo), 青色 (azul).",
    usageEn: "“Color”. 何色 (naniiro) = what color? It combines: 赤色 (red), 青色 (blue).",
    notes: ["何色 = ¿qué color?", "Colores como adjetivo: 白い, 赤い, 青い, 黒い."],
    notesEn: ["何色 = what color?", "Colors as adjectives: 白い, 赤い, 青い, 黒い."],
    examples: [
      { jp: "何色が好きですか。", reading: "なにいろがすきですか", meaning: "¿Qué color te gusta?", meaningEn: "What color do you like?" },
      { jp: "色は白です。", reading: "いろはしろです", meaning: "El color es blanco.", meaningEn: "The color is white." },
    ],
  },
  白: {
    usage: "«Blanco». Como adjetivo se dice 白い (しろい): 白い車 (coche blanco).",
    usageEn: "“White”. As an adjective it's 白い (shiroi): 白い車 (a white car).",
    notes: ["Adjetivo: 白い (しろい).", "Contrario: 黒 (negro)."],
    notesEn: ["Adjective: 白い (shiroi).", "Opposite: 黒 (black)."],
    examples: [
      { jp: "白が好きです。", reading: "しろがすきです", meaning: "Me gusta el blanco.", meaningEn: "I like white." },
      { jp: "白いシャツをください。", reading: "しろいシャツをください", meaning: "Una camisa blanca, por favor.", meaningEn: "A white shirt, please." },
    ],
  },
  赤: {
    usage: "«Rojo». Como adjetivo: 赤い (あかい): 赤い車 (coche rojo).",
    usageEn: "“Red”. As an adjective: 赤い (akai): 赤い車 (a red car).",
    notes: ["Adjetivo: 赤い (あかい).", "赤ちゃん (あかちゃん) = bebé (curiosidad)."],
    notesEn: ["Adjective: 赤い (akai).", "赤ちゃん (akachan) = baby (fun fact)."],
    examples: [
      { jp: "赤が好きです。", reading: "あかがすきです", meaning: "Me gusta el rojo.", meaningEn: "I like red." },
      { jp: "赤いりんごです。", reading: "あかいりんごです", meaning: "Es una manzana roja.", meaningEn: "It's a red apple." },
    ],
  },
  青: {
    usage: "«Azul». Como adjetivo: 青い (あおい). Curiosidad: en los semáforos 青 se usa para el «verde» (青信号).",
    usageEn: "“Blue”. As an adjective: 青い (aoi). Fun fact: at traffic lights 青 is used for “green” (青信号).",
    notes: ["Adjetivo: 青い (あおい).", "Semáforo en verde: 青信号."],
    notesEn: ["Adjective: 青い (aoi).", "Green light: 青信号."],
    examples: [
      { jp: "青が好きです。", reading: "あおがすきです", meaning: "Me gusta el azul.", meaningEn: "I like blue." },
      { jp: "青い空ですね。", reading: "あおいそらですね", meaning: "Es un cielo azul, ¿verdad?", meaningEn: "It's a blue sky, isn't it?" },
    ],
  },
  黒: {
    usage: "«Negro». Como adjetivo: 黒い (くろい): 黒い猫 (gato negro). Contrario: 白 (blanco).",
    usageEn: "“Black”. As an adjective: 黒い (kuroi): 黒い猫 (a black cat). Opposite: 白 (white).",
    notes: ["Adjetivo: 黒い (くろい).", "Contrario: 白 (blanco)."],
    notesEn: ["Adjective: 黒い (kuroi).", "Opposite: 白 (white)."],
    examples: [
      { jp: "黒が好きです。", reading: "くろがすきです", meaning: "Me gusta el negro.", meaningEn: "I like black." },
      { jp: "黒いかばんです。", reading: "くろいかばんです", meaning: "Es una bolsa negra.", meaningEn: "It's a black bag." },
    ],
  },
  大きい: {
    usage: "«Grande» (adjetivo い). Su contrario es 小さい (pequeño). Negativo: 大きくない.",
    usageEn: "“Big” (い-adjective). Its opposite is 小さい (small). Negative: 大きくない.",
    notes: ["Contrario: 小さい (pequeño).", "Antes de nombre: 大きい家 (casa grande)."],
    notesEn: ["Opposite: 小さい (small).", "Before a noun: 大きい家 (a big house)."],
    examples: [
      { jp: "大きいサイズをください。", reading: "おおきいサイズをください", meaning: "Talla grande, por favor.", meaningEn: "A large size, please." },
      { jp: "この部屋は大きいです。", reading: "このへやはおおきいです", meaning: "Esta habitación es grande.", meaningEn: "This room is big." },
    ],
  },
  小さい: {
    usage: "«Pequeño» (adjetivo い). Su contrario es 大きい (grande). Negativo: 小さくない.",
    usageEn: "“Small” (い-adjective). Its opposite is 大きい (big). Negative: 小さくない.",
    notes: ["Contrario: 大きい (grande).", "Antes de nombre: 小さい犬 (perro pequeño)."],
    notesEn: ["Opposite: 大きい (big).", "Before a noun: 小さい犬 (a small dog)."],
    examples: [
      { jp: "小さいサイズはありますか。", reading: "ちいさいサイズはありますか", meaning: "¿Hay talla pequeña?", meaningEn: "Do you have a small size?" },
      { jp: "小さい犬です。", reading: "ちいさいいぬです", meaning: "Es un perro pequeño.", meaningEn: "It's a small dog." },
    ],
  },
  新しい: {
    usage: "«Nuevo» (adjetivo い). Su contrario es 古い (ふるい, viejo). Negativo: 新しくない.",
    usageEn: "“New” (い-adjective). Its opposite is 古い (furui, old). Negative: 新しくない.",
    notes: ["Contrario: 古い (viejo).", "Antes de nombre: 新しい車 (coche nuevo)."],
    notesEn: ["Opposite: 古い (old).", "Before a noun: 新しい車 (a new car)."],
    examples: [
      { jp: "新しい車を買いました。", reading: "あたらしいくるまをかいました", meaning: "Compré un coche nuevo.", meaningEn: "I bought a new car." },
      { jp: "この店は新しいです。", reading: "このみせはあたらしいです", meaning: "Esta tienda es nueva.", meaningEn: "This shop is new." },
    ],
  },

  // ---- Estación y transporte -----------------------------------------------
  駅: {
    usage: "«Estación (de tren)». 駅はどこですか. Relacionadas: 電車 (tren), 切符 (boleto), 改札 (かいさつ, torniquete).",
    usageEn: "“(Train) station”. 駅はどこですか. Related: 電車 (train), 切符 (ticket), 改札 (kaisatsu, ticket gate).",
    notes: ["東京駅 = estación de Tokio.", "改札 = torniquete de acceso."],
    notesEn: ["東京駅 = Tokyo Station.", "改札 = ticket gate."],
    examples: [
      { jp: "駅はどこですか。", reading: "えきはどこですか", meaning: "¿Dónde está la estación?", meaningEn: "Where is the station?" },
      { jp: "東京駅で会いましょう。", reading: "とうきょうえきであいましょう", meaning: "Veámonos en la estación de Tokio.", meaningEn: "Let's meet at Tokyo Station." },
    ],
  },
  電車: {
    usage: "«Tren». 電車で行く = ir en tren (で = medio). 電車に乗る = subir al tren (に).",
    usageEn: "“Train”. 電車で行く = go by train (で = means). 電車に乗る = get on the train (に).",
    notes: ["電車で行く (で = medio de transporte).", "電車に乗る = subir al tren."],
    notesEn: ["電車で行く (で = by means of).", "電車に乗る = get on the train."],
    examples: [
      { jp: "電車で行きます。", reading: "でんしゃでいきます", meaning: "Voy en tren.", meaningEn: "I'll go by train." },
      { jp: "次の電車に乗ります。", reading: "つぎのでんしゃにのります", meaning: "Subo al próximo tren.", meaningEn: "I'll take the next train." },
    ],
  },
  切符: {
    usage: "«Boleto (de tren)». 切符を買う = comprar boleto (en la 券売機). Hoy muchos usan tarjeta IC (Suica).",
    usageEn: "“(Train) ticket”. 切符を買う = buy a ticket (at the 券売機). Many now use an IC card (Suica).",
    notes: ["券売機 (けんばいき) = máquina de boletos.", "Tarjeta IC: Suica / PASMO."],
    notesEn: ["券売機 (kenbaiki) = ticket machine.", "IC card: Suica / PASMO."],
    examples: [
      { jp: "切符を一枚ください。", reading: "きっぷをいちまいください", meaning: "Un boleto, por favor.", meaningEn: "One ticket, please." },
      { jp: "切符はどこで買いますか。", reading: "きっぷはどこでかいますか", meaning: "¿Dónde compro el boleto?", meaningEn: "Where do I buy a ticket?" },
    ],
  },
  乗ります: {
    usage: "«Subir (a un vehículo)», cortés. Diccionario: 乗る. El vehículo lleva に: 電車に乗ります. Contrario: 降ります (bajar).",
    usageEn: "“To get on (a vehicle)”, polite. Dictionary: 乗る. The vehicle takes に: 電車に乗ります. Opposite: 降ります (get off).",
    notes: ["電車に乗る (に, no を).", "Contrario: 降りる (bajar)."],
    notesEn: ["電車に乗る (に, not を).", "Opposite: 降りる (get off)."],
    examples: [
      { jp: "電車に乗ります。", reading: "でんしゃにのります", meaning: "Subo al tren.", meaningEn: "I get on the train." },
      { jp: "バスに乗ります。", reading: "バスにのります", meaning: "Subo al autobús.", meaningEn: "I get on the bus." },
    ],
  },
  乗り換え: {
    usage: "«Transbordo». El verbo es 乗り換える (hacer transbordo). ここで乗り換えます = aquí hago transbordo.",
    usageEn: "“Transfer (trains)”. The verb is 乗り換える (to transfer). ここで乗り換えます = I transfer here.",
    notes: ["乗り換える = hacer transbordo.", "«¿Dónde transbordo?»: どこで乗り換えますか."],
    notesEn: ["乗り換える = to transfer.", "“Where do I transfer?”: どこで乗り換えますか."],
    examples: [
      { jp: "次の駅で乗り換えます。", reading: "つぎのえきでのりかえます", meaning: "Hago transbordo en la próxima estación.", meaningEn: "I transfer at the next station." },
      { jp: "乗り換えはどこですか。", reading: "のりかえはどこですか", meaning: "¿Dónde es el transbordo?", meaningEn: "Where is the transfer?" },
    ],
  },
  入口: {
    usage: "«Entrada». 入 (entrar) + 口 (abertura). Contrario: 出口 (salida).",
    usageEn: "“Entrance”. 入 (enter) + 口 (opening). Opposite: 出口 (exit).",
    notes: ["Contrario: 出口 (salida).", "口 (くち) = boca/abertura."],
    notesEn: ["Opposite: 出口 (exit).", "口 (kuchi) = mouth/opening."],
    examples: [
      { jp: "入口はどこですか。", reading: "いりぐちはどこですか", meaning: "¿Dónde está la entrada?", meaningEn: "Where is the entrance?" },
      { jp: "ここが入口です。", reading: "ここがいりぐちです", meaning: "Aquí es la entrada.", meaningEn: "This is the entrance." },
    ],
  },
  出口: {
    usage: "«Salida». Contrario: 入口 (entrada). En estaciones hay varias: 東口 (salida este), 西口 (oeste).",
    usageEn: "“Exit”. Opposite: 入口 (entrance). Stations have several: 東口 (east exit), 西口 (west).",
    notes: ["東口/西口/南口/北口 = salidas E/O/S/N.", "Contrario: 入口 (entrada)."],
    notesEn: ["東口/西口/南口/北口 = E/W/S/N exits.", "Opposite: 入口 (entrance)."],
    examples: [
      { jp: "出口はどこですか。", reading: "でぐちはどこですか", meaning: "¿Dónde está la salida?", meaningEn: "Where is the exit?" },
      { jp: "東口で会いましょう。", reading: "ひがしぐちであいましょう", meaning: "Veámonos en la salida este.", meaningEn: "Let's meet at the east exit." },
    ],
  },
  何番線: {
    usage: "«¿Qué andén/vía?». 〜番線 (ばんせん) = número de andén: 一番線 (andén 1). Clave para tomar el tren correcto.",
    usageEn: "“Which platform?”. 〜番線 (bansen) = platform number: 一番線 (platform 1). Key to catching the right train.",
    notes: ["一番線, 二番線… = andén 1, 2…", "«¿De qué andén?»: 何番線ですか."],
    notesEn: ["一番線, 二番線… = platform 1, 2…", "“Which platform?”: 何番線ですか."],
    examples: [
      { jp: "東京行きは何番線ですか。", reading: "とうきょうゆきはなんばんせんですか", meaning: "¿De qué andén sale el de Tokio?", meaningEn: "Which platform is the Tokyo train?" },
      { jp: "三番線です。", reading: "さんばんせんです", meaning: "Es el andén 3.", meaningEn: "It's platform 3." },
    ],
  },

  // ---- Verbos de rutina ----------------------------------------------------
  行きます: {
    usage: "«Ir», cortés. Diccionario: 行く. El destino lleva に/へ: 学校に行きます. Contrarios: 来る (venir), 帰る (volver a casa).",
    usageEn: "“To go”, polite. Dictionary: 行く. The destination takes に/へ: 学校に行きます. Opposites: 来る (come), 帰る (go home).",
    notes: ["Destino con に/へ.", "来る (venir) · 帰る (volver a casa)."],
    notesEn: ["Destination with に/へ.", "来る (come) · 帰る (go home)."],
    examples: [
      { jp: "学校に行きます。", reading: "がっこうにいきます", meaning: "Voy a la escuela.", meaningEn: "I go to school." },
      { jp: "明日、東京に行きます。", reading: "あした、とうきょうにいきます", meaning: "Mañana voy a Tokio.", meaningEn: "Tomorrow I'll go to Tokyo." },
    ],
  },
  話します: {
    usage: "«Hablar», cortés. Diccionario: 話す. El idioma lleva を o で: 日本語を話します / 日本語で話します.",
    usageEn: "“To speak”, polite. Dictionary: 話す. The language takes を or で: 日本語を話します / 日本語で話します.",
    notes: ["日本語を話す = hablar japonés.", "«Con alguien»: 友達と話す (と)."],
    notesEn: ["日本語を話す = speak Japanese.", "“With someone”: 友達と話す (と)."],
    examples: [
      { jp: "日本語を話します。", reading: "にほんごをはなします", meaning: "Hablo japonés.", meaningEn: "I speak Japanese." },
      { jp: "友達と話します。", reading: "ともだちとはなします", meaning: "Hablo con un amigo.", meaningEn: "I talk with a friend." },
    ],
  },
  起きます: {
    usage: "«Levantarse / despertarse», cortés. Diccionario: 起きる. La hora lleva に: 7時に起きます. Contrario: 寝る (dormir).",
    usageEn: "“To get up / wake up”, polite. Dictionary: 起きる. The time takes に: 7時に起きます. Opposite: 寝る (sleep).",
    notes: ["Hora con に: 7時に起きます.", "Contrario: 寝る (acostarse)."],
    notesEn: ["Time with に: 7時に起きます.", "Opposite: 寝る (go to bed)."],
    examples: [
      { jp: "毎日、七時に起きます。", reading: "まいにち、しちじにおきます", meaning: "Me levanto a las 7 cada día.", meaningEn: "I get up at 7 every day." },
      { jp: "今日は早く起きました。", reading: "きょうははやくおきました", meaning: "Hoy me levanté temprano.", meaningEn: "I got up early today." },
    ],
  },
  寝ます: {
    usage: "«Dormir / acostarse», cortés. Diccionario: 寝る. La hora lleva に: 11時に寝ます. Contrario: 起きる.",
    usageEn: "“To sleep / go to bed”, polite. Dictionary: 寝る. The time takes に: 11時に寝ます. Opposite: 起きる.",
    notes: ["Hora con に: 11時に寝ます.", "Contrario: 起きる (levantarse)."],
    notesEn: ["Time with に: 11時に寝ます.", "Opposite: 起きる (get up)."],
    examples: [
      { jp: "十一時に寝ます。", reading: "じゅういちじにねます", meaning: "Me acuesto a las 11.", meaningEn: "I go to bed at 11." },
      { jp: "今日は早く寝ます。", reading: "きょうははやくねます", meaning: "Hoy me acuesto temprano.", meaningEn: "I'll go to bed early today." },
    ],
  },

  // ---- Lugares -------------------------------------------------------------
  家: {
    usage: "«Casa / hogar». Se lee いえ, y también うち (mi casa, con matiz de «hogar»). 家に帰る = volver a casa.",
    usageEn: "“House / home”. Read いえ, and also うち (my home, warmer nuance). 家に帰る = go home.",
    notes: ["Lecturas: いえ / うち.", "家に帰る = volver a casa."],
    notesEn: ["Readings: いえ / うち.", "家に帰る = go home."],
    examples: [
      { jp: "家に帰ります。", reading: "いえにかえります", meaning: "Vuelvo a casa.", meaningEn: "I'm going home." },
      { jp: "家で勉強します。", reading: "いえでべんきょうします", meaning: "Estudio en casa.", meaningEn: "I study at home." },
    ],
  },
  部屋: {
    usage: "«Habitación / cuarto». En un hotel: 部屋を予約する. 静かな部屋 (una habitación tranquila).",
    usageEn: "“Room”. At a hotel: 部屋を予約する. 静かな部屋 (a quiet room).",
    notes: ["部屋を予約する = reservar habitación.", "静かな部屋 = habitación tranquila."],
    notesEn: ["部屋を予約する = reserve a room.", "静かな部屋 = a quiet room."],
    examples: [
      { jp: "部屋は静かです。", reading: "へやはしずかです", meaning: "La habitación es tranquila.", meaningEn: "The room is quiet." },
      { jp: "部屋を予約しました。", reading: "へやをよやくしました", meaning: "Reservé una habitación.", meaningEn: "I reserved a room." },
    ],
  },
  窓: {
    usage: "«Ventana». 窓側 (まどがわ) = del lado de la ventana (asiento). 窓を開ける = abrir la ventana.",
    usageEn: "“Window”. 窓側 (madogawa) = window side (seat). 窓を開ける = open the window.",
    notes: ["窓側の席 = asiento junto a la ventana.", "窓を開ける/閉める = abrir/cerrar."],
    notesEn: ["窓側の席 = window seat.", "窓を開ける/閉める = open/close."],
    examples: [
      { jp: "窓を開けてもいいですか。", reading: "まどをあけてもいいですか", meaning: "¿Puedo abrir la ventana?", meaningEn: "May I open the window?" },
      { jp: "窓側の席をお願いします。", reading: "まどがわのせきをおねがいします", meaning: "Un asiento junto a la ventana, por favor.", meaningEn: "A window seat, please." },
    ],
  },
  病院: {
    usage: "«Hospital / clínica». Ojo: no confundir con 美容院 (びよういん, peluquería). El médico es 医者 (いしゃ).",
    usageEn: "“Hospital / clinic”. Careful: don't confuse with 美容院 (biyōin, hair salon). Doctor is 医者 (isha).",
    notes: ["Cuidado: 美容院 (びよういん) = peluquería.", "医者 (いしゃ) = médico."],
    notesEn: ["Careful: 美容院 (biyōin) = salon.", "医者 (isha) = doctor."],
    examples: [
      { jp: "病院はどこですか。", reading: "びょういんはどこですか", meaning: "¿Dónde está el hospital?", meaningEn: "Where is the hospital?" },
      { jp: "病院に行きます。", reading: "びょういんにいきます", meaning: "Voy al hospital.", meaningEn: "I'm going to the hospital." },
    ],
  },
  銀行: {
    usage: "«Banco». Usa el kanji 行 (ir). 銀行でお金を引き出す = sacar dinero. Suele cerrar temprano (~3pm).",
    usageEn: "“Bank”. Uses the kanji 行 (go). 銀行でお金を引き出す = withdraw money. Usually closes early (~3pm).",
    notes: ["Usa 行 (como en 行きます).", "お金を引き出す = sacar dinero."],
    notesEn: ["Uses 行 (as in 行きます).", "お金を引き出す = withdraw money."],
    examples: [
      { jp: "銀行はどこですか。", reading: "ぎんこうはどこですか", meaning: "¿Dónde está el banco?", meaningEn: "Where is the bank?" },
      { jp: "銀行は三時までです。", reading: "ぎんこうはさんじまでです", meaning: "El banco cierra a las 3.", meaningEn: "The bank is open until 3." },
    ],
  },
  映画: {
    usage: "«Película / cine». 映画を見る = ver una película. El cine (lugar) es 映画館 (えいがかん).",
    usageEn: "“Movie / film”. 映画を見る = watch a movie. The cinema (place) is 映画館 (eigakan).",
    notes: ["映画を見る = ver una película.", "映画館 = sala de cine."],
    notesEn: ["映画を見る = watch a movie.", "映画館 = movie theater."],
    examples: [
      { jp: "映画を見ます。", reading: "えいがをみます", meaning: "Veo una película.", meaningEn: "I watch a movie." },
      { jp: "映画が好きです。", reading: "えいががすきです", meaning: "Me gusta el cine.", meaningEn: "I like movies." },
    ],
  },

  // ---- Clima ---------------------------------------------------------------
  天気: {
    usage: "«Clima / tiempo». いい天気 (buen tiempo). El pronóstico es 天気予報 (てんきよほう).",
    usageEn: "“Weather”. いい天気 (nice weather). The forecast is 天気予報 (tenki yohō).",
    notes: ["いい天気 = buen tiempo.", "天気予報 = pronóstico del tiempo."],
    notesEn: ["いい天気 = nice weather.", "天気予報 = weather forecast."],
    examples: [
      { jp: "今日はいい天気です。", reading: "きょうはいいてんきです", meaning: "Hoy hace buen tiempo.", meaningEn: "The weather is nice today." },
      { jp: "天気はどうですか。", reading: "てんきはどうですか", meaning: "¿Qué tal el clima?", meaningEn: "How's the weather?" },
    ],
  },
  雨: {
    usage: "«Lluvia». 雨が降る = llover; 雨です = está lloviendo. Ojo: 飴 (あめ, caramelo) suena igual.",
    usageEn: "“Rain”. 雨が降る = to rain; 雨です = it's raining. Note: 飴 (ame, candy) sounds the same.",
    notes: ["雨が降る = llover.", "Homófono: 飴 (あめ) = caramelo."],
    notesEn: ["雨が降る = to rain.", "Homophone: 飴 (ame) = candy."],
    examples: [
      { jp: "今日は雨です。", reading: "きょうはあめです", meaning: "Hoy llueve.", meaningEn: "It's raining today." },
      { jp: "明日は雨が降ります。", reading: "あしたはあめがふります", meaning: "Mañana lloverá.", meaningEn: "It will rain tomorrow." },
    ],
  },
  寒い: {
    usage: "«Frío» (del ambiente/clima, adjetivo い). Para cosas frías al tacto se usa 冷たい (つめたい). Contrario: 暑い.",
    usageEn: "“Cold” (of the weather, い-adjective). For cold things to the touch use 冷たい (tsumetai). Opposite: 暑い.",
    notes: ["寒い = frío (clima) · 冷たい = frío (al tacto).", "Contrario: 暑い (calor)."],
    notesEn: ["寒い = cold (weather) · 冷たい = cold (touch).", "Opposite: 暑い (hot)."],
    examples: [
      { jp: "今日は寒いです。", reading: "きょうはさむいです", meaning: "Hoy hace frío.", meaningEn: "It's cold today." },
      { jp: "冬は寒いです。", reading: "ふゆはさむいです", meaning: "El invierno es frío.", meaningEn: "Winter is cold." },
    ],
  },
  暑い: {
    usage: "«Caluroso» (del clima, adjetivo い). Para objetos/comida calientes se usa 熱い (あつい, mismo sonido). Contrario: 寒い.",
    usageEn: "“Hot” (of the weather, い-adjective). For hot objects/food use 熱い (atsui, same sound). Opposite: 寒い.",
    notes: ["暑い = calor (clima) · 熱い = caliente (al tacto).", "Contrario: 寒い (frío)."],
    notesEn: ["暑い = hot (weather) · 熱い = hot (touch).", "Opposite: 寒い (cold)."],
    examples: [
      { jp: "今日は暑いです。", reading: "きょうはあついです", meaning: "Hoy hace calor.", meaningEn: "It's hot today." },
      { jp: "夏は暑いです。", reading: "なつはあついです", meaning: "El verano es caluroso.", meaningEn: "Summer is hot." },
    ],
  },

  // ---- Gustos, pasatiempos y varios ----------------------------------------
  好き: {
    usage: "«Gustar / favorito» (adjetivo な). Lo que gusta lleva が: 音楽が好きです. Mucho: 大好き. Contrario: 嫌い (きらい).",
    usageEn: "“To like / favorite” (な-adjective). What you like takes が: 音楽が好きです. A lot: 大好き. Opposite: 嫌い (kirai).",
    notes: ["Lo que gusta con が: 〜が好きです.", "大好き (encanta) · 嫌い (no gustar)."],
    notesEn: ["What you like takes が: 〜が好きです.", "大好き (love) · 嫌い (dislike)."],
    examples: [
      { jp: "音楽が好きです。", reading: "おんがくがすきです", meaning: "Me gusta la música.", meaningEn: "I like music." },
      { jp: "日本語が大好きです。", reading: "にほんごがだいすきです", meaning: "Me encanta el japonés.", meaningEn: "I love Japanese." },
    ],
  },
  趣味: {
    usage: "«Pasatiempo / hobby». 趣味は何ですか = ¿cuál es tu hobby? Se responde: 趣味は〜です.",
    usageEn: "“Hobby”. 趣味は何ですか = what's your hobby? Answer: 趣味は〜です.",
    notes: ["趣味は何ですか = ¿tu hobby?", "趣味は映画です = mi hobby es el cine."],
    notesEn: ["趣味は何ですか = what's your hobby?", "趣味は映画です = my hobby is movies."],
    examples: [
      { jp: "趣味は何ですか。", reading: "しゅみはなんですか", meaning: "¿Cuál es tu pasatiempo?", meaningEn: "What's your hobby?" },
      { jp: "趣味は映画です。", reading: "しゅみはえいがです", meaning: "Mi hobby es el cine.", meaningEn: "My hobby is movies." },
    ],
  },
  音楽: {
    usage: "«Música». 音楽を聞く = escuchar música. Con 好き: 音楽が好きです.",
    usageEn: "“Music”. 音楽を聞く = listen to music. With 好き: 音楽が好きです.",
    notes: ["音楽を聞く = escuchar música.", "«¿Qué música?»: どんな音楽."],
    notesEn: ["音楽を聞く = listen to music.", "“What music?”: どんな音楽."],
    examples: [
      { jp: "音楽を聞きます。", reading: "おんがくをききます", meaning: "Escucho música.", meaningEn: "I listen to music." },
      { jp: "どんな音楽が好きですか。", reading: "どんなおんがくがすきですか", meaning: "¿Qué música te gusta?", meaningEn: "What kind of music do you like?" },
    ],
  },
  スペイン語: {
    usage: "«Español (idioma)». 〜語 (ご) = idioma: 日本語 (japonés), 英語 (inglés). El país es スペイン.",
    usageEn: "“Spanish (language)”. 〜語 (go) = language: 日本語 (Japanese), 英語 (English). The country is スペイン.",
    notes: ["〜語 = idioma: 日本語, 英語, スペイン語.", "País: スペイン (España)."],
    notesEn: ["〜語 = language: 日本語, 英語, スペイン語.", "Country: スペイン (Spain)."],
    examples: [
      { jp: "スペイン語を話します。", reading: "スペインごをはなします", meaning: "Hablo español.", meaningEn: "I speak Spanish." },
      { jp: "スペイン語は難しいですか。", reading: "スペインごはむずかしいですか", meaning: "¿El español es difícil?", meaningEn: "Is Spanish difficult?" },
    ],
  },
  仕事: {
    usage: "«Trabajo / empleo». 仕事に行く = ir al trabajo. Cortés: お仕事. お仕事は何ですか = ¿en qué trabaja?",
    usageEn: "“Work / job”. 仕事に行く = go to work. Polite: お仕事. お仕事は何ですか = what do you do?",
    notes: ["仕事に行く = ir al trabajo.", "お仕事は何ですか = ¿en qué trabaja?"],
    notesEn: ["仕事に行く = go to work.", "お仕事は何ですか = what do you do?"],
    examples: [
      { jp: "仕事は忙しいです。", reading: "しごとはいそがしいです", meaning: "El trabajo está ajetreado.", meaningEn: "Work is busy." },
      { jp: "お仕事は何ですか。", reading: "おしごとはなんですか", meaning: "¿En qué trabaja?", meaningEn: "What do you do for work?" },
    ],
  },
  電話番号: {
    usage: "«Número de teléfono». 電話 (teléfono) + 番号 (número). 電話番号を教えてください = dame tu número.",
    usageEn: "“Phone number”. 電話 (phone) + 番号 (number). 電話番号を教えてください = give me your number.",
    notes: ["番号 = número.", "«¿Cuál es tu número?»: 電話番号は何番ですか."],
    notesEn: ["番号 = number.", "“What's your number?”: 電話番号は何番ですか."],
    examples: [
      { jp: "電話番号を教えてください。", reading: "でんわばんごうをおしえてください", meaning: "Dame tu número, por favor.", meaningEn: "Please tell me your phone number." },
      { jp: "電話番号は何番ですか。", reading: "でんわばんごうはなんばんですか", meaning: "¿Cuál es tu número?", meaningEn: "What's your phone number?" },
    ],
  },
  ワイファイ: {
    usage: "«Wi-Fi» (préstamo). ワイファイはありますか = ¿hay wifi? Común en cafés y hoteles.",
    usageEn: "“Wi-Fi” (loanword). ワイファイはありますか = is there Wi-Fi? Common in cafés and hotels.",
    notes: ["ワイファイはありますか = ¿hay wifi?", "パスワード = contraseña."],
    notesEn: ["ワイファイはありますか = is there Wi-Fi?", "パスワード = password."],
    examples: [
      { jp: "ワイファイはありますか。", reading: "ワイファイはありますか", meaning: "¿Hay wifi?", meaningEn: "Is there Wi-Fi?" },
      { jp: "ワイファイのパスワードは何ですか。", reading: "ワイファイのぱすわーどはなんですか", meaning: "¿Cuál es la contraseña del wifi?", meaningEn: "What's the Wi-Fi password?" },
    ],
  },
  予約: {
    usage: "«Reserva». El verbo es 予約する (reservar). 予約をお願いします = quisiera registrar mi reserva. Común en restaurantes y hoteles.",
    usageEn: "“Reservation”. The verb is 予約する (to reserve). 予約をお願いします = I'd like to make/confirm a reservation. Common at restaurants and hotels.",
    notes: [
      "予約する = reservar.",
      "予約をお願いします = mi reserva, por favor.",
    ],
    notesEn: [
      "予約する = to reserve.",
      "予約をお願いします = my reservation, please.",
    ],
    examples: [
      { jp: "予約をお願いします。", reading: "よやくをおねがいします", meaning: "Una reserva, por favor.", meaningEn: "A reservation, please." },
      { jp: "テーブルを予約しました。", reading: "テーブルをよやくしました", meaning: "Reservé una mesa.", meaningEn: "I reserved a table." },
    ],
  },
};

export function vocabNoteFor(word: string): VocabNote | null {
  return NOTES[word] ?? null;
}
