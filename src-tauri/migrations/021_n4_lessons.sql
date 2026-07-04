-- =============================================================================
-- N4 course — a solid verified core: casual/plain forms, past, wishes & plans,
-- permission & obligation, comparison & opinion, and real-life N4 situations.
-- All Japanese hand-written and verified. Grows over time like N5.
-- =============================================================================

INSERT OR REPLACE INTO courses (id, title, description, jlpt_level, jp_title, ordering, is_seed) VALUES
(2, 'Japonés N4', 'El siguiente paso: forma casual, pasado, deseos y planes, permiso y obligación, comparar y opinar, y situaciones reales.', 'N4', '中級コース', 2, 1);

INSERT OR REPLACE INTO units (id, course_id, title, description, jp_title, ordering) VALUES
(20, 2, 'Forma casual', 'La forma diccionario y el pasado informal — la base del japonés cotidiano.', 'ふつうけい', 1),
(21, 2, 'Deseos y planes', 'Decir qué quieres hacer y qué piensas hacer.', 'きぼうとよてい', 2),
(22, 2, 'Permiso y reglas', 'Pedir permiso, dar permiso, prohibir y expresar obligación.', 'きょかとルール', 3),
(23, 2, 'Comparar y opinar', 'Comparar cosas y dar tu opinión.', 'ひかくといけん', 4),
(24, 2, 'Situaciones N4', 'Trabajo, hotel y médico: conversaciones útiles de verdad.', 'じっせん', 5);

INSERT INTO lessons (id, unit_id, title, jp_title, summary, duration_minutes, ordering, is_seed, activities_json) VALUES
(500, 20, 'La forma diccionario', 'じしょけい',
 'La forma base e informal del verbo, de la que salen todas las demás.', 9, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"辞書形 — la forma diccionario","pattern":"辞書形 動詞","explanation":"La forma diccionario es la forma base e informal del verbo (la que aparece en el diccionario). De ella se construyen las demás formas. 食べます→食べる, 行きます→行く, します→する.","example":{"jp":"毎日、日本語を勉強する。","reading":"まいにち、にほんごをべんきょうする","meaning":"Estudio japonés todos los días."}},
   {"id":"a2","kind":"intro_vocab","word":"食べる","reading":"たべる","meaning":"comer","example":"パンを食べる。"},
   {"id":"a3","kind":"intro_vocab","word":"飲む","reading":"のむ","meaning":"beber","example":"水を飲む。"},
   {"id":"a4","kind":"intro_vocab","word":"話す","reading":"はなす","meaning":"hablar","example":"日本語を話す。"},
   {"id":"a5","kind":"quiz","prompt":"Forma diccionario de 行きます:","options":["行く","行くる","行む","行る"],"correctIndex":0},
   {"id":"a6","kind":"quiz","promptJp":"毎日、日本語を ___ 。","prompt":"Elige la forma diccionario de «estudiar»","options":["勉強する","勉強します","勉強した","勉強しない"],"correctIndex":0},
   {"id":"a7","kind":"speaking","textJp":"毎朝コーヒーを飲む。","reading":"まいあさ コーヒーを のむ","meaning":"Bebo café cada mañana.","voice":"Kyoko"},
   {"id":"a8","kind":"summary","learned":["La forma diccionario (辞書形)","Verbos 食べる, 飲む, 話す","La base de la conjugación casual"]}
 ]}'
),
(501, 20, 'Pasado informal: た形', 'たけい',
 'El pasado casual, equivalente a 〜ました.', 9, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"た形 — pasado informal","pattern":"動詞た form","explanation":"La forma た es el pasado informal; equivale al cortés 〜ました. 食べた (comí), 行った (fui), した (hice), 来た (vine). Sigue las mismas reglas que la forma て.","example":{"jp":"昨日、映画を見た。","reading":"きのう、えいがをみた","meaning":"Ayer vi una película."}},
   {"id":"a2","kind":"intro_vocab","word":"昨日","reading":"きのう","meaning":"ayer","example":"昨日、映画を見た。"},
   {"id":"a3","kind":"intro_vocab","word":"買う","reading":"かう","meaning":"comprar","example":"本を買った。"},
   {"id":"a4","kind":"intro_vocab","word":"会う","reading":"あう","meaning":"encontrarse con","example":"友達に会った。"},
   {"id":"a5","kind":"quiz","prompt":"Pasado casual de する:","options":["した","しる","すた","しだ"],"correctIndex":0},
   {"id":"a6","kind":"quiz","prompt":"Pasado casual de 行く:","options":["行った","行いた","行くた","行んだ"],"correctIndex":0},
   {"id":"a7","kind":"speaking","textJp":"もう昼ご飯を食べた。","reading":"もう ひるごはんを たべた","meaning":"Ya comí (el almuerzo).","voice":"Otoya"},
   {"id":"a8","kind":"summary","learned":["El pasado informal (た形)","昨日, 買う, 会う","した, 行った, 見た"]}
 ]}'
),
(502, 21, 'Quiero hacer: 〜たい', 'したい',
 'Expresar tu deseo de hacer algo.', 8, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"〜たい — querer hacer algo","pattern":"動詞ます stem + たい","explanation":"Para decir que QUIERES hacer algo, quita ます del verbo y añade たい. 食べます→食べたい (quiero comer). Se conjuga como adjetivo い: negativo 食べたくない.","example":{"jp":"寿司が食べたいです。","reading":"すしがたべたいです","meaning":"Quiero comer sushi."}},
   {"id":"a2","kind":"intro_vocab","word":"旅行","reading":"りょこう","meaning":"viaje","example":"旅行がしたい。"},
   {"id":"a3","kind":"intro_vocab","word":"温泉","reading":"おんせん","meaning":"aguas termales","example":"温泉に入りたい。"},
   {"id":"a4","kind":"quiz","prompt":"«Quiero comer» es:","options":["食べたいです","食べますたい","食べるたい","食べたです"],"correctIndex":0},
   {"id":"a5","kind":"listening","textJp":"日本へ行きたいです。","voice":"Kyoko","prompt":"¿Qué quiere hacer?","options":["Ir a Japón","Comer sushi","Comprar un coche","Descansar"],"correctIndex":0},
   {"id":"a6","kind":"speaking","textJp":"寿司が食べたいです。","reading":"すしが たべたいです","meaning":"Quiero comer sushi.","voice":"Kyoko"},
   {"id":"a7","kind":"summary","learned":["〜たい (querer hacer)","旅行, 温泉","Negativo 〜たくない"]}
 ]}'
),
(503, 21, 'Mi intención: 〜つもり', 'つもり',
 'Hablar de planes e intenciones.', 8, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"〜つもりです — intención / plan","pattern":"動詞る + つもりです","explanation":"La forma diccionario + つもりです expresa un plan firme. 日本に行くつもりです (Pienso ir a Japón). Negativo: 〜ないつもりです.","example":{"jp":"来年、日本語を勉強するつもりです。","reading":"らいねん、にほんごをべんきょうするつもりです","meaning":"El año que viene pienso estudiar japonés."}},
   {"id":"a2","kind":"intro_vocab","word":"来月","reading":"らいげつ","meaning":"el mes que viene","example":"来月、車を買うつもりです。"},
   {"id":"a3","kind":"intro_vocab","word":"来年","reading":"らいねん","meaning":"el año que viene","example":"来年、日本に行くつもりです。"},
   {"id":"a4","kind":"quiz","prompt":"«Pienso estudiar» usa:","options":["勉強するつもり","勉強しますつもり","勉強したつもり","勉強つもり"],"correctIndex":0},
   {"id":"a5","kind":"speaking","textJp":"今日は早く寝るつもりです。","reading":"きょうは はやく ねる つもりです","meaning":"Hoy pienso dormir temprano.","voice":"Otoya"},
   {"id":"a6","kind":"summary","learned":["〜つもりです (intención)","来月, 来年","Con la forma diccionario"]}
 ]}'
),
(504, 22, '¿Puedo…?: 〜てもいい', 'てもいい',
 'Pedir y dar permiso; prohibir.', 9, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"〜てもいいです — permiso","pattern":"動詞て + もいいです","explanation":"La forma て + もいいです pide o da permiso (¿puedo…? / puedes…). Para PROHIBIR se usa 〜てはいけません (no se debe).","example":{"jp":"ここで写真を撮ってもいいですか。","reading":"ここでしゃしんをとってもいいですか","meaning":"¿Puedo tomar fotos aquí?"}},
   {"id":"a2","kind":"intro_vocab","word":"写真","reading":"しゃしん","meaning":"foto","example":"写真を撮ってもいいですか。"},
   {"id":"a3","kind":"intro_vocab","word":"入る","reading":"はいる","meaning":"entrar","example":"入ってもいいですか。"},
   {"id":"a4","kind":"quiz","promptJp":"ここで写真を ___ もいいですか。","prompt":"Elige la forma correcta","options":["撮って","撮る","撮った","撮ります"],"correctIndex":0},
   {"id":"a5","kind":"quiz","prompt":"«No se puede entrar» es:","options":["入ってはいけません","入ってもいいです","入りたいです","入るつもりです"],"correctIndex":0},
   {"id":"a6","kind":"speaking","textJp":"トイレを使ってもいいですか。","reading":"トイレを つかっても いいですか","meaning":"¿Puedo usar el baño?","voice":"Kyoko"},
   {"id":"a7","kind":"summary","learned":["〜てもいいです (permiso)","〜てはいけません (prohibición)","写真, 入る"]}
 ]}'
),
(505, 22, 'Tengo que…: 〜なければなりません', 'ぎむ',
 'Expresar obligación.', 9, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"〜なければなりません — obligación","pattern":"動詞ない stem + なければなりません","explanation":"Expresa OBLIGACIÓN (tener que). Se forma con la raíz negativa del verbo + なければなりません. 行く→行かなければなりません. Coloquial: 〜なきゃ.","example":{"jp":"明日、早く起きなければなりません。","reading":"あした、はやくおきなければなりません","meaning":"Mañana tengo que levantarme temprano."}},
   {"id":"a2","kind":"intro_vocab","word":"薬","reading":"くすり","meaning":"medicina","example":"薬を飲まなければなりません。"},
   {"id":"a3","kind":"intro_vocab","word":"起きる","reading":"おきる","meaning":"levantarse","example":"早く起きなければなりません。"},
   {"id":"a4","kind":"quiz","prompt":"«Tengo que ir» es:","options":["行かなければなりません","行きたいです","行くつもりです","行ってもいいです"],"correctIndex":0},
   {"id":"a5","kind":"speaking","textJp":"薬を飲まなければなりません。","reading":"くすりを のまなければ なりません","meaning":"Tengo que tomar la medicina.","voice":"Otoya"},
   {"id":"a6","kind":"summary","learned":["〜なければなりません (obligación)","薬, 起きる","Coloquial 〜なきゃ"]}
 ]}'
),
(506, 23, 'Comparar: 〜より〜のほうが', 'ひかく',
 'Comparar dos cosas.', 9, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"〜より〜のほうが — comparar","pattern":"A より B のほうが","explanation":"Para comparar: B のほうが A より 〜 = B es más 〜 que A. より marca el punto de comparación (que). 電車のほうがバスより速いです.","example":{"jp":"夏より冬のほうが好きです。","reading":"なつよりふゆのほうがすきです","meaning":"Me gusta más el invierno que el verano."}},
   {"id":"a2","kind":"intro_vocab","word":"夏","reading":"なつ","meaning":"verano","example":"夏は暑いです。"},
   {"id":"a3","kind":"intro_vocab","word":"冬","reading":"ふゆ","meaning":"invierno","example":"冬は寒いです。"},
   {"id":"a4","kind":"quiz","prompt":"«El tren es más rápido que el bus»","options":["電車のほうがバスより速い","バスのほうが電車より速い","電車はバスより遅い","電車とバスは同じ"],"correctIndex":0},
   {"id":"a5","kind":"listening","textJp":"夏より冬のほうが好きです。","voice":"Kyoko","prompt":"¿Qué estación prefiere?","options":["Invierno","Verano","Primavera","Otoño"],"correctIndex":0},
   {"id":"a6","kind":"speaking","textJp":"今日は昨日より暑いです。","reading":"きょうは きのうより あついです","meaning":"Hoy hace más calor que ayer.","voice":"Otoya"},
   {"id":"a7","kind":"summary","learned":["〜より〜のほうが (comparar)","夏, 冬","のほうが marca lo que gana"]}
 ]}'
),
(507, 23, 'Creo que…: 〜と思います', 'いけん',
 'Dar tu opinión.', 8, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"〜と思います — creo que","pattern":"文 casual + と思います","explanation":"Expresa una OPINIÓN o suposición: frase en forma casual + と思います (creo que…). Antes de と思います se usa forma casual: 雨だと思います.","example":{"jp":"日本語は面白いと思います。","reading":"にほんごはおもしろいとおもいます","meaning":"Creo que el japonés es interesante."}},
   {"id":"a2","kind":"intro_vocab","word":"面白い","reading":"おもしろい","meaning":"interesante","example":"この本は面白いと思います。"},
   {"id":"a3","kind":"intro_vocab","word":"雨","reading":"あめ","meaning":"lluvia","example":"明日は雨が降ると思います。"},
   {"id":"a4","kind":"quiz","prompt":"«Creo que es interesante» es:","options":["面白いと思います","面白いたいです","面白いつもりです","面白くないです"],"correctIndex":0},
   {"id":"a5","kind":"speaking","textJp":"日本語は面白いと思います。","reading":"にほんごは おもしろいと おもいます","meaning":"Creo que el japonés es interesante.","voice":"Kyoko"},
   {"id":"a6","kind":"summary","learned":["〜と思います (opinión)","面白い, 雨","Forma casual antes de と思います"]}
 ]}'
),
(508, 24, 'En el trabajo', 'しごと',
 'Palabras y saludos de la vida laboral.', 8, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_vocab","word":"会社","reading":"かいしゃ","meaning":"empresa","example":"会社に行きます。"},
   {"id":"a2","kind":"intro_vocab","word":"会議","reading":"かいぎ","meaning":"reunión","example":"会議は十時からです。"},
   {"id":"a3","kind":"intro_vocab","word":"仕事","reading":"しごと","meaning":"trabajo","example":"仕事は忙しいです。"},
   {"id":"a4","kind":"intro_vocab","word":"お疲れ様です","reading":"おつかれさまです","meaning":"«buen trabajo» (saludo laboral)","example":"お疲れ様です。"},
   {"id":"a5","kind":"listening","textJp":"会議は三時からです。","voice":"Otoya","prompt":"¿A qué hora es la reunión?","options":["A las 3","A la 1","A las 2","A las 4"],"correctIndex":0},
   {"id":"a6","kind":"speaking","textJp":"お疲れ様です。","reading":"おつかれさまです","meaning":"Buen trabajo (saludo al terminar/coincidir).","voice":"Kyoko"},
   {"id":"a7","kind":"summary","learned":["会社, 会議, 仕事","お疲れ様です","Hablar del trabajo"]}
 ]}'
),
(509, 24, 'En el hotel', 'ホテル',
 'Registrarte y pedir en un hotel.', 8, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_vocab","word":"予約","reading":"よやく","meaning":"reserva","example":"予約をお願いします。"},
   {"id":"a2","kind":"intro_vocab","word":"部屋","reading":"へや","meaning":"habitación","example":"部屋は静かです。"},
   {"id":"a3","kind":"intro_vocab","word":"鍵","reading":"かぎ","meaning":"llave","example":"鍵をください。"},
   {"id":"a4","kind":"quiz","prompt":"¿Qué significa 予約?","options":["reserva","habitación","llave","recepción"],"correctIndex":0},
   {"id":"a5","kind":"listening","textJp":"部屋の鍵をください。","voice":"Kyoko","prompt":"¿Qué pide?","options":["La llave de la habitación","El menú","La cuenta","Un taxi"],"correctIndex":0},
   {"id":"a6","kind":"speaking","textJp":"予約をお願いします。","reading":"よやくを おねがいします","meaning":"Quisiera registrar mi reserva, por favor.","voice":"Otoya"},
   {"id":"a7","kind":"summary","learned":["予約, 部屋, 鍵","Registrarte en un hotel","予約をお願いします"]}
 ]}'
),
(510, 24, 'Con el médico', 'びょういん',
 'Decir qué te duele en la clínica.', 8, 3, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_vocab","word":"病院","reading":"びょういん","meaning":"hospital","example":"病院はどこですか。"},
   {"id":"a2","kind":"intro_vocab","word":"熱","reading":"ねつ","meaning":"fiebre","example":"熱があります。"},
   {"id":"a3","kind":"intro_vocab","word":"痛い","reading":"いたい","meaning":"doloroso","example":"頭が痛いです。"},
   {"id":"a4","kind":"quiz","promptJp":"頭が ___ です。","prompt":"«Me duele la cabeza»","options":["痛い","高い","忙しい","静か"],"correctIndex":0},
   {"id":"a5","kind":"listening","textJp":"熱があります。","voice":"Kyoko","prompt":"¿Qué le pasa?","options":["Tiene fiebre","Le duele la cabeza","Está cansado","Tiene hambre"],"correctIndex":0},
   {"id":"a6","kind":"speaking","textJp":"頭が痛いです。","reading":"あたまが いたいです","meaning":"Me duele la cabeza.","voice":"Otoya"},
   {"id":"a7","kind":"summary","learned":["病院, 熱, 痛い","Decir qué te duele","頭が痛いです"]}
 ]}'
);

INSERT OR IGNORE INTO lesson_progress (lesson_id, status)
    SELECT id, 'available' FROM lessons WHERE id BETWEEN 500 AND 599;
