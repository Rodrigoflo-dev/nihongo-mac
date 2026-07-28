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
  /** English translation (optional — narration falls back to Spanish). */
  meaningEn?: string;
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
  /** Matiz / detalle fino: el "hasta el mínimo detalle" — cómo funciona por
   *  dentro, comparaciones, excepciones y cuándo NO usarla. */
  nuance?: string;
  // Optional English versions for the "escuchar en inglés" narration option.
  whyEn?: string;
  whenToUseEn?: string[];
  mistakesEn?: string[];
  nuanceEn?: string;
}

export const GRAMMAR_NOTES: Record<string, GrammarNote> = {
  は: {
    jp: "は",
    title: "La partícula は — el tema",
    nuance:
      "は marca el TEMA, no el sujeto: 「私は」 puede traducirse como 'yo', 'a mí' o 'para mí' según el verbo. Cuando lo que sería sujeto (が) u objeto (を) se convierte en tema, は los sustituye: 本を読みます → 本は読みます (ese libro sí lo leo). Con verbos de estado como 好き・ある・わかる, el tema va con は y lo que gusta o existe con が: 私は犬が好きです. Detalle clave: un interrogativo (誰・何・どこ) nunca lleva は; la información nueva de la respuesta se marca con が (誰が来ましたか → ジョンが来ました). Y は repetido crea contraste: 日本語は話します (el japonés sí… [otros idiomas no]).",
    why: "Marca el TEMA de la oración: aquello de lo que vas a hablar ('en cuanto a…'). No es exactamente el sujeto, sino el marco de la frase. Se escribe は pero, como partícula, se pronuncia «wa».",
    whyEn: "It marks the TOPIC of the sentence: what you are going to talk about ('as for…'). It is not exactly the subject, but the frame of the sentence. It is written は but, as a particle, is pronounced “wa”.",
    whenToUse: [
      "Presentar de qué trata la frase: 私は学生です (En cuanto a mí, soy estudiante).",
      "Contrastar dos cosas: コーヒーは好きですが、お茶は好きじゃないです (El café sí me gusta, el té no).",
      "Hablar de información ya conocida por ambos.",
    ],
    whenToUseEn: [
      "Introduce what the sentence is about: 私は学生です (As for me, I'm a student).",
      "Contrast two things: コーヒーは好きですが、お茶は好きじゃないです (I like coffee, but not tea).",
      "Talk about information already known to both speakers.",
    ],
    mistakes: [
      "は vs が: は presenta el tema (información conocida); が marca un sujeto nuevo o lo enfatiza. «¿Quién vino?» → 私が来ました (が, respuesta nueva).",
      "Como partícula se pronuncia «wa», no «ha».",
    ],
    mistakesEn: [
      "は vs が: は introduces the topic (known info); が marks a new or emphasized subject. “Who came?” → 私が来ました (が, new answer).",
      "As a particle it is pronounced “wa”, not “ha”.",
    ],
    examples: [
      { jp: "私は田中です。", reading: "わたしはたなかです", meaning: "Yo soy Tanaka.", meaningEn: "I am Tanaka." },
      { jp: "これは本です。", reading: "これはほんです", meaning: "Esto es un libro.", meaningEn: "This is a book." },
      { jp: "田中さんは学生です。", reading: "たなかさんはがくせいです", meaning: "El Sr. Tanaka es estudiante.", meaningEn: "Mr. Tanaka is a student." },
      { jp: "今日は日曜日です。", reading: "きょうはにちようびです", meaning: "Hoy es domingo.", meaningEn: "Today is Sunday." },
    ],
  },
  が: {
    jp: "が",
    title: "La partícula が — el sujeto",
    nuance:
      "が presenta información NUEVA o la enfatiza: por eso responde a preguntas con 誰・何 (誰がしましたか → 私がしました). Es obligatoria con la existencia (あります・います), con gusto, habilidad y deseo (好き・上手・できる・ほしい) y con adjetivos de sensación, donde el español usaría un sujeto normal: 水がほしいです (quiero agua, lit. 'el agua es deseada'). En una frase, lo que va antes de が es el foco y lo de después el comentario. Además, が al unir dos oraciones significa 'pero': 高いですが、おいしいです (es caro, pero está rico).",
    why: "Marca el SUJETO gramatical, sobre todo cuando es información nueva o se quiere enfatizar, y con verbos/adjetivos de existencia, gusto y habilidad.",
    whyEn: "It marks the grammatical SUBJECT, especially when it's new information or emphasized, and with verbs/adjectives of existence, liking and ability.",
    whenToUse: [
      "Sujeto nuevo o enfatizado: 猫がいます (Hay un gato).",
      "Con 好き / 嫌い / 上手 / 下手: 日本語が好きです (Me gusta el japonés).",
      "Con あります / います (existir): お金があります (Tengo dinero).",
      "Cuando la respuesta es el sujeto: だれが来ますか (¿Quién viene?).",
    ],
    whenToUseEn: [
      "New or emphasized subject: 猫がいます (There is a cat).",
      "With 好き / 嫌い / 上手 / 下手: 日本語が好きです (I like Japanese).",
      "With あります / います (to exist): お金があります (I have money).",
      "When the answer is the subject: だれが来ますか (Who is coming?).",
    ],
    mistakes: [
      "Con 好き se usa が, no を: 〜が好きです (no 〜を好きです).",
      "は presenta el tema; が introduce o enfatiza el sujeto.",
    ],
    mistakesEn: [
      "With 好き use が, not を: 〜が好きです (not 〜を好きです).",
      "は introduces the topic; が introduces or emphasizes the subject.",
    ],
    examples: [
      { jp: "水が好きです。", reading: "みずがすきです", meaning: "Me gusta el agua.", meaningEn: "I like water." },
      { jp: "犬がいます。", reading: "いぬがいます", meaning: "Hay un perro.", meaningEn: "There is a dog." },
      { jp: "部屋に猫がいます。", reading: "へやにねこがいます", meaning: "Hay un gato en la habitación.", meaningEn: "There is a cat in the room." },
      { jp: "誰が来ましたか。", reading: "だれがきましたか", meaning: "¿Quién vino?", meaningEn: "Who came?" },
    ],
  },
  を: {
    jp: "を",
    title: "La partícula を — el objeto directo",
    nuance:
      "を marca el objeto directo (lo que recibe la acción), pero tiene un segundo uso importante: el lugar POR el que ocurre un movimiento con verbos de desplazamiento — 公園を散歩します (paseo por el parque), 道を渡ります (cruzo la calle), 家を出ます (salgo de casa). No lo confundas con で (lugar donde se hace algo). Los verbos intransitivos como 行きます・来ます・帰ります no llevan を: usan に o へ para el destino. Como partícula, を se pronuncia 'o'.",
    why: "Marca el OBJETO DIRECTO: la cosa que recibe la acción del verbo. Se escribe を y, como partícula, se pronuncia «o».",
    whyEn: "It marks the DIRECT OBJECT: the thing that receives the verb's action. It is written を and, as a particle, is pronounced “o”.",
    whenToUse: [
      "Lo que comes, bebes, ves, haces…: パンを食べます (Como pan).",
      "En peticiones: コーヒーをください (Un café, por favor).",
      "El lugar que se recorre con verbos de movimiento: 公園を散歩します (Paseo por el parque).",
    ],
    whenToUseEn: [
      "What you eat, drink, see, do…: パンを食べます (I eat bread).",
      "In requests: コーヒーをください (A coffee, please).",
      "The place you move through with motion verbs: 公園を散歩します (I stroll through the park).",
    ],
    mistakes: [
      "No se usa con 好き (eso lleva が).",
      "Para el destino de un movimiento se usa に/へ, no を.",
    ],
    mistakesEn: [
      "Not used with 好き (that takes が).",
      "For a movement's destination use に/へ, not を.",
    ],
    examples: [
      { jp: "ご飯を食べます。", reading: "ごはんをたべます", meaning: "Como (arroz/comida).", meaningEn: "I eat (rice/a meal)." },
      { jp: "水を飲みます。", reading: "みずをのみます", meaning: "Bebo agua.", meaningEn: "I drink water." },
      { jp: "本を読みます。", reading: "ほんをよみます", meaning: "Leo un libro.", meaningEn: "I read a book." },
      { jp: "音楽を聞きます。", reading: "おんがくをききます", meaning: "Escucho música.", meaningEn: "I listen to music." },
    ],
  },
  に: {
    jp: "に",
    title: "La partícula に — destino, tiempo y existencia",
    nuance:
      "に es la partícula más versátil de N5. Sus usos: destino (東京に行きます — aquí también vale へ), momento EXACTO en el tiempo (7時に, 月曜日に, 3月に), existencia o ubicación (公園に猫がいます), receptor de una acción (友達に電話します) y entrar/subir (部屋に入る, 電車に乗る). Regla del tiempo: llevan に las horas, fechas y días concretos, pero NO las palabras relativas como 今日・明日・毎日・今. Para frecuencia también se usa に: 週に3回 (tres veces por semana).",
    why: "Muy versátil: marca el destino de un movimiento, el momento exacto en el tiempo, el lugar donde algo EXISTE y el receptor de una acción.",
    whyEn: "Very versatile: it marks a movement's destination, an exact point in time, the place where something EXISTS, and the receiver of an action.",
    whenToUse: [
      "Destino: 学校に行きます (Voy a la escuela).",
      "Momento concreto (hora/fecha): 7時に起きます (Me levanto a las 7).",
      "Lugar donde algo existe (con あります/います): 部屋に猫がいます (Hay un gato en la habitación).",
      "Receptor: 友達にメールを送ります (Le mando un correo a un amigo).",
    ],
    whenToUseEn: [
      "Destination: 学校に行きます (I go to school).",
      "Specific time (hour/date): 7時に起きます (I get up at 7).",
      "Where something exists (with あります/います): 部屋に猫がいます (There's a cat in the room).",
      "Receiver: 友達にメールを送ります (I send an email to a friend).",
    ],
    mistakes: [
      "に (existencia/destino) vs で (acción): 図書館で勉強します (acción) pero 図書館にいます (existencia).",
      "Palabras como 今日 / 明日 no llevan に para la hora relativa.",
    ],
    mistakesEn: [
      "に (existence/destination) vs で (action): 図書館で勉強します (action) but 図書館にいます (existence).",
      "Words like 今日 / 明日 don't take に for relative time.",
    ],
    examples: [
      { jp: "日本に行きます。", reading: "にほんにいきます", meaning: "Voy a Japón.", meaningEn: "I'm going to Japan." },
      { jp: "8時に来ます。", reading: "はちじにきます", meaning: "Vengo a las 8.", meaningEn: "I'll come at 8." },
      { jp: "七時に起きます。", reading: "しちじにおきます", meaning: "Me levanto a las siete.", meaningEn: "I get up at seven." },
      { jp: "机の上に本があります。", reading: "つくえのうえにほんがあります", meaning: "Hay un libro sobre la mesa.", meaningEn: "There is a book on the desk." },
    ],
  },
  へ: {
    jp: "へ",
    title: "La partícula へ — la dirección",
    nuance:
      "へ marca la DIRECCIÓN hacia la que te mueves y, para un destino, es casi intercambiable con に: 東京へ行きます = 東京に行きます. Matiz: へ subraya el 'hacia' (el trayecto), に subraya el punto de llegada. Para existencia, tiempo o receptor solo sirve に, no へ. Como partícula, へ se pronuncia 'e', no 'he'. En cartas y sobres, へ es lo habitual tras el destinatario (田中さんへ).",
    why: "Marca la DIRECCIÓN hacia la que te mueves. Se escribe へ y, como partícula, se pronuncia «e». Es muy parecida a に para el destino, pero subraya el «hacia».",
    whyEn: "It marks the DIRECTION you move toward. It is written へ and, as a particle, is pronounced “e”. It's very close to に for a destination, but stresses the “toward”.",
    whenToUse: [
      "Con verbos de movimiento (行く, 来る, 帰る): 家へ帰ります (Regreso a casa).",
      "En la mayoría de casos cotidianos es intercambiable con に para el destino.",
    ],
    whenToUseEn: [
      "With motion verbs (行く, 来る, 帰る): 家へ帰ります (I go back home).",
      "In most everyday cases it's interchangeable with に for a destination.",
    ],
    mistakes: [
      "Como partícula se pronuncia «e», no «he».",
      "へ marca dirección, no el lugar donde algo existe (eso es に).",
    ],
    mistakesEn: [
      "As a particle it is pronounced “e”, not “he”.",
      "へ marks direction, not where something exists (that's に).",
    ],
    examples: [
      { jp: "学校へ行きます。", reading: "がっこうへいきます", meaning: "Voy hacia la escuela.", meaningEn: "I'm heading to school." },
      { jp: "日本へようこそ。", reading: "にほんへようこそ", meaning: "Bienvenido a Japón.", meaningEn: "Welcome to Japan." },
      { jp: "東京へ行きます。", reading: "とうきょうへいきます", meaning: "Voy a Tokio.", meaningEn: "I'm going to Tokyo." },
      { jp: "家へ帰ります。", reading: "いえへかえります", meaning: "Vuelvo a casa.", meaningEn: "I go home." },
    ],
  },
  で: {
    jp: "で",
    title: "La partícula で — lugar de la acción y medio",
    nuance:
      "で responde a 'dónde ocurre una ACCIÓN' (レストランで食べます), frente a に que marca dónde algo EXISTE (レストランにいます). Su otro gran uso es el MEDIO o instrumento: はしで食べます (como con palillos), 電車で行きます (voy en tren), 日本語で話します (hablo en japonés). También expresa causa (病気で休みます — falto por enfermedad) y cantidad total (全部で千円 — mil yenes en total). Truco: si puedes traducir 'en/con/por medio de', suele ser で; si es 'existir en un lugar', es に.",
    why: "Marca DÓNDE ocurre una acción, o el MEDIO/herramienta con el que se hace algo.",
    whyEn: "It marks WHERE an action happens, or the MEANS/tool used to do something.",
    whenToUse: [
      "Lugar donde realizas una acción: レストランで食べます (Como en un restaurante).",
      "Medio de transporte o herramienta: 電車で行きます (Voy en tren); 箸で食べます (Como con palillos).",
      "Material o idioma: 日本語で話します (Hablo en japonés).",
    ],
    whenToUseEn: [
      "Where you do an action: レストランで食べます (I eat at a restaurant).",
      "Means of transport or tool: 電車で行きます (I go by train); 箸で食べます (I eat with chopsticks).",
      "Material or language: 日本語で話します (I speak in Japanese).",
    ],
    mistakes: [
      "で (acción) vs に (existencia): 公園で遊びます (juego EN el parque) vs 公園にいます (estoy en el parque).",
    ],
    mistakesEn: [
      "で (action) vs に (existence): 公園で遊びます (I play IN the park) vs 公園にいます (I'm at the park).",
    ],
    examples: [
      { jp: "家で勉強します。", reading: "いえでべんきょうします", meaning: "Estudio en casa.", meaningEn: "I study at home." },
      { jp: "バスで行きます。", reading: "ばすでいきます", meaning: "Voy en autobús.", meaningEn: "I go by bus." },
      { jp: "レストランで昼ご飯を食べます。", reading: "レストランでひるごはんをたべます", meaning: "Almuerzo en un restaurante.", meaningEn: "I have lunch at a restaurant." },
      { jp: "電車で会社に行きます。", reading: "でんしゃでかいしゃにいきます", meaning: "Voy a la empresa en tren.", meaningEn: "I go to work by train." },
    ],
  },
  の: {
    jp: "の",
    title: "La partícula の — posesión y relación",
    nuance:
      "の tiene tres usos. (1) Posesión o relación 'B de A': 私の本, 日本語の先生, 東京の地図. (2) Nominalizador: convierte una frase en sustantivo — 食べるのが好きです (me gusta comer). (3) Sustituye a un sustantivo ya conocido: 赤いのをください (dame el rojo). Se pueden encadenar: 友達の車の色 (el color del coche de mi amigo). En preguntas informales, の al final suaviza el tono: どうしたの？ (¿qué pasó?).",
    why: "Une dos sustantivos indicando posesión o relación: «A の B» = «B de A».",
    whyEn: "It links two nouns showing possession or relation: “A の B” = “B of A”.",
    whenToUse: [
      "Posesión: 私の本 (mi libro).",
      "Origen/pertenencia: 日本の車 (un coche de Japón).",
      "Relación entre nombres: 日本語の先生 (profesor de japonés).",
    ],
    whenToUseEn: [
      "Possession: 私の本 (my book).",
      "Origin/belonging: 日本の車 (a car from Japan).",
      "Relation between nouns: 日本語の先生 (a teacher of Japanese).",
    ],
    mistakes: [
      "El orden es inverso al español: el poseedor va primero (私の本 = «libro de mí» → «mi libro»).",
      "No se usa の entre un adjetivo い y el nombre (高い山, no 高いの山).",
    ],
    mistakesEn: [
      "The order is reversed from English: the owner comes first (私の本 = “of-me book” → “my book”).",
      "Don't use の between an い-adjective and the noun (高い山, not 高いの山).",
    ],
    examples: [
      { jp: "友達の電話。", reading: "ともだちのでんわ", meaning: "El teléfono de un amigo.", meaningEn: "A friend's phone." },
      { jp: "これは私のかばんです。", reading: "これはわたしのかばんです", meaning: "Esta es mi bolsa.", meaningEn: "This is my bag." },
      { jp: "私の名前は田中です。", reading: "わたしのなまえはたなかです", meaning: "Mi nombre es Tanaka.", meaningEn: "My name is Tanaka." },
      { jp: "日本語の先生です。", reading: "にほんごのせんせいです", meaning: "Es profesor de japonés.", meaningEn: "He is a Japanese teacher." },
    ],
  },
  と: {
    jp: "と",
    title: "La partícula と — «y» / «con»",
    nuance:
      "と como 'y' une una lista COMPLETA y cerrada (パンと牛乳 = pan y leche, solo esos dos); si son ejemplos de una lista abierta, se usa や. と también significa 'con' (友達と行きます) y marca la cita de lo dicho o pensado (「はい」と言いました, 〜と思います). Importante: と no une frases enteras con 'y' — para encadenar acciones se usa la forma て (起きて、食べます), no と.",
    why: "Une sustantivos como «y» (lista completa), o marca con quién haces algo («con»).",
    whyEn: "It links nouns as “and” (a complete list), or marks who you do something with (“with”).",
    whenToUse: [
      "«Y» entre sustantivos (lista cerrada): パンと卵 (pan y huevo).",
      "«Con» (compañía): 友達と行きます (Voy con un amigo).",
    ],
    whenToUseEn: [
      "“And” between nouns (closed list): パンと卵 (bread and egg).",
      "“With” (company): 友達と行きます (I go with a friend).",
    ],
    mistakes: [
      "と enumera una lista COMPLETA; para «entre otros» se usa や.",
      "と (y) solo une sustantivos, no frases ni verbos.",
    ],
    mistakesEn: [
      "と lists a COMPLETE set; for “among others” use や.",
      "と (“and”) only links nouns, not clauses or verbs.",
    ],
    examples: [
      { jp: "犬と猫。", reading: "いぬとねこ", meaning: "Perro y gato.", meaningEn: "Dog and cat." },
      { jp: "家族と住んでいます。", reading: "かぞくとすんでいます", meaning: "Vivo con mi familia.", meaningEn: "I live with my family." },
      { jp: "友達と映画を見ます。", reading: "ともだちとえいがをみます", meaning: "Veo una película con un amigo.", meaningEn: "I watch a movie with a friend." },
      { jp: "パンと卵を買います。", reading: "パンとたまごをかいます", meaning: "Compro pan y huevos.", meaningEn: "I buy bread and eggs." },
    ],
  },
  か: {
    jp: "か",
    title: "La partícula か — la pregunta",
    nuance:
      "か al final convierte cualquier frase en pregunta sin cambiar el orden ni añadir '¿?': 学生です → 学生ですか. En japonés cortés no hace falta subir la entonación. Entre dos opciones significa 'o': コーヒーか お茶 (café o té). Con interrogativos forma indefinidos: 誰か (alguien), 何か (algo), どこか (en algún lugar). En habla muy casual se omite か y solo se sube el tono (元気？).",
    why: "Convierte la frase en PREGUNTA. Se añade al final; en japonés no hace falta el signo «¿?».",
    whyEn: "It turns the sentence into a QUESTION. Add it at the end; Japanese doesn't need a “?” mark.",
    whenToUse: [
      "Preguntas de sí/no: 学生ですか (¿Eres estudiante?).",
      "Con interrogativos: 何ですか (¿Qué es?), どこですか (¿Dónde está?).",
    ],
    whenToUseEn: [
      "Yes/no questions: 学生ですか (Are you a student?).",
      "With question words: 何ですか (What is it?), どこですか (Where is it?).",
    ],
    mistakes: [
      "か ya marca la pregunta; no hace falta exagerar la entonación.",
      "No olvides です antes de か con nombres y adjetivos: 元気ですか.",
    ],
    mistakesEn: [
      "か already marks the question; no need to exaggerate the intonation.",
      "Don't forget です before か with nouns and adjectives: 元気ですか.",
    ],
    examples: [
      { jp: "お元気ですか。", reading: "おげんきですか", meaning: "¿Cómo estás?", meaningEn: "How are you?" },
      { jp: "これは何ですか。", reading: "これはなんですか", meaning: "¿Qué es esto?", meaningEn: "What is this?" },
      { jp: "コーヒーを飲みますか。", reading: "コーヒーをのみますか", meaning: "¿Bebes café?", meaningEn: "Do you drink coffee?" },
      { jp: "学生ですか。", reading: "がくせいですか", meaning: "¿Eres estudiante?", meaningEn: "Are you a student?" },
    ],
  },
  です: {
    jp: "です",
    title: "です — la cópula (ser/estar)",
    nuance:
      "です es la cópula cortés ('ser/estar') y también da cortesía a los adjetivos. Su pasado es でした, su negativo じゃありません (o el más formal ではありません) y el negativo pasado じゃありませんでした. Detalle crítico: con adjetivos い NO se conjuga です — el adjetivo mismo cambia (高いです → 高かったです, nunca 高いでした). です no aporta acción, solo enlaza sujeto y predicado. Su versión casual es だ (学生だ).",
    why: "Es la cópula cortés: equivale a «ser/estar». Afirma qué es algo y da un tono educado.",
    whyEn: "It's the polite copula: it means “to be”. It states what something is and adds a polite tone.",
    whenToUse: [
      "Con sustantivos: 学生です (Soy estudiante).",
      "Con adjetivos: 高いです (Es caro); きれいです (Es bonito).",
      "Negativo: 〜じゃないです / 〜ではありません.",
    ],
    whenToUseEn: [
      "With nouns: 学生です (I'm a student).",
      "With adjectives: 高いです (It's expensive); きれいです (It's pretty).",
      "Negative: 〜じゃないです / 〜ではありません.",
    ],
    mistakes: [
      "No se pone con verbos: se dice 食べます, no 食べるです.",
      "El pasado es でした (era/fue), no «です + た».",
    ],
    mistakesEn: [
      "Not used with verbs: say 食べます, not 食べるです.",
      "The past is でした (was), not “です + た”.",
    ],
    examples: [
      { jp: "私は先生です。", reading: "わたしはせんせいです", meaning: "Soy profesor.", meaningEn: "I am a teacher." },
      { jp: "今日は寒いです。", reading: "きょうはさむいです", meaning: "Hoy hace frío.", meaningEn: "It's cold today." },
      { jp: "あの人は先生です。", reading: "あのひとはせんせいです", meaning: "Aquella persona es profesor.", meaningEn: "That person is a teacher." },
      { jp: "これは私のかばんです。", reading: "これはわたしのかばんです", meaning: "Esto es mi bolso.", meaningEn: "This is my bag." },
    ],
  },
  "adj-i": {
    jp: "い",
    title: "Adjetivos い",
    nuance:
      "Los adjetivos い se conjugan SOLOS, sin usar です para el tiempo: presente 高い, pasado 高かった, negativo 高くない, negativo pasado 高くなかった; luego se añade です para cortesía (高かったです). Excepción muy importante: いい (bueno) se conjuga a partir de よい → よかった, よくない (nunca いかった). Antes de un sustantivo van directos: 高い車. Para unir dos adjetivos い se usa la forma くて: 安くておいしい (barato y rico).",
    why: "Los adjetivos terminados en い describen y pueden ir directos antes del nombre o al final de la frase con です.",
    whyEn: "Adjectives ending in い describe things and can go directly before the noun or at the end of the sentence with です.",
    whenToUse: [
      "Antes del sustantivo, sin の: 高い山 (montaña alta).",
      "Al final con です: この山は高いです (Esta montaña es alta).",
      "Negativo: い → くない (高くないです = no es caro).",
    ],
    whenToUseEn: [
      "Before the noun, no の: 高い山 (a tall mountain).",
      "At the end with です: この山は高いです (This mountain is tall).",
      "Negative: い → くない (高くないです = it's not expensive).",
    ],
    mistakes: [
      "No pongas の entre el adjetivo い y el nombre (高い山, no 高いの山).",
      "Para el negativo cambia い→くない, no añadas じゃない (高くない, no 高いじゃない).",
    ],
    mistakesEn: [
      "Don't put の between the い-adjective and the noun (高い山, not 高いの山).",
      "For the negative change い→くない, don't add じゃない (高くない, not 高いじゃない).",
    ],
    examples: [
      { jp: "新しい車。", reading: "あたらしいくるま", meaning: "Coche nuevo.", meaningEn: "A new car." },
      { jp: "このパンは安いです。", reading: "このぱんはやすいです", meaning: "Este pan es barato.", meaningEn: "This bread is cheap." },
      { jp: "この映画は面白いです。", reading: "このえいがはおもしろいです", meaning: "Esta película es interesante.", meaningEn: "This movie is interesting." },
      { jp: "今日は天気がいいです。", reading: "きょうはてんきがいいです", meaning: "Hoy hace buen tiempo.", meaningEn: "The weather is nice today." },
    ],
  },
  ます: {
    jp: "ます",
    title: "Verbos en ます — presente, pasado y negativo",
    nuance:
      "La forma ます da los cuatro tiempos básicos: presente/futuro 食べます, pasado 食べました, negativo 食べません, negativo pasado 食べませんでした. El presente cubre también el futuro y los hábitos (毎日 食べます). ます es el registro CORTÉS (con desconocidos, en el trabajo); su equivalente casual es la forma diccionario/informal. Para pedir algo educadamente NO se usa ます sino la forma て + ください. La raíz ます (食べ〜) sirve para formar muchas estructuras: 〜たい (querer), 〜ながら (mientras), 〜ましょう (hagamos).",
    why: "La forma ます es la forma cortés del verbo, la que más usarás al empezar. Con ella formas los cuatro tiempos básicos: presente/futuro (ます), pasado (ました), negativo (ません) y pasado negativo (ませんでした).",
    whyEn: "The ます form is the polite verb form, the one you'll use most as a beginner. With it you build the four basic tenses: present/future (ます), past (ました), negative (ません) and past negative (ませんでした).",
    whenToUse: [
      "Presente/futuro: 食べます (como / comeré).",
      "Pasado: 食べました (comí).",
      "Negativo: 食べません (no como).",
      "Pasado negativo: 食べませんでした (no comí).",
    ],
    whenToUseEn: [
      "Present/future: 食べます (I eat / will eat).",
      "Past: 食べました (I ate).",
      "Negative: 食べません (I don't eat).",
      "Past negative: 食べませんでした (I didn't eat).",
    ],
    mistakes: [
      "El pasado negativo es ませんでした, no «ませんです».",
      "La terminación no cambia con la persona: 私も彼も食べます (igual para todos).",
    ],
    mistakesEn: [
      "The past negative is ませんでした, not “ませんです”.",
      "The ending doesn't change with the person: 私も彼も食べます (same for everyone).",
    ],
    examples: [
      { jp: "昨日、寿司を食べました。", reading: "きのう、すしをたべました", meaning: "Ayer comí sushi.", meaningEn: "Yesterday I ate sushi." },
      { jp: "今日は行きません。", reading: "きょうはいきません", meaning: "Hoy no voy.", meaningEn: "I'm not going today." },
      { jp: "毎日日本語を勉強します。", reading: "まいにちにほんごをべんきょうします", meaning: "Estudio japonés todos los días.", meaningEn: "I study Japanese every day." },
      { jp: "週末は働きません。", reading: "しゅうまつははたらきません", meaning: "Los fines de semana no trabajo.", meaningEn: "I don't work on weekends." },
    ],
  },
  て: {
    jp: "て",
    title: "La forma て — encadenar y pedir",
    nuance:
      "La forma て no tiene tiempo propio: hereda el tiempo del verbo final de la frase. Usos clave en N5: encadenar acciones en orden (起きて、食べて、行きます), pedir de forma cortés (見てください), acción en curso o estado (〜ています = estar haciendo, o resultado: 結婚しています = estar casado) y permiso (〜てもいいです). Su formación depende del grupo del verbo: う・つ・る→って, む・ぶ・ぬ→んで, く→いて, ぐ→いで, す→して; する→して, 来る→来て. Irregular: 行く→行って.",
    why: "La forma て conecta acciones y sirve para pedir cosas con 〜てください («por favor, haz…») y para acciones en curso con 〜ています («estar haciendo»).",
    whyEn: "The て-form links actions and is used to make requests with 〜てください (“please do…”) and ongoing actions with 〜ています (“to be doing”).",
    whenToUse: [
      "Pedir con cortesía: 待ってください (Espere, por favor).",
      "Acción en curso: 食べています (Estoy comiendo).",
      "Encadenar acciones: 起きて、食べて、行きます (Me levanto, como y voy).",
    ],
    whenToUseEn: [
      "Polite request: 待ってください (Please wait).",
      "Ongoing action: 食べています (I'm eating).",
      "Chain actions: 起きて、食べて、行きます (I get up, eat and go).",
    ],
    mistakes: [
      "La forma て depende del verbo (食べる→食べて, 行く→行って, 飲む→飲んで); hay que aprender los grupos.",
      "〜てください es una petición cortés, no una orden brusca.",
    ],
    mistakesEn: [
      "The て-form depends on the verb (食べる→食べて, 行く→行って, 飲む→飲んで); you learn the groups.",
      "〜てください is a polite request, not a blunt command.",
    ],
    examples: [
      { jp: "ちょっと待ってください。", reading: "ちょっとまってください", meaning: "Espere un momento, por favor.", meaningEn: "Please wait a moment." },
      { jp: "今、勉強しています。", reading: "いま、べんきょうしています", meaning: "Ahora estoy estudiando.", meaningEn: "I'm studying now." },
      { jp: "ドアを開けてください。", reading: "ドアをあけてください", meaning: "Abre la puerta, por favor.", meaningEn: "Please open the door." },
      { jp: "朝起きて、コーヒーを飲みます。", reading: "あさおきて、コーヒーをのみます", meaning: "Me levanto y bebo café.", meaningEn: "I get up and drink coffee." },
    ],
  },
  "adj-na": {
    jp: "な",
    title: "Adjetivos な",
    nuance:
      "Los adjetivos な se comportan como sustantivos: para el tiempo usan です・でした・じゃありません (きれいです → きれいでした → きれいじゃありません), nunca se conjugan solos. Antes de un sustantivo necesitan な: きれいな花, 静かな部屋 (de ahí su nombre). Para unir dos se usa で: きれいで静かです. Cuidado con las trampas: きれい (bonito) y 有名 (famoso) terminan en い pero son な-adjetivos; 嫌い (odiar) también es な.",
    why: "Los adjetivos な describen igual que los い, pero necesitan な para ir antes del nombre y usan です al final sin cambiar su forma.",
    whyEn: "な-adjectives describe just like い-adjectives, but they need な before a noun and use です at the end without changing form.",
    whenToUse: [
      "Antes del nombre, con な: きれいな花 (una flor bonita).",
      "Al final, con です: この町は静かです (Este pueblo es tranquilo).",
      "Negativo: 〜じゃないです (静かじゃないです = no es tranquilo).",
    ],
    whenToUseEn: [
      "Before a noun, with な: きれいな花 (a beautiful flower).",
      "At the end, with です: この町は静かです (This town is quiet).",
      "Negative: 〜じゃないです (静かじゃないです = it's not quiet).",
    ],
    mistakes: [
      "Necesitan な antes del nombre (きれいな人), a diferencia de los adjetivos い.",
      "En negativo usan じゃない, no くない (静かじゃない, no 静かくない).",
    ],
    mistakesEn: [
      "They need な before a noun (きれいな人), unlike い-adjectives.",
      "The negative uses じゃない, not くない (静かじゃない, not 静かくない).",
    ],
    examples: [
      { jp: "有名なレストラン。", reading: "ゆうめいなレストラン", meaning: "Un restaurante famoso.", meaningEn: "A famous restaurant." },
      { jp: "日本語は便利です。", reading: "にほんごはべんりです", meaning: "El japonés es útil.", meaningEn: "Japanese is useful." },
      { jp: "ここは静かです。", reading: "ここはしずかです", meaning: "Aquí es tranquilo.", meaningEn: "It's quiet here." },
      { jp: "彼は親切な人です。", reading: "かれはしんせつなひとです", meaning: "Él es una persona amable.", meaningEn: "He is a kind person." },
    ],
  },
  これ: {
    jp: "これ",
    title: "これ・それ・あれ — esto, eso, aquello",
    nuance:
      "El sistema こ・そ・あ・ど se basa en la proximidad: こ (cerca de quien habla), そ (cerca del oyente), あ (lejos de ambos), ど (pregunta). Distingue las series: これ/それ/あれ (cosas, 'esto'), この/その/あの + sustantivo ('este libro'), ここ/そこ/あそこ (lugares, 'aquí'), こちら/そちら/あちら (dirección, y versión más cortés). Error típico: これ本 ✗ → この本 ○ — これ va solo, この acompaña a un sustantivo.",
    why: "Señalan cosas según la distancia: これ (cerca de mí), それ (cerca de ti), あれ (lejos de ambos). Para preguntar «cuál» se usa どれ.",
    whyEn: "They point at things by distance: これ (near me), それ (near you), あれ (far from both). To ask “which one” use どれ.",
    whenToUse: [
      "これ = esto (junto a mí): これは本です (Esto es un libro).",
      "それ = eso (junto a ti): それは何ですか (¿Qué es eso?).",
      "あれ = aquello (lejos): あれは駅です (Aquello es la estación).",
    ],
    whenToUseEn: [
      "これ = this (by me): これは本です (This is a book).",
      "それ = that (by you): それは何ですか (What is that?).",
      "あれ = that over there (far): あれは駅です (That's the station).",
    ],
    mistakes: [
      "これ/それ/あれ van solos (son pronombres). Antes de un nombre se usa この/その/あの: この本 (este libro).",
    ],
    mistakesEn: [
      "これ/それ/あれ stand alone (pronouns). Before a noun use この/その/あの: この本 (this book).",
    ],
    examples: [
      { jp: "これはいくらですか。", reading: "これはいくらですか", meaning: "¿Cuánto cuesta esto?", meaningEn: "How much is this?" },
      { jp: "あれは私の車です。", reading: "あれはわたしのくるまです", meaning: "Aquello es mi coche.", meaningEn: "That is my car." },
      { jp: "これは何ですか。", reading: "これはなんですか", meaning: "¿Qué es esto?", meaningEn: "What is this?" },
      { jp: "それをください。", reading: "それをください", meaning: "Deme eso, por favor.", meaningEn: "That one, please." },
    ],
  },
  から: {
    jp: "から",
    title: "から〜まで — desde… hasta…",
    nuance:
      "から marca el INICIO (desde) y まで el FIN (hasta), tanto en tiempo como en espacio: 9時から5時まで, 東京から大阪まで. No hace falta usarlos juntos. から tiene un segundo uso muy común: 'porque', al final de la razón — 高いから、買いません (no lo compro porque es caro). まで significa 'hasta (incluido)'; para un plazo límite ('para antes de') se usa までに: 5時までに来てください.",
    why: "から marca el inicio («desde») y まで el final («hasta»), tanto en tiempo como en lugar. から también significa «porque» al final de una frase.",
    whyEn: "から marks the start (“from”) and まで the end (“until”), for both time and place. から also means “because” at the end of a clause.",
    whenToUse: [
      "Tiempo: 9時から5時まで働きます (Trabajo de 9 a 5).",
      "Lugar: 東京から大阪まで (De Tokio a Osaka).",
      "Razón (から al final): 高いですから、買いません (No lo compro porque es caro).",
    ],
    whenToUseEn: [
      "Time: 9時から5時まで働きます (I work from 9 to 5).",
      "Place: 東京から大阪まで (From Tokyo to Osaka).",
      "Reason (から at the end): 高いですから、買いません (I won't buy it because it's expensive).",
    ],
    mistakes: [
      "から = desde/porque; para «hasta» usa まで.",
      "Como «porque», から va después de la razón, no antes.",
    ],
    mistakesEn: [
      "から = from/because; for “until” use まで.",
      "As “because”, から comes after the reason, not before.",
    ],
    examples: [
      { jp: "月曜日から金曜日まで。", reading: "げつようびからきんようびまで", meaning: "De lunes a viernes.", meaningEn: "From Monday to Friday." },
      { jp: "ここから駅まで遠いです。", reading: "ここからえきまでとおいです", meaning: "De aquí a la estación es lejos.", meaningEn: "It's far from here to the station." },
      { jp: "九時から五時まで働きます。", reading: "くじからごじまではたらきます", meaning: "Trabajo de nueve a cinco.", meaningEn: "I work from nine to five." },
      { jp: "家から駅まで歩きます。", reading: "いえからえきまであるきます", meaning: "Camino de casa a la estación.", meaningEn: "I walk from home to the station." },
    ],
  },
  も: {
    jp: "も",
    title: "La partícula も — «también»",
    nuance:
      "も significa 'también/tampoco' y SUSTITUYE a は・が・を (nunca se combinan): 私も学生です (yo también soy estudiante). Repetida hace listas 'tanto… como…': パンも牛乳も買います. Con verbo negativo significa 'ni… ni…' o 'nada/nadie': 何も食べません (no como nada), 誰も来ません (no viene nadie). Con números refuerza 'ni siquiera': 一人も来ませんでした (no vino ni una persona).",
    why: "も sustituye a は/が para decir «también» (o «tampoco» en negativo). Marca que algo se añade a lo ya dicho.",
    whyEn: "も replaces は/が to say “also/too” (or “neither” in the negative). It marks that something is added to what was already said.",
    whenToUse: [
      "«También»: 私も学生です (Yo también soy estudiante).",
      "«Tampoco» (con negativo): 私も行きません (Yo tampoco voy).",
      "«Ni… ni…»: コーヒーもお茶も飲みません (No bebo ni café ni té).",
    ],
    whenToUseEn: [
      "“Also”: 私も学生です (I'm a student too).",
      "“Neither” (with negative): 私も行きません (I'm not going either).",
      "“Neither… nor…”: コーヒーもお茶も飲みません (I drink neither coffee nor tea).",
    ],
    mistakes: [
      "も reemplaza a は/が, no se suman: 私も (no 私はも).",
    ],
    mistakesEn: [
      "も replaces は/が, they aren't combined: 私も (not 私はも).",
    ],
    examples: [
      { jp: "田中さんも来ます。", reading: "たなかさんもきます", meaning: "El Sr. Tanaka también viene.", meaningEn: "Mr. Tanaka is coming too." },
      { jp: "これもください。", reading: "これもください", meaning: "Deme esto también.", meaningEn: "This one too, please." },
      { jp: "私も学生です。", reading: "わたしもがくせいです", meaning: "Yo también soy estudiante.", meaningEn: "I'm a student too." },
      { jp: "お茶もお願いします。", reading: "おちゃもおねがいします", meaning: "También un té, por favor.", meaningEn: "Tea too, please." },
    ],
  },

  // ===== N4 =====
  jisho: {
    jp: "辞書形",
    title: "La forma diccionario (辞書形)",
    nuance:
      "La forma diccionario es la forma BASE del verbo (食べる, 飲む, する, 来る): la que aparece en el diccionario y la base del registro casual. Grupos: ichidan (verbos る, quitan る: 食べる→食べます), godan (verbos う, cambian la última sílaba う→い: 飲む→飲みます) y los dos irregulares する→します, 来る→来ます. Es imprescindible porque muchísimas estructuras se pegan a ella: 〜ことができる, 〜前に, 〜つもり, o 辞書形＋な (prohibición). El reto es distinguir ichidan de godan: 見る・寝る son ichidan, pero 帰る・入る parecen ichidan y en realidad son godan (excepciones que hay que memorizar).",
    why: "Es la forma base e informal del verbo (la que aparece en el diccionario). De ella se construyen casi todas las demás formas. 食べます→食べる, 行きます→行く, します→する.",
    whyEn: "It's the verb's base, informal form (the one in the dictionary). Almost every other form is built from it. 食べます→食べる, 行きます→行く, します→する.",
    whenToUse: [
      "Hablar de forma casual con amigos: 何を食べる？ (¿Qué vas a comer?).",
      "Como base de otras estructuras: 〜つもり, 〜と思う, 〜ことができる.",
      "En diccionarios y listas de verbos.",
    ],
    whenToUseEn: [
      "Casual speech with friends: 何を食べる？ (What are you going to eat?).",
      "As the base for other structures: 〜つもり, 〜と思う, 〜ことができる.",
      "In dictionaries and verb lists.",
    ],
    mistakes: [
      "Los verbos se dividen en grupos (る-verbs, う-verbs, irregulares する/来る); la conjugación depende del grupo.",
      "La forma cortés ます es más segura con desconocidos; la diccionario suena informal.",
    ],
    mistakesEn: [
      "Verbs fall into groups (る-verbs, う-verbs, irregular する/来る); conjugation depends on the group.",
      "The polite ます form is safer with strangers; the dictionary form sounds informal.",
    ],
    examples: [
      { jp: "毎朝コーヒーを飲む。", reading: "まいあさコーヒーをのむ", meaning: "Bebo café cada mañana.", meaningEn: "I drink coffee every morning." },
      { jp: "日本語を話す。", reading: "にほんごをはなす", meaning: "Hablo japonés.", meaningEn: "I speak Japanese." },
      { jp: "私はテレビを見る。", reading: "わたしはテレビをみる", meaning: "Yo veo la tele.", meaningEn: "I watch TV." },
      { jp: "毎日、本を読む。", reading: "まいにち、ほんをよむ", meaning: "Leo un libro todos los días.", meaningEn: "I read a book every day." },
    ],
  },
  "ta-form": {
    jp: "た形",
    title: "El pasado informal (た形)",
    nuance:
      "El pasado informal (た形) se forma igual que la forma て pero con た/だ en lugar de て/で: 食べて→食べた, 飲んで→飲んだ, 行って→行った. Es el pasado CASUAL (con amigos y familia); su versión cortés es ました. Sirve de base para muchas estructuras clave: 〜たり〜たり (hacer cosas como…), 〜たことがある (haber hecho alguna vez), 〜たほうがいい (más vale que…) y 〜たら (condicional). Sigue las mismas reglas de grupo que て, incluida la irregularidad 行く→行った.",
    why: "La forma た es el pasado informal; equivale al pasado cortés 〜ました. 食べた (comí), 行った (fui), した (hice), 来た (vine).",
    whyEn: "The た-form is the informal past; it matches the polite past 〜ました. 食べた (ate), 行った (went), した (did), 来た (came).",
    whenToUse: [
      "Pasado casual: 昨日、映画を見た (Ayer vi una película).",
      "Base de estructuras: 〜たことがある (haber hecho), 〜たら (si/cuando).",
    ],
    whenToUseEn: [
      "Casual past: 昨日、映画を見た (Yesterday I watched a movie).",
      "Base for structures: 〜たことがある (to have done), 〜たら (if/when).",
    ],
    mistakes: [
      "Sigue las mismas reglas de grupo que la forma て (行く→行った, 飲む→飲んだ).",
      "Irregulares: する→した, 来る→来た.",
    ],
    mistakesEn: [
      "It follows the same group rules as the て-form (行く→行った, 飲む→飲んだ).",
      "Irregulars: する→した, 来る→来た.",
    ],
    examples: [
      { jp: "週末、友達に会った。", reading: "しゅうまつ、ともだちにあった", meaning: "El fin de semana vi a un amigo.", meaningEn: "I met a friend on the weekend." },
      { jp: "もう昼ご飯を食べた。", reading: "もうひるごはんをたべた", meaning: "Ya comí (el almuerzo).", meaningEn: "I already ate lunch." },
      { jp: "昨日、映画を見た。", reading: "きのう、えいがをみた", meaning: "Ayer vi una película.", meaningEn: "Yesterday I watched a movie." },
      { jp: "朝ご飯を食べた。", reading: "あさごはんをたべた", meaning: "Desayuné.", meaningEn: "I ate breakfast." },
    ],
  },
  tai: {
    jp: "〜たい",
    title: "〜たい — querer hacer algo",
    nuance:
      "〜たい expresa el DESEO de quien habla: se pega a la raíz ます del verbo (食べます→食べたい, 行きます→行きたい). Se conjuga como un adjetivo い: 食べたくない (no quiero), 食べたかった (quería). Con たい, el objeto puede llevar が en lugar de を: 水が飲みたい. Detalle importante: no se usa たい para el deseo de OTRA persona (para eso está 〜たがっている), y preguntar 〜たいですか a un superior puede sonar brusco. Para querer una COSA (no una acción) se usa ほしい, no たい.",
    why: "Para decir que QUIERES hacer algo, quita ます del verbo y añade たい. 食べます→食べたい (quiero comer). Se conjuga como un adjetivo い (食べたくない = no quiero comer).",
    whyEn: "To say you WANT to do something, drop ます and add たい. 食べます→食べたい (I want to eat). It conjugates like an い-adjective (食べたくない = I don't want to eat).",
    whenToUse: [
      "Expresar tu deseo: 日本へ行きたいです (Quiero ir a Japón).",
      "El objeto puede llevar が o を: 水が飲みたい / 水を飲みたい.",
    ],
    whenToUseEn: [
      "Express your wish: 日本へ行きたいです (I want to go to Japan).",
      "The object may take が or を: 水が飲みたい / 水を飲みたい.",
    ],
    mistakes: [
      "〜たい es para TU deseo (o preguntar el del oyente); para el de otros se usa 〜たがっている.",
      "Negativo: 〜たくない, no 〜たいじゃない.",
    ],
    mistakesEn: [
      "〜たい is for YOUR wish (or asking the listener's); for others use 〜たがっている.",
      "Negative: 〜たくない, not 〜たいじゃない.",
    ],
    examples: [
      { jp: "温泉に入りたいです。", reading: "おんせんにはいりたいです", meaning: "Quiero entrar a un onsen.", meaningEn: "I want to get into a hot spring." },
      { jp: "今日は何もしたくない。", reading: "きょうはなにもしたくない", meaning: "Hoy no quiero hacer nada.", meaningEn: "I don't want to do anything today." },
      { jp: "日本へ行きたいです。", reading: "にほんへいきたいです", meaning: "Quiero ir a Japón.", meaningEn: "I want to go to Japan." },
      { jp: "水が飲みたいです。", reading: "みずがのみたいです", meaning: "Quiero beber agua.", meaningEn: "I want to drink water." },
    ],
  },
  tsumori: {
    jp: "つもり",
    title: "〜つもりです — intención / plan",
    nuance:
      "〜つもりです expresa una INTENCIÓN o plan firme decidido de antemano: se pega a la forma diccionario (行くつもりです = tengo la intención de ir). El negativo tiene dos formas con matiz distinto: 行かないつもりです (tengo la intención de NO ir) frente a 行くつもりはありません (no tengo ninguna intención de ir, más tajante). Se diferencia de 〜ようと思う (decisión más del momento) y de 〜予定 (plan objetivo ya fijado, como un horario). No se usa para cosas fuera de tu control.",
    why: "La forma diccionario + つもりです expresa un plan o intención firme. 日本に行くつもりです (Pienso ir a Japón). Negativo: 〜ないつもりです.",
    whyEn: "Dictionary form + つもりです expresses a firm plan or intention. 日本に行くつもりです (I plan to go to Japan). Negative: 〜ないつもりです.",
    whenToUse: [
      "Planes personales: 週末に勉強するつもりです (Pienso estudiar el fin de semana).",
      "Negar una intención: たばこを吸わないつもりです (No pienso fumar).",
    ],
    whenToUseEn: [
      "Personal plans: 週末に勉強するつもりです (I plan to study on the weekend).",
      "Deny an intention: たばこを吸わないつもりです (I don't intend to smoke).",
    ],
    mistakes: [
      "つもり va con la forma diccionario (行くつもり), no con ます (行きますつもり ✗).",
    ],
    mistakesEn: [
      "つもり takes the dictionary form (行くつもり), not ます (行きますつもり ✗).",
    ],
    examples: [
      { jp: "来月、車を買うつもりです。", reading: "らいげつ、くるまをかうつもりです", meaning: "El mes que viene pienso comprar un coche.", meaningEn: "I plan to buy a car next month." },
      { jp: "今日は早く寝るつもりです。", reading: "きょうははやくねるつもりです", meaning: "Hoy pienso dormir temprano.", meaningEn: "I plan to sleep early today." },
      { jp: "週末は勉強するつもりです。", reading: "しゅうまつはべんきょうするつもりです", meaning: "Pienso estudiar el fin de semana.", meaningEn: "I plan to study this weekend." },
      { jp: "明日は行かないつもりです。", reading: "あしたはいかないつもりです", meaning: "No pienso ir mañana.", meaningEn: "I don't plan to go tomorrow." },
    ],
  },
  temoii: {
    jp: "〜てもいい",
    title: "〜てもいい — permiso (y prohibición)",
    nuance:
      "〜てもいいです da o pide PERMISO ('puedes / se puede'): forma て + もいい (見てもいいですか = ¿puedo mirar?). Su opuesto, la PROHIBICIÓN, es 〜てはいけません ('no debes'): ここで食べてはいけません. En habla casual, てはいけない se contrae a 〜ちゃいけない o 〜ちゃだめ. Para conceder permiso se responde どうぞ o はい、いいです; para negarlo, いいえ、だめです. Relacionado: 〜なくてもいいです significa 'no hace falta que…'.",
    why: "La forma て + もいいです pide o da permiso («¿puedo…? / puedes…»). Para PROHIBIR se usa 〜てはいけません («no se debe»).",
    whyEn: "The て-form + もいいです asks or gives permission (“may I…? / you may…”). To FORBID, use 〜てはいけません (“must not”).",
    whenToUse: [
      "Pedir permiso: 入ってもいいですか (¿Puedo entrar?).",
      "Dar permiso: 座ってもいいですよ (Puedes sentarte).",
      "Prohibir: ここで写真を撮ってはいけません (Aquí no se pueden tomar fotos).",
    ],
    whenToUseEn: [
      "Ask permission: 入ってもいいですか (May I come in?).",
      "Give permission: 座ってもいいですよ (You may sit down).",
      "Forbid: ここで写真を撮ってはいけません (You can't take photos here).",
    ],
    mistakes: [
      "El permiso usa la forma て (食べてもいい), no la diccionario.",
      "はいけません es prohibición fuerte; para «mejor no» se usa 〜ないほうがいい.",
    ],
    mistakesEn: [
      "Permission uses the て-form (食べてもいい), not the dictionary form.",
      "はいけません is a strong prohibition; for “better not” use 〜ないほうがいい.",
    ],
    examples: [
      { jp: "トイレを使ってもいいですか。", reading: "トイレをつかってもいいですか", meaning: "¿Puedo usar el baño?", meaningEn: "May I use the restroom?" },
      { jp: "ここに入ってはいけません。", reading: "ここにはいってはいけません", meaning: "No se puede entrar aquí.", meaningEn: "You must not enter here." },
      { jp: "写真を撮ってもいいですか。", reading: "しゃしんをとってもいいですか", meaning: "¿Puedo tomar fotos?", meaningEn: "May I take photos?" },
      { jp: "ここで食べてもいいです。", reading: "ここでたべてもいいです", meaning: "Puedes comer aquí.", meaningEn: "You may eat here." },
    ],
  },
  nakereba: {
    jp: "〜なければ",
    title: "〜なければなりません — obligación",
    nuance:
      "〜なければなりません expresa OBLIGACIÓN ('tener que / deber'): se forma con la base negativa ない → なければ + なりません (行かなければなりません = tengo que ir). Es largo, por eso en el habla real se contrae muchísimo: 〜なきゃ(いけない), 〜ないと. Existe la variante 〜なくてはいけません con el mismo significado. Su 'opuesto' (no hace falta) es 〜なくてもいいです. Literalmente significa 'si no lo hago, no sirve', de ahí ese doble negativo tan característico.",
    why: "Expresa OBLIGACIÓN («tener que»). Se forma con la raíz negativa del verbo + なければなりません. 行く→行かなければなりません (tengo que ir). Coloquial: 〜なきゃ.",
    whyEn: "Expresses OBLIGATION (“have to”). Formed from the verb's negative stem + なければなりません. 行く→行かなければなりません (I have to go). Casual: 〜なきゃ.",
    whenToUse: [
      "Obligaciones: 薬を飲まなければなりません (Tengo que tomar la medicina).",
      "Coloquial: もう行かなきゃ (Ya me tengo que ir).",
    ],
    whenToUseEn: [
      "Obligations: 薬を飲まなければなりません (I have to take the medicine).",
      "Casual: もう行かなきゃ (I've got to go now).",
    ],
    mistakes: [
      "Se parte de la forma ない: 行かない→行かなければ.",
      "Irregulares: する→しなければ, 来る→こなければ.",
    ],
    mistakesEn: [
      "It starts from the ない form: 行かない→行かなければ.",
      "Irregulars: する→しなければ, 来る→こなければ.",
    ],
    examples: [
      { jp: "明日、早く起きなければなりません。", reading: "あした、はやくおきなければなりません", meaning: "Mañana tengo que levantarme temprano.", meaningEn: "I have to get up early tomorrow." },
      { jp: "レポートを書かなければなりません。", reading: "レポートをかかなければなりません", meaning: "Tengo que escribir el reporte.", meaningEn: "I have to write the report." },
      { jp: "薬を飲まなければなりません。", reading: "くすりをのまなければなりません", meaning: "Tengo que tomar la medicina.", meaningEn: "I have to take medicine." },
      { jp: "毎日勉強しなければなりません。", reading: "まいにちべんきょうしなければなりません", meaning: "Tengo que estudiar todos los días.", meaningEn: "I have to study every day." },
    ],
  },
  yori: {
    jp: "〜より",
    title: "〜より〜のほうが — comparar",
    nuance:
      "Para COMPARAR dos cosas: 「Aより Bのほうが〜」 = 'B es más ~ que A'. より marca la referencia (lo que 'pierde') y のほうが marca lo que gana: 電車より車のほうが速いです (el coche es más rápido que el tren). Para preguntar cuál es más ~ se usa 「AとB、どちらのほうが〜ですか」. Ojo: el superlativo ('el más de todos') es distinto — se hace con いちばん (クラスでいちばん背が高い). El orden de A y B es libre mientras cada uno lleve su partícula.",
    why: "Para COMPARAR dos cosas: «B のほうが A より 〜» = «B es más 〜 que A». より marca el punto de comparación («que»).",
    whyEn: "To COMPARE two things: “B のほうが A より 〜” = “B is more 〜 than A”. より marks what you compare against (“than”).",
    whenToUse: [
      "Comparar: 電車のほうがバスより速いです (El tren es más rápido que el bus).",
      "Preguntar: りんごとバナナ、どちらのほうが好きですか (¿Cuál te gusta más?).",
    ],
    whenToUseEn: [
      "Compare: 電車のほうがバスより速いです (The train is faster than the bus).",
      "Ask: りんごとバナナ、どちらのほうが好きですか (Which do you like more?).",
    ],
    mistakes: [
      "より va después de la cosa con la que comparas: A より B のほうが.",
      "のほうが marca lo que «gana» en la comparación.",
    ],
    mistakesEn: [
      "より comes after the thing you compare against: A より B のほうが.",
      "のほうが marks the one that “wins” the comparison.",
    ],
    examples: [
      { jp: "夏より冬のほうが好きです。", reading: "なつよりふゆのほうがすきです", meaning: "Me gusta más el invierno que el verano.", meaningEn: "I like winter more than summer." },
      { jp: "今日は昨日より暑いです。", reading: "きょうはきのうよりあついです", meaning: "Hoy hace más calor que ayer.", meaningEn: "Today is hotter than yesterday." },
      { jp: "電車よりバスのほうが安いです。", reading: "でんしゃよりバスのほうがやすいです", meaning: "El autobús es más barato que el tren.", meaningEn: "The bus is cheaper than the train." },
      { jp: "犬より猫のほうが好きです。", reading: "いぬよりねこのほうがすきです", meaning: "Me gustan más los gatos que los perros.", meaningEn: "I like cats more than dogs." },
    ],
  },
  toomou: {
    jp: "〜と思う",
    title: "〜と思います — creo que…",
    nuance:
      "〜と思います expresa una OPINIÓN o suposición propia ('creo que…'). La frase que piensas va en forma CASUAL antes de と: 高いと思います, 行くと思います, y con だ para sustantivos y な-adjetivos (学生だと思います). と marca la cita del pensamiento, igual que con 言う. El que opina eres tú; para la opinión de otra persona se usa 〜と思っています. Para preguntar la opinión de alguien: どう思いますか. Suaviza mucho las afirmaciones, por eso se usa para no sonar tajante.",
    why: "Expresa una OPINIÓN o suposición: [frase en forma casual] + と思います («creo que…»). El と marca la cita del pensamiento.",
    whyEn: "Expresses an OPINION or guess: [casual-form clause] + と思います (“I think that…”). と marks the quoted thought.",
    whenToUse: [
      "Dar tu opinión: 日本語は面白いと思います (Creo que el japonés es interesante).",
      "Suponer: 明日は雨が降ると思います (Creo que mañana lloverá).",
    ],
    whenToUseEn: [
      "Give your opinion: 日本語は面白いと思います (I think Japanese is interesting).",
      "Guess: 明日は雨が降ると思います (I think it'll rain tomorrow).",
    ],
    mistakes: [
      "Antes de と思います se usa forma CASUAL: 雨だと思います (no 雨ですと思います).",
      "Para tu opinión se usa 思います; para lo que dijo otro, 〜と言いました.",
    ],
    mistakesEn: [
      "Before と思います use the CASUAL form: 雨だと思います (not 雨ですと思います).",
      "For your opinion use 思います; for what someone said, 〜と言いました.",
    ],
    examples: [
      { jp: "この映画は面白いと思います。", reading: "このえいがはおもしろいとおもいます", meaning: "Creo que esta película es interesante.", meaningEn: "I think this movie is interesting." },
      { jp: "彼は来ないと思います。", reading: "かれはこないとおもいます", meaning: "Creo que él no vendrá.", meaningEn: "I don't think he'll come." },
      { jp: "明日は雨だと思います。", reading: "あしたはあめだとおもいます", meaning: "Creo que mañana lloverá.", meaningEn: "I think it'll rain tomorrow." },
      { jp: "彼は学生だと思います。", reading: "かれはがくせいだとおもいます", meaning: "Creo que él es estudiante.", meaningEn: "I think he's a student." },
    ],
  },
  dekiru: {
    jp: "できる",
    title: "Poder hacer — できる / forma potencial",
    nuance:
      "Para expresar CAPACIDAD ('poder hacer') hay dos caminos. (1) 〜ことができる: forma diccionario + ことができます (日本語を話すことができます). (2) La forma potencial del verbo, más natural al hablar: ichidan 食べる→食べられる; godan cambian la う→える (飲む→飲める, 話す→話せる); irregulares する→できる, 来る→来られる. Detalle clave: con la potencial, el objeto suele pasar de を a が (日本語が話せます). En habla casual, los ichidan a menudo pierden la ら (食べれる — el llamado «ら抜き言葉»).",
    why: "Dos formas de decir «poder»: la forma diccionario + ことができる (話すことができる), o la forma potencial del verbo (話す→話せる, 食べる→食べられる, する→できる, 来る→来られる).",
    whyEn: "Two ways to say “can”: dictionary form + ことができる (話すことができる), or the verb's potential form (話す→話せる, 食べる→食べられる, する→できる, 来る→来られる).",
    whenToUse: [
      "Habilidad: 泳ぐことができます (Puedo nadar).",
      "Forma potencial (más usada al hablar): 日本語が話せます (Puedo hablar japonés).",
      "Con la potencial, el objeto suele ir con が: 漢字が読めます.",
    ],
    whenToUseEn: [
      "Ability: 泳ぐことができます (I can swim).",
      "Potential form (more common in speech): 日本語が話せます (I can speak Japanese).",
      "With the potential, the object usually takes が: 漢字が読めます.",
    ],
    mistakes: [
      "La potencial de する es できる; la de 来る es 来られる.",
      "Con la potencial el objeto va con が, no を: 日本語が話せる.",
    ],
    mistakesEn: [
      "The potential of する is できる; of 来る it's 来られる.",
      "With the potential the object takes が, not を: 日本語が話せる.",
    ],
    examples: [
      { jp: "車の運転ができます。", reading: "くるまのうんてんができます", meaning: "Sé conducir.", meaningEn: "I can drive." },
      { jp: "刺身が食べられますか。", reading: "さしみがたべられますか", meaning: "¿Puedes comer sashimi?", meaningEn: "Can you eat sashimi?" },
      { jp: "日本語が少しできます。", reading: "にほんごがすこしできます", meaning: "Puedo hablar un poco de japonés.", meaningEn: "I can speak a little Japanese." },
      { jp: "明日は来られますか。", reading: "あしたはこられますか", meaning: "¿Puedes venir mañana?", meaningEn: "Can you come tomorrow?" },
    ],
  },
  tara: {
    jp: "〜たら",
    title: "〜たら — si / cuando (condicional)",
    nuance:
      "〜たら es el condicional más flexible ('si / cuando'): se forma sobre el pasado informal た/だ + ら (食べたら, 行ったら, 高かったら, 学生だったら). Sirve para condiciones hipotéticas (雨が降ったら、行きません) y también para 'cuando' con hechos futuros seguros (家に帰ったら、電話します = cuando llegue a casa, llamo). A diferencia de と (resultado automático) y de ば (más abstracto), たら admite peticiones y órdenes en la segunda parte. Es el condicional que más usarás al empezar.",
    why: "La forma た + ら expresa «si / cuando pase algo, entonces…». Es el condicional más versátil. Se forma de la た形: 食べた→食べたら, 行った→行ったら.",
    whyEn: "The た-form + ら expresses “if / when something happens, then…”. It's the most versatile conditional. Formed from the た-form: 食べた→食べたら, 行った→行ったら.",
    whenToUse: [
      "Condición: 時間があったら、電話します (Si tengo tiempo, te llamo).",
      "«Cuando» algo se cumpla: 駅に着いたら、連絡します (Cuando llegue a la estación, aviso).",
    ],
    whenToUseEn: [
      "Condition: 時間があったら、電話します (If I have time, I'll call).",
      "“When” something happens: 駅に着いたら、連絡します (When I get to the station, I'll let you know).",
    ],
    mistakes: [
      "Se forma de la た形, no de la diccionario: 行く→行ったら.",
      "La segunda parte puede ser petición u opinión, no solo un hecho.",
    ],
    mistakesEn: [
      "Formed from the た-form, not the dictionary form: 行く→行ったら.",
      "The second part can be a request or opinion, not only a fact.",
    ],
    examples: [
      { jp: "お金があったら、旅行したいです。", reading: "おかねがあったら、りょこうしたいです", meaning: "Si tuviera dinero, querría viajar.", meaningEn: "If I had money, I'd want to travel." },
      { jp: "駅に着いたら、電話してください。", reading: "えきについたら、でんわしてください", meaning: "Cuando llegues a la estación, llama.", meaningEn: "When you arrive at the station, please call." },
      { jp: "時間があったら、映画を見ます。", reading: "じかんがあったら、えいがをみます", meaning: "Si tengo tiempo, veo una película.", meaningEn: "If I have time, I'll watch a movie." },
      { jp: "家に帰ったら、電話します。", reading: "いえにかえったら、でんわします", meaning: "Cuando llegue a casa, te llamo.", meaningEn: "When I get home, I'll call." },
    ],
  },
  ba: {
    jp: "〜ば",
    title: "〜ば — condicional «si»",
    nuance:
      "〜ば subraya que A es la CONDICIÓN necesaria para B ('si A, entonces B'). Formación: godan う→えば (行く→行けば), ichidan る→れば (食べる→食べれば), adjetivos い→ければ (安ければ), negativo なければ. Se usa mucho en refranes y verdades generales (安ければ買います) y en la estructura 〜ばよかった ('ojalá hubiera…'). Restricción importante: si la segunda parte es una orden, petición o permiso, se prefiere たら en lugar de ば (salvo con verbos de estado).",
    why: "El condicional 〜ば expresa una condición general o hipotética. う-verbs: 行く→行けば; る-verbs: 食べる→食べれば; adjetivos い: 安い→安ければ.",
    whyEn: "The 〜ば conditional expresses a general or hypothetical condition. う-verbs: 行く→行けば; る-verbs: 食べる→食べれば; い-adjectives: 安い→安ければ.",
    whenToUse: [
      "Condición general: 練習すれば、上手になります (Si practicas, mejoras).",
      "Con adjetivos: 天気がよければ、行きます (Si hace buen tiempo, voy).",
    ],
    whenToUseEn: [
      "General condition: 練習すれば、上手になります (If you practice, you improve).",
      "With adjectives: 天気がよければ、行きます (If the weather is nice, I'll go).",
    ],
    mistakes: [
      "La formación depende del grupo: う-verbs う→えば; る-verbs quitan る + れば.",
      "Irregulares: する→すれば, 来る→来れば.",
    ],
    mistakesEn: [
      "The form depends on the group: う-verbs う→えば; る-verbs drop る + れば.",
      "Irregulars: する→すれば, 来る→来れば.",
    ],
    examples: [
      { jp: "押せば、開きます。", reading: "おせば、あきます", meaning: "Si lo empujas, se abre.", meaningEn: "If you push it, it opens." },
      { jp: "安ければ、買います。", reading: "やすければ、かいます", meaning: "Si es barato, lo compro.", meaningEn: "If it's cheap, I'll buy it." },
      { jp: "天気が良ければ、出かけます。", reading: "てんきがよければ、でかけます", meaning: "Si hace buen tiempo, salgo.", meaningEn: "If the weather is good, I'll go out." },
      { jp: "時間があれば、行きます。", reading: "じかんがあれば、いきます", meaning: "Si tengo tiempo, voy.", meaningEn: "If I have time, I'll go." },
    ],
  },
  yarimorai: {
    jp: "あげる・くれる・もらう",
    title: "Dar y recibir — あげる・くれる・もらう",
    nuance:
      "El japonés elige el verbo de 'dar' según la DIRECCIÓN respecto a ti. あげる = dar (yo→otro, u otro→un tercero): 私は友達にプレゼントをあげます. くれる = dar HACIA MÍ o mi grupo (otro→yo): 友達が私にプレゼントをくれます (aquí nunca あげる). もらう = recibir (yo obtengo de alguien, marcado con に/から): 友達にプレゼントをもらいます. La partícula clave: に marca al receptor con あげる/くれる, y al dador con もらう. Sus versiones corteses son さしあげる, くださる e いただく.",
    why: "Tres verbos de intercambio según la dirección: あげる (YO u otro DOY a otro), くれる (alguien ME da a mí), もらう (YO RECIBO de alguien).",
    whyEn: "Three exchange verbs by direction: あげる (I/someone GIVE to another), くれる (someone gives TO ME), もらう (I RECEIVE from someone).",
    whenToUse: [
      "あげる: 友達にプレゼントをあげます (Le doy un regalo a un amigo).",
      "くれる: 友達がプレゼントをくれます (Un amigo me da un regalo a mí).",
      "もらう: 友達にプレゼントをもらいます (Recibo un regalo de un amigo).",
    ],
    whenToUseEn: [
      "あげる: 友達にプレゼントをあげます (I give a present to a friend).",
      "くれる: 友達がプレゼントをくれます (A friend gives me a present).",
      "もらう: 友達にプレゼントをもらいます (I receive a present from a friend).",
    ],
    mistakes: [
      "くれる solo cuando el receptor soy yo (o mi grupo).",
      "Con もらう, la persona de quien recibes lleva に (o から).",
    ],
    mistakesEn: [
      "くれる only when the receiver is me (or my group).",
      "With もらう, the person you receive from takes に (or から).",
    ],
    examples: [
      { jp: "先生が本をくれました。", reading: "せんせいがほんをくれました", meaning: "El profesor me dio un libro.", meaningEn: "The teacher gave me a book." },
      { jp: "母にセーターをもらいました。", reading: "ははにセーターをもらいました", meaning: "Recibí un suéter de mi madre.", meaningEn: "I got a sweater from my mother." },
      { jp: "友達にプレゼントをあげました。", reading: "ともだちにプレゼントをあげました", meaning: "Le di un regalo a un amigo.", meaningEn: "I gave my friend a present." },
      { jp: "父に時計をもらいました。", reading: "ちちにとけいをもらいました", meaning: "Recibí un reloj de mi padre.", meaningEn: "I got a watch from my father." },
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
  // 1a. N4 patterns — checked BEFORE the generic ます/て fallbacks because many
  // end in ます/ません (なりません, と思います, もらう…) or contain て (てもいい).
  if (/あげる|くれる|もらう|dar y recibir|やりもらい/i.test(hay))
    return GRAMMAR_NOTES["yarimorai"];
  if (/ことができる|potencial|poder hacer|potential|forma potencial/i.test(hay))
    return GRAMMAR_NOTES["dekiru"];
  if (/〜?たら|条件.*たら/i.test(hay)) return GRAMMAR_NOTES["tara"];
  if (/〜ば\b|条件形|condicional «si»|ば — /i.test(hay)) return GRAMMAR_NOTES["ba"];
  if (/〜?てもいい|てはいけ|permiso|prohib/i.test(hay)) return GRAMMAR_NOTES["temoii"];
  if (/なければ|なきゃ|obligación|tener que/i.test(hay)) return GRAMMAR_NOTES["nakereba"];
  if (/と思|creo que|opinión|opinion/i.test(hay)) return GRAMMAR_NOTES["toomou"];
  if (/つもり/.test(hay)) return GRAMMAR_NOTES["tsumori"];
  if (/より|ほうが|comparar|comparación/i.test(hay)) return GRAMMAR_NOTES["yori"];
  if (/〜?たい|querer hacer/i.test(hay)) return GRAMMAR_NOTES["tai"];
  if (/た形|pasado informal|pasado casual|past casual/i.test(hay))
    return GRAMMAR_NOTES["ta-form"];
  if (/辞書形|forma diccionario|dictionary form/i.test(hay))
    return GRAMMAR_NOTES["jisho"];
  // 1b. Forma て (〜てください, 〜ています) — antes de ます porque «ています» acaba en ます.
  if (/てください|ています|て[-\s]?form|て形|forma て/i.test(hay)) {
    return GRAMMAR_NOTES["て"];
  }
  // 1c. Verbos en ます y sus tiempos (ます/ました/ません/ませんでした).
  if (
    /動詞|masu|forma cortés|forma ます/i.test(hay) ||
    tokens.some((t) => t.endsWith("ます") || t.endsWith("ません"))
  ) {
    return GRAMMAR_NOTES["ます"];
  }
  // 1d. Demostrativos これ・それ・あれ.
  if (/これ|それ|あれ|どれ|demostrativ/i.test(hay)) {
    return GRAMMAR_NOTES["これ"];
  }
  // 1e. Adjetivos な (antes de adj-i: «な形容詞» contiene «形容詞»).
  if (/な形容詞|adj[-\s]?na|adjetivo な|na[-\s]?adj/i.test(hay)) {
    return GRAMMAR_NOTES["adj-na"];
  }
  // 1f. から〜まで (desde/hasta) y から como «porque».
  if (/から|まで/.test(hay)) return GRAMMAR_NOTES["から"];
  // 1g. も «también».
  if (tokens.includes("も")) return GRAMMAR_NOTES["も"];
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
