-- Re-seed lessons with: per-quiz explanations, write_kanji / write_sentence activities

DELETE FROM lesson_progress;
DELETE FROM lessons;

INSERT INTO lessons (id, unit_id, title, jp_title, summary, duration_minutes, ordering, is_seed, activities_json) VALUES
(1, 1, 'Tu primer kanji y "yo soy…"', '初めて',
 'Aprendes los kanji 私 y 学, la partícula は y a presentarte.', 10, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_kanji","kanjiChar":"私","meaning":"yo / privado","onyomi":["シ"],"kunyomi":["わたし"],"example":{"jp":"私は学生です。","reading":"わたしはがくせいです","meaning":"Soy estudiante."},"note":"Cuando hablas de ti en japonés cortés, usas 私 (わたし)."},
   {"id":"a2","kind":"intro_kanji","kanjiChar":"学","meaning":"estudiar / aprender","onyomi":["ガク"],"kunyomi":["まな"],"example":{"jp":"学生","reading":"がくせい","meaning":"estudiante"},"note":"Lo verás constantemente en 学校 (escuela), 学生 (estudiante), 大学 (universidad)."},
   {"id":"a3","kind":"intro_grammar","title":"は — partícula de tema","pattern":"X は Y です","explanation":"は marca el tema de la oración. \"X es Y\". Se escribe は pero se pronuncia wa cuando funciona como partícula.","example":{"jp":"私は学生です。","reading":"わたしはがくせいです","meaning":"Yo soy estudiante."}},
   {"id":"a4","kind":"intro_vocab","word":"学生","reading":"がくせい","meaning":"estudiante","example":"私は学生です。"},
   {"id":"a5","kind":"quiz","prompt":"¿Qué significa el kanji 私?","options":["maestro","estudiante","yo","escuela"],"correctIndex":2,"explanation":"私 significa \"yo\" o \"privado\". Cuando hablas de ti mismo de forma cortés, usas 私 (わたし)."},
   {"id":"a6","kind":"quiz","promptJp":"私 ___ 学生です","prompt":"Completa con la partícula correcta","options":["は","を","に","の"],"correctIndex":0,"explanation":"La partícula correcta es は porque marca el tema (\"yo\"). を marcaría objeto directo, に destino, の posesión."},
   {"id":"a7","kind":"quiz","prompt":"¿Cómo se pronuncia は cuando es partícula de tema?","options":["ha","wa","ba","pa"],"correctIndex":1,"explanation":"Aunque el carácter は normalmente se lee \"ha\", cuando funciona como partícula se pronuncia \"wa\". Es una de las excepciones que tienes que memorizar."},
   {"id":"a8","kind":"listening","textJp":"私は学生です。","voice":"Kyoko","prompt":"¿Qué está diciendo?","options":["Soy maestro","Soy estudiante","Soy japonés","Tengo un libro"],"correctIndex":1,"explanation":"Dijo \"私は学生です\" (わたしは がくせい です) = Soy estudiante."},
   {"id":"a9","kind":"write_kanji","kanjiChar":"私","meaning":"yo","reading":"わたし","note":"Empieza con los trazos verticales del lado izquierdo, luego completa la parte derecha."},
   {"id":"a10","kind":"write_sentence","prompt":"Escribe en japonés: \"Soy estudiante.\"","hint":"Usa は + 学生 + です","accepted":["私は学生です","私は学生です。","わたしは学生です","わたしは学生です。"],"explanation":"La frase es 私は学生です — \"yo es estudiante\" en estructura japonesa. Si usaste hiragana わたし también es correcto."},
   {"id":"a11","kind":"speaking","textJp":"私は学生です。","reading":"わたしは がくせい です","meaning":"Yo soy estudiante.","voice":"Kyoko"},
   {"id":"a12","kind":"summary","learned":["2 kanjis: 私 y 学","La partícula は (tema)","Tu primera frase: 私は学生です","Vocabulario: 学生 (estudiante)","Escribiste tu primer kanji y tu primera oración"]}
 ]}'
),
(2, 1, 'Días, soles y lunas', 'にちようび',
 'Los kanji 日 y 月 más números básicos para fechas.', 10, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_kanji","kanjiChar":"日","meaning":"día / sol","onyomi":["ニチ","ジツ"],"kunyomi":["ひ","か"],"example":{"jp":"今日","reading":"きょう","meaning":"hoy"},"note":"Aparece en miles de palabras: 日本 (Japón), 毎日 (todos los días), 今日 (hoy)."},
   {"id":"a2","kind":"intro_kanji","kanjiChar":"月","meaning":"mes / luna","onyomi":["ゲツ","ガツ"],"kunyomi":["つき"],"example":{"jp":"一月","reading":"いちがつ","meaning":"enero"},"note":"Como kanji de mes se usa con el número: 一月 enero, 二月 febrero…"},
   {"id":"a3","kind":"intro_kanji","kanjiChar":"一","meaning":"uno","onyomi":["イチ"],"kunyomi":["ひと"],"example":{"jp":"一つ","reading":"ひとつ","meaning":"uno (cosa)"},"note":"La forma más simple: una línea horizontal."},
   {"id":"a4","kind":"intro_vocab","word":"今日","reading":"きょう","meaning":"hoy","example":"今日は月曜日です。"},
   {"id":"a5","kind":"quiz","prompt":"¿Qué significa el kanji 月?","options":["sol","mes / luna","día","año"],"correctIndex":1,"explanation":"月 significa \"mes\" o \"luna\". Por extensión semántica: la luna marca los meses. 日 es el del sol/día."},
   {"id":"a6","kind":"quiz","promptJp":"今日 ___ 月曜日です","prompt":"Completa la partícula","options":["を","に","は","の"],"correctIndex":2,"explanation":"は marca el tema (\"hoy\"). La frase es \"En cuanto a hoy, es lunes\"."},
   {"id":"a7","kind":"quiz","prompt":"\"Enero\" en japonés es:","options":["一日","一月","月一","日一"],"correctIndex":1,"explanation":"一月 (いちがつ) = enero. El orden es: número + 月. 一日 (ついたち) significa día 1."},
   {"id":"a8","kind":"listening","textJp":"今日は一月一日です。","voice":"Kyoko","prompt":"¿Qué fecha mencionan?","options":["1 de enero","11 de enero","1 de noviembre","10 de enero"],"correctIndex":0,"explanation":"今日は (hoy es) 一月 (enero) 一日 (día 1) です. Nota que el día 1 se lee ついたち, una lectura especial."},
   {"id":"a9","kind":"write_kanji","kanjiChar":"日","meaning":"día / sol","reading":"ひ / にち","note":"Es un cuadrado con una línea horizontal en medio. Empieza por el trazo vertical izquierdo, luego el resto."},
   {"id":"a10","kind":"write_sentence","prompt":"Escribe en japonés: \"Hoy es 1 de enero.\"","hint":"Usa 今日 + は + 一月一日 + です","accepted":["今日は一月一日です","今日は一月一日です。","きょうは一月一日です","きょうは一月一日です。"],"explanation":"今日は (kyou wa) = hoy / 一月一日 (ichigatsu tsuitachi) = 1 de enero / です = es."},
   {"id":"a11","kind":"speaking","textJp":"今日は一月一日です。","reading":"きょうは いちがつ ついたち です","meaning":"Hoy es 1 de enero.","voice":"Kyoko"},
   {"id":"a12","kind":"summary","learned":["3 kanjis: 日, 月, 一","Vocabulario: 今日 (hoy), 一月 (enero)","Decir y escribir la fecha del día","Tu segunda frase completa"]}
 ]}'
),
(3, 1, 'Saludos del día', 'あいさつ',
 'Buenos días, buenas tardes, buenas noches. Con voz nativa para que los reconozcas.', 9, 3, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_vocab","word":"おはようございます","reading":"ohayou gozaimasu","meaning":"Buenos días (formal, hasta ~10am)","example":"おはようございます、先生。"},
   {"id":"a2","kind":"intro_vocab","word":"こんにちは","reading":"konnichiwa","meaning":"Hola / Buenas tardes (durante el día)","example":"こんにちは、田中さん。"},
   {"id":"a3","kind":"intro_vocab","word":"こんばんは","reading":"konbanwa","meaning":"Buenas noches (al saludar)","example":"こんばんは。"},
   {"id":"a4","kind":"intro_vocab","word":"ありがとうございます","reading":"arigatou gozaimasu","meaning":"Muchas gracias (formal)","example":"ありがとうございます。"},
   {"id":"a5","kind":"quiz","prompt":"¿Qué dirías a las 9am al llegar al trabajo?","options":["こんばんは","こんにちは","おはようございます","ありがとうございます"],"correctIndex":2,"explanation":"A las 9am es \"おはようございます\" (buenos días formal). こんにちは se usa más a partir de mediodía."},
   {"id":"a6","kind":"listening","textJp":"こんばんは。","voice":"Otoya","prompt":"¿Qué momento del día sugiere?","options":["Mañana","Mediodía","Tarde temprana","Noche"],"correctIndex":3,"explanation":"こんばんは se usa al saludar por la noche, normalmente después del atardecer."},
   {"id":"a7","kind":"listening","textJp":"おはようございます。","voice":"Kyoko","prompt":"¿Cómo responderías cortésmente?","options":["さようなら","おはようございます","ありがとう","すみません"],"correctIndex":1,"explanation":"Al saludo \"おはようございます\" respondes con el mismo saludo. さようなら es \"adiós\", すみません es \"disculpe\"."},
   {"id":"a8","kind":"write_sentence","prompt":"Escribe \"Muchas gracias\" en japonés (formal):","hint":"Empieza con ありがとう…","accepted":["ありがとうございます","ありがとうございます。"],"explanation":"ありがとうございます es la forma formal. ありがとう sin ございます es informal/coloquial."},
   {"id":"a9","kind":"speaking","textJp":"おはようございます。","reading":"おはよう ございます","meaning":"Buenos días (formal).","voice":"Kyoko"},
   {"id":"a10","kind":"speaking","textJp":"こんにちは、田中さん。","reading":"こんにちは、たなか さん","meaning":"Hola, Sr. Tanaka.","voice":"Otoya"},
   {"id":"a11","kind":"speaking","textJp":"ありがとうございます。","reading":"ありがとう ございます","meaning":"Muchas gracias.","voice":"Kyoko"},
   {"id":"a12","kind":"summary","learned":["4 saludos clave","Reconocer audio de saludos","Cuándo usar cada saludo según la hora","Practicaste pronunciación con tu voz"]}
 ]}'
),
(4, 2, 'Verbos en ます — comer y beber', 'たべる、のむ',
 'Tu primer verbo en forma cortés. Decir qué comes y bebes.', 11, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"ます — forma cortés del verbo","pattern":"動詞ます / 動詞ません","explanation":"Los verbos japoneses tienen una forma cortés terminada en ます. Es la que usarás casi siempre. Su negativa es ません.","example":{"jp":"パンを食べます。","reading":"パンをたべます","meaning":"Como pan."}},
   {"id":"a2","kind":"intro_vocab","word":"食べます","reading":"たべます","meaning":"comer (cortés)","example":"パンを食べます。"},
   {"id":"a3","kind":"intro_vocab","word":"飲みます","reading":"のみます","meaning":"beber (cortés)","example":"水を飲みます。"},
   {"id":"a4","kind":"intro_grammar","title":"を — partícula de objeto directo","pattern":"X を 動詞ます","explanation":"を (pronunciada \"o\") marca lo que recibe la acción del verbo. \"Como X\" → X を 食べます.","example":{"jp":"水を飲みます。","reading":"みずをのみます","meaning":"Bebo agua."}},
   {"id":"a5","kind":"quiz","prompt":"Forma cortés de のむ (beber):","options":["のんます","のみます","のむます","のむました"],"correctIndex":1,"explanation":"Para verbos del grupo godan terminados en む, se cambia む → み + ます. のむ → のみます."},
   {"id":"a6","kind":"quiz","promptJp":"水 ___ 飲みます","prompt":"¿Qué partícula va antes del verbo \"beber\"?","options":["は","に","を","で"],"correctIndex":2,"explanation":"を marca el objeto directo. El agua (水) es lo que se bebe, así que recibe la acción del verbo."},
   {"id":"a7","kind":"quiz","prompt":"Forma negativa de 食べます:","options":["食べない","食べません","食べないです","食べませんでした"],"correctIndex":1,"explanation":"En la forma cortés, ます → ません para negar. 食べない es la negativa coloquial (forma diccionario)."},
   {"id":"a8","kind":"listening","textJp":"私は肉を食べません。","voice":"Kyoko","prompt":"¿Qué afirma?","options":["Como carne","No como carne","Bebo carne","No bebo carne"],"correctIndex":1,"explanation":"私は (yo) 肉を (carne) 食べません (no como) = No como carne. ません es la negativa cortés de ます."},
   {"id":"a9","kind":"write_sentence","prompt":"Escribe en japonés: \"Bebo agua.\"","hint":"水 + を + 飲みます","accepted":["水を飲みます","水を飲みます。","みずを飲みます","水をのみます","水を飲む"],"explanation":"水 (mizu) = agua, を marca el objeto, 飲みます (nomimasu) = beber (cortés). Si pusiste 飲む es la forma diccionario — también correcta pero menos cortés."},
   {"id":"a10","kind":"speaking","textJp":"水を飲みます。","reading":"みずを のみます","meaning":"Bebo agua.","voice":"Otoya"},
   {"id":"a11","kind":"speaking","textJp":"パンを食べます。","reading":"パンを たべます","meaning":"Como pan.","voice":"Kyoko"},
   {"id":"a12","kind":"summary","learned":["La forma cortés ます y su negativa ません","La partícula を","Verbos 食べます (comer) y 飲みます (beber)","Cómo afirmar y negar acciones"]}
 ]}'
),
(5, 2, 'Lugar y movimiento — ir a…', 'いきます',
 'El verbo ir, las partículas に y で, y dónde haces las cosas.', 11, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_vocab","word":"行きます","reading":"いきます","meaning":"ir (cortés)","example":"学校に行きます。"},
   {"id":"a2","kind":"intro_kanji","kanjiChar":"行","meaning":"ir","onyomi":["コウ","ギョウ"],"kunyomi":["い","ゆ"],"example":{"jp":"銀行","reading":"ぎんこう","meaning":"banco"},"note":"También aparece en 銀行 (ginkou = banco) y 旅行 (ryokou = viaje)."},
   {"id":"a3","kind":"intro_grammar","title":"に — destino y tiempo","pattern":"場所 に 行きます","explanation":"に marca a dónde vas con verbos de movimiento. También sirve para horas específicas (7時に, a las 7).","example":{"jp":"東京に行きます。","reading":"とうきょうにいきます","meaning":"Voy a Tokio."}},
   {"id":"a4","kind":"intro_grammar","title":"で — lugar de acción","pattern":"場所 で 動詞","explanation":"で marca dónde sucede la acción. Diferencia clave: に es destino, で es lugar donde ocurre la acción.","example":{"jp":"カフェでコーヒーを飲みます。","reading":"カフェでコーヒーをのみます","meaning":"Tomo café en la cafetería."}},
   {"id":"a5","kind":"quiz","promptJp":"東京 ___ 行きます","prompt":"\"Voy a Tokio\":","options":["で","は","を","に"],"correctIndex":3,"explanation":"に marca el destino con verbos de movimiento (行く, 来る). で marcaría dónde haces algo (no a dónde vas)."},
   {"id":"a6","kind":"quiz","promptJp":"レストラン ___ 食べます","prompt":"\"Como en un restaurante\":","options":["に","で","を","は"],"correctIndex":1,"explanation":"で marca el lugar donde ocurre la acción de comer. に sería destino (a dónde voy), no dónde como."},
   {"id":"a7","kind":"quiz","prompt":"¿Qué partícula NO uses con 行きます (ir)?","options":["に (destino)","へ (dirección)","で (medio: bus, tren)","を (objeto directo)"],"correctIndex":3,"explanation":"を marca el objeto directo de un verbo transitivo. 行く es intransitivo, no \"vas algo\". に, へ y で sí se usan con 行きます en distintos sentidos."},
   {"id":"a8","kind":"listening","textJp":"明日、東京に行きます。","voice":"Kyoko","prompt":"¿Cuándo va y a dónde?","options":["Hoy a Osaka","Mañana a Tokio","Ayer a Tokio","Mañana a Osaka"],"correctIndex":1,"explanation":"明日 (あした) = mañana, 東京 (とうきょう) = Tokio, に行きます = voy a. \"Mañana voy a Tokio\"."},
   {"id":"a9","kind":"write_kanji","kanjiChar":"行","meaning":"ir","reading":"い / コウ","note":"Tres líneas verticales como caminos por los que vas."},
   {"id":"a10","kind":"write_sentence","prompt":"Escribe en japonés: \"Voy a la escuela.\"","hint":"学校 + に + 行きます","accepted":["学校に行きます","学校に行きます。","がっこうに行きます","学校にいきます"],"explanation":"学校 (gakkou) = escuela, に marca destino, 行きます (ikimasu) = ir (cortés)."},
   {"id":"a11","kind":"speaking","textJp":"明日、東京に行きます。","reading":"あした、とうきょうに いきます","meaning":"Mañana voy a Tokio.","voice":"Kyoko"},
   {"id":"a12","kind":"speaking","textJp":"カフェでコーヒーを飲みます。","reading":"カフェで コーヒーを のみます","meaning":"Tomo café en la cafetería.","voice":"Otoya"},
   {"id":"a13","kind":"summary","learned":["Verbo 行きます (ir) y el kanji 行","Distinguir に (destino) de で (lugar de acción)","Decir \"voy a X\" y \"hago X en Y\"","Escribiste un kanji y una oración con verbo"]}
 ]}'
);

INSERT OR IGNORE INTO lesson_progress (lesson_id, status)
    SELECT id, 'available' FROM lessons;
