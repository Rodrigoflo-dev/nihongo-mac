-- N5 grammar lesson seed
-- Each lesson has: title, structure, markdown explanation, examples and quiz
-- (all encoded as JSON in the `examples` column for simplicity).

DELETE FROM grammar_progress WHERE lesson_id IN (SELECT id FROM grammar_lessons);
DELETE FROM grammar_lessons;

INSERT INTO grammar_lessons (id, title, jlpt_level, category, explanation_md, structure, examples, difficulty, ordering, is_seed) VALUES
(1, 'は — partícula de tema', 'N5', 'particle',
 '## La partícula は (wa)\n\nMarca el **tema** de la oración. No es un sujeto: indica de qué estamos hablando.\n\nSe escribe con el carácter は (ha) pero se pronuncia **wa** cuando funciona como partícula.\n\n> X は Y です → "X es Y" / "En cuanto a X, es Y"\n\n**Tip:** Lo que sigue a は es la nueva información sobre el tema.',
 'X は Y です',
 '{"examples":[{"jp":"私は学生です。","reading":"わたしはがくせいです","meaning":"Yo soy estudiante."},{"jp":"これは本です。","reading":"これはほんです","meaning":"Esto es un libro."},{"jp":"日本は きれいです。","reading":"にほんは きれいです","meaning":"Japón es bonito."}],"quiz":[{"id":"q1","prompt":"¿Cuál es la partícula de tema?","options":[{"text":"は","correct":true},{"text":"が","correct":false},{"text":"を","correct":false},{"text":"に","correct":false}]},{"id":"q2","prompt":"Completa: 私 ___ 鈴木です。","prompt_jp":"私 ___ 鈴木です","options":[{"text":"は","correct":true},{"text":"を","correct":false},{"text":"に","correct":false},{"text":"で","correct":false}]},{"id":"q3","prompt":"¿Cómo se pronuncia は cuando es partícula?","options":[{"text":"wa","correct":true},{"text":"ha","correct":false},{"text":"ba","correct":false}]}]}',
 1, 1, 1),

(2, 'です — la cópula', 'N5', 'copula',
 '## です (desu)\n\nEs la versión cortés del verbo "ser/estar". Va al final de la oración.\n\n> X は Y です → "X es Y"\n\nEn forma informal se usa **だ** (da), pero です funciona en cualquier situación cortés.\n\n**Negativo:** じゃありません / ではありません\n**Pasado:** でした\n**Pasado negativo:** じゃありませんでした',
 'X です / X じゃありません',
 '{"examples":[{"jp":"私は田中です。","reading":"わたしはたなかです","meaning":"Soy Tanaka."},{"jp":"これはペンじゃありません。","reading":"これはペンじゃありません","meaning":"Esto no es un bolígrafo."},{"jp":"昨日は休みでした。","reading":"きのうはやすみでした","meaning":"Ayer fue día libre."}],"quiz":[{"id":"q1","prompt":"¿Cómo dirías \"Soy estudiante\" formalmente?","options":[{"text":"私は学生です。","correct":true},{"text":"私は学生だ。","correct":false},{"text":"私は学生か。","correct":false}]},{"id":"q2","prompt":"Forma negativa de です:","options":[{"text":"じゃありません","correct":true},{"text":"ません","correct":false},{"text":"ない","correct":false}]},{"id":"q3","prompt":"Pasado de です:","options":[{"text":"でした","correct":true},{"text":"です","correct":false},{"text":"だった","correct":false}]}]}',
 1, 2, 1),

(3, 'の — posesión y conexión', 'N5', 'particle',
 '## La partícula の (no)\n\nConecta dos sustantivos. El significado más común es **posesión**:\n\n> A の B → "B de A"\n\nTambién se usa para describir o especificar:\n\n> 日本の文化 → "cultura japonesa"',
 'A の B',
 '{"examples":[{"jp":"私の本です。","reading":"わたしのほんです","meaning":"Es mi libro."},{"jp":"田中さんの車。","reading":"たなかさんのくるま","meaning":"El coche de Tanaka."},{"jp":"日本の食べ物。","reading":"にほんのたべもの","meaning":"Comida japonesa."}],"quiz":[{"id":"q1","prompt":"Traduce: \"el libro de María\"","options":[{"text":"マリアの本","correct":true},{"text":"マリアは本","correct":false},{"text":"マリアを本","correct":false}]},{"id":"q2","prompt":"Completa: コーヒー ___ カップ (taza de café)","options":[{"text":"の","correct":true},{"text":"は","correct":false},{"text":"で","correct":false}]},{"id":"q3","prompt":"の puede usarse para:","options":[{"text":"Posesión y descripción","correct":true},{"text":"Solo posesión","correct":false},{"text":"Solo lugar","correct":false}]}]}',
 1, 3, 1),

(4, 'を — partícula de objeto directo', 'N5', 'particle',
 '## La partícula を (wo)\n\nMarca el **objeto directo** de un verbo transitivo.\n\n> X は Y を 動詞 → "X hace [verbo] a Y"\n\nSe escribe を pero se pronuncia **o**.',
 'X は Y を 食べます',
 '{"examples":[{"jp":"パンを食べます。","reading":"パンをたべます","meaning":"Como pan."},{"jp":"水を飲みます。","reading":"みずをのみます","meaning":"Bebo agua."},{"jp":"本を読みます。","reading":"ほんをよみます","meaning":"Leo un libro."}],"quiz":[{"id":"q1","prompt":"Completa: りんご ___ 食べます (Como manzana)","options":[{"text":"を","correct":true},{"text":"は","correct":false},{"text":"が","correct":false}]},{"id":"q2","prompt":"¿Cómo se pronuncia を?","options":[{"text":"o","correct":true},{"text":"wo","correct":false},{"text":"wa","correct":false}]},{"id":"q3","prompt":"を marca:","options":[{"text":"Objeto directo","correct":true},{"text":"Tema","correct":false},{"text":"Lugar","correct":false}]}]}',
 1, 4, 1),

(5, 'に — destino y tiempo', 'N5', 'particle',
 '## La partícula に (ni)\n\nTiene varios usos importantes:\n\n1. **Destino** con verbos de movimiento (行く, 来る)\n2. **Tiempo específico** (a las 8, en marzo)\n3. **Existencia** con います / あります (en X hay Y)',
 'X に 行きます / X時に',
 '{"examples":[{"jp":"学校に行きます。","reading":"がっこうにいきます","meaning":"Voy a la escuela."},{"jp":"七時に起きます。","reading":"しちじにおきます","meaning":"Me levanto a las 7."},{"jp":"机の上に本があります。","reading":"つくえのうえにほんがあります","meaning":"En el escritorio hay un libro."}],"quiz":[{"id":"q1","prompt":"Completa: 東京 ___ 行きます (Voy a Tokio)","options":[{"text":"に","correct":true},{"text":"を","correct":false},{"text":"で","correct":false}]},{"id":"q2","prompt":"\"A las 9\" en japonés:","options":[{"text":"九時に","correct":true},{"text":"九時を","correct":false},{"text":"九時の","correct":false}]},{"id":"q3","prompt":"に NO se usa para:","options":[{"text":"Lugar donde ocurre una acción","correct":true},{"text":"Destino","correct":false},{"text":"Tiempo específico","correct":false}]}]}',
 1, 5, 1),

(6, 'で — lugar de acción y medio', 'N5', 'particle',
 '## La partícula で (de)\n\nMarca:\n\n1. **Lugar donde ocurre una acción**: en el parque, en casa\n2. **Medio o herramienta**: con un bolígrafo, en tren\n\nDiferencia con に: に es destino, で es donde sucede la acción.',
 'X で 動詞 / X で 行く',
 '{"examples":[{"jp":"カフェでコーヒーを飲みます。","reading":"カフェでコーヒーをのみます","meaning":"Tomo café en la cafetería."},{"jp":"バスで学校に行きます。","reading":"バスでがっこうにいきます","meaning":"Voy a la escuela en autobús."},{"jp":"日本語で話します。","reading":"にほんごではなします","meaning":"Hablo en japonés."}],"quiz":[{"id":"q1","prompt":"\"Como en un restaurante\":","options":[{"text":"レストランで食べます","correct":true},{"text":"レストランに食べます","correct":false},{"text":"レストランを食べます","correct":false}]},{"id":"q2","prompt":"Completa: 電車 ___ 来ました (Vine en tren)","options":[{"text":"で","correct":true},{"text":"に","correct":false},{"text":"を","correct":false}]},{"id":"q3","prompt":"で indica:","options":[{"text":"Lugar de acción o medio","correct":true},{"text":"Solo destino","correct":false},{"text":"Posesión","correct":false}]}]}',
 1, 6, 1),

(7, 'ます — verbos en forma cortés', 'N5', 'verbs',
 '## Forma ます (masu)\n\nTodos los verbos japoneses tienen una forma diccionario (informal) y una forma cortés que termina en **ます**.\n\n- たべる (taberu) → たべます (tabemasu) - comer\n- のむ (nomu) → のみます (nomimasu) - beber\n- いく (iku) → いきます (ikimasu) - ir\n\n**Negativo:** ません\n**Pasado:** ました\n**Pasado negativo:** ませんでした',
 '動詞ます / 動詞ません',
 '{"examples":[{"jp":"毎日勉強します。","reading":"まいにちべんきょうします","meaning":"Estudio todos los días."},{"jp":"肉を食べません。","reading":"にくをたべません","meaning":"No como carne."},{"jp":"昨日映画を見ました。","reading":"きのうえいがをみました","meaning":"Ayer vi una película."}],"quiz":[{"id":"q1","prompt":"Forma cortés de のむ:","options":[{"text":"のみます","correct":true},{"text":"のむます","correct":false},{"text":"のんます","correct":false}]},{"id":"q2","prompt":"Pasado negativo de 食べます:","options":[{"text":"食べませんでした","correct":true},{"text":"食べないでした","correct":false},{"text":"食べませんだ","correct":false}]},{"id":"q3","prompt":"\"Mañana voy\":","options":[{"text":"明日行きます","correct":true},{"text":"明日行きました","correct":false},{"text":"明日行きません","correct":false}]}]}',
 2, 7, 1),

(8, 'が — sujeto específico', 'N5', 'particle',
 '## La partícula が (ga)\n\nMarca el **sujeto específico** o algo que se introduce por primera vez.\n\nDiferencia con は:\n- **は** marca el tema (ya conocido / contexto)\n- **が** marca algo nuevo o específico\n\nTambién se usa con verbos de existencia/preferencia: あります, います, 好き, 上手.',
 'X が います / X が 好き',
 '{"examples":[{"jp":"猫がいます。","reading":"ねこがいます","meaning":"Hay un gato."},{"jp":"音楽が好きです。","reading":"おんがくがすきです","meaning":"Me gusta la música."},{"jp":"だれが来ましたか。","reading":"だれがきましたか","meaning":"¿Quién vino?"}],"quiz":[{"id":"q1","prompt":"Completa: コーヒー ___ 好きです","options":[{"text":"が","correct":true},{"text":"を","correct":false},{"text":"は","correct":false}]},{"id":"q2","prompt":"\"Hay un perro\":","options":[{"text":"犬がいます","correct":true},{"text":"犬はいます","correct":false},{"text":"犬をいます","correct":false}]},{"id":"q3","prompt":"が se usa cuando algo es:","options":[{"text":"Nuevo o específico","correct":true},{"text":"Ya conocido","correct":false},{"text":"Objeto directo","correct":false}]}]}',
 2, 8, 1),

(9, '〜たい — querer hacer algo', 'N5', 'expressions',
 '## La forma 〜たい\n\nSe añade a la raíz ます del verbo para expresar deseo:\n\n> Verbo (sin ます) + たい → "querer + verbo"\n\nEjemplos:\n- 食べます → 食べたい (quiero comer)\n- 行きます → 行きたい (quiero ir)\n\n**Negativo:** たくない\n**Pasado:** たかった\n**Cortés:** たいです',
 '動詞-stem + たい(です)',
 '{"examples":[{"jp":"寿司を食べたいです。","reading":"すしをたべたいです","meaning":"Quiero comer sushi."},{"jp":"日本に行きたい。","reading":"にほんにいきたい","meaning":"Quiero ir a Japón."},{"jp":"今は寝たくない。","reading":"いまはねたくない","meaning":"Ahora no quiero dormir."}],"quiz":[{"id":"q1","prompt":"\"Quiero beber agua\":","options":[{"text":"水を飲みたい","correct":true},{"text":"水を飲みません","correct":false},{"text":"水を飲みました","correct":false}]},{"id":"q2","prompt":"Forma negativa de 食べたい:","options":[{"text":"食べたくない","correct":true},{"text":"食べたいない","correct":false},{"text":"食べたくありません","correct":false}]},{"id":"q3","prompt":"たい se usa para:","options":[{"text":"Expresar deseo propio","correct":true},{"text":"Expresar deseo de otros","correct":false},{"text":"Pasado","correct":false}]}]}',
 2, 9, 1),

(10, '〜てください — petición cortés', 'N5', 'expressions',
 '## La forma 〜てください\n\nSe usa para pedir algo cortésmente:\n\n> Verbo en forma て + ください → "Por favor, [verbo]"\n\nLa forma て se forma según el verbo:\n- 食べる → 食べて\n- 飲む → 飲んで\n- 行く → 行って\n- する → して',
 'V-て ください',
 '{"examples":[{"jp":"待ってください。","reading":"まってください","meaning":"Espera, por favor."},{"jp":"日本語で話してください。","reading":"にほんごではなしてください","meaning":"Por favor habla en japonés."},{"jp":"ゆっくり言ってください。","reading":"ゆっくりいってください","meaning":"Por favor, dilo despacio."}],"quiz":[{"id":"q1","prompt":"\"Por favor mira\":","options":[{"text":"見てください","correct":true},{"text":"見ないでください","correct":false},{"text":"見ます","correct":false}]},{"id":"q2","prompt":"てください es para:","options":[{"text":"Pedir cortésmente","correct":true},{"text":"Prohibir","correct":false},{"text":"Sugerir","correct":false}]},{"id":"q3","prompt":"Forma て de のむ:","options":[{"text":"のんで","correct":true},{"text":"のみて","correct":false},{"text":"のむて","correct":false}]}]}',
 2, 10, 1);

-- Mark all seeded lessons as not started
INSERT OR IGNORE INTO grammar_progress (lesson_id, status, confidence)
    SELECT id, 'new', 0 FROM grammar_lessons;
