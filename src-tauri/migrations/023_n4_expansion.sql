-- =============================================================================
-- N4 expansion — more units in order: poder hacer, condicionales, dar y recibir,
-- y más situaciones. Continues growing N4 toward the depth of N5. Verified.
-- =============================================================================

INSERT OR REPLACE INTO units (id, course_id, title, description, jp_title, ordering) VALUES
(25, 2, 'Poder hacer', 'Decir que puedes o sabes hacer algo (habilidad y forma potencial).', 'できること', 6),
(26, 2, 'Condicionales', 'Decir «si / cuando» con 〜たら y 〜ば.', 'じょうけん', 7),
(27, 2, 'Dar y recibir', 'あげる, くれる y もらう — quién da y quién recibe.', 'あげる・もらう', 8),
(28, 2, 'Más situaciones', 'Teléfono, banco y emergencias.', 'もっとじっせん', 9);

INSERT INTO lessons (id, unit_id, title, jp_title, summary, duration_minutes, ordering, is_seed, activities_json) VALUES
(511, 25, 'Puedo: 〜ことができる', 'できる',
 'Decir que puedes hacer algo con ことができる.', 9, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"〜ことができる — poder hacer","pattern":"動詞る + ことができる","explanation":"Con la forma diccionario + ことができる dices que puedes o sabes hacer algo. 日本語を話すことができます (Puedo hablar japonés).","example":{"jp":"私は泳ぐことができます。","reading":"わたしはおよぐことができます","meaning":"Sé nadar."}},
   {"id":"a2","kind":"intro_vocab","word":"泳ぐ","reading":"およぐ","meaning":"nadar","example":"海で泳ぐことができます。"},
   {"id":"a3","kind":"intro_vocab","word":"運転","reading":"うんてん","meaning":"conducción","example":"運転することができます。"},
   {"id":"a4","kind":"quiz","prompt":"«Puedo hablar japonés» es:","options":["日本語を話すことができます","日本語を話したいです","日本語を話すつもりです","日本語を話しました"],"correctIndex":0},
   {"id":"a5","kind":"speaking","textJp":"私は車の運転ができます。","reading":"わたしは くるまの うんてんが できます","meaning":"Sé conducir.","voice":"Kyoko"},
   {"id":"a6","kind":"summary","learned":["〜ことができる (poder hacer)","泳ぐ, 運転","Expresar habilidad"]}
 ]}'
),
(512, 25, 'La forma potencial: 話せる', 'かのうけい',
 'La otra forma de «poder»: 話す→話せる, 食べる→食べられる.', 9, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"La forma potencial — 話せる","pattern":"動詞 potencial (話せる・食べられる)","explanation":"La forma potencial del verbo también significa «poder». 話す→話せる, 食べる→食べられる, する→できる, 来る→来られる. El objeto suele ir con が: 日本語が話せます.","example":{"jp":"漢字が読めます。","reading":"かんじがよめます","meaning":"Puedo leer kanji."}},
   {"id":"a2","kind":"intro_vocab","word":"読める","reading":"よめる","meaning":"poder leer","example":"漢字が読めます。"},
   {"id":"a3","kind":"intro_vocab","word":"食べられる","reading":"たべられる","meaning":"poder comer","example":"刺身が食べられます。"},
   {"id":"a4","kind":"quiz","prompt":"Forma potencial de 話す (hablar):","options":["話せる","話られる","話す","話した"],"correctIndex":0},
   {"id":"a5","kind":"quiz","promptJp":"日本語 ___ 話せます。","prompt":"¿Qué partícula va con la forma potencial?","options":["が","を","に","へ"],"correctIndex":0},
   {"id":"a6","kind":"speaking","textJp":"刺身が食べられますか。","reading":"さしみが たべられますか","meaning":"¿Puedes comer sashimi?","voice":"Otoya"},
   {"id":"a7","kind":"summary","learned":["La forma potencial (話せる)","読める, 食べられる","El objeto va con が"]}
 ]}'
),
(513, 26, 'Si… : 〜たら', 'たら',
 'El condicional más versátil: si/cuando pase algo.', 9, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"〜たら — si / cuando","pattern":"動詞た + ら","explanation":"La forma た + ら expresa «si/cuando pase algo, entonces…». Se forma de la た形: 食べた→食べたら. 時間があったら、電話します.","example":{"jp":"雨が降ったら、行きません。","reading":"あめがふったら、いきません","meaning":"Si llueve, no voy."}},
   {"id":"a2","kind":"intro_vocab","word":"時間","reading":"じかん","meaning":"tiempo (disponible)","example":"時間があったら、行きます。"},
   {"id":"a3","kind":"intro_vocab","word":"連絡","reading":"れんらく","meaning":"contacto / aviso","example":"着いたら、連絡します。"},
   {"id":"a4","kind":"quiz","prompt":"«Si tengo tiempo, te llamo» empieza con:","options":["時間があったら","時間がありますから","時間があるので","時間がほしい"],"correctIndex":0},
   {"id":"a5","kind":"speaking","textJp":"駅に着いたら、電話してください。","reading":"えきに ついたら、でんわ してください","meaning":"Cuando llegues a la estación, llama.","voice":"Kyoko"},
   {"id":"a6","kind":"summary","learned":["〜たら (si / cuando)","時間, 連絡","Se forma de la た形"]}
 ]}'
),
(514, 26, 'Si… : 〜ば', 'ば',
 'El condicional general con la forma ば.', 9, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"〜ば — condicional «si»","pattern":"動詞ば形","explanation":"El condicional 〜ば expresa una condición general. う-verbs: 行く→行けば; る-verbs: 食べる→食べれば; adjetivos い: 安い→安ければ. 練習すれば、上手になります.","example":{"jp":"安ければ、買います。","reading":"やすければ、かいます","meaning":"Si es barato, lo compro."}},
   {"id":"a2","kind":"intro_vocab","word":"練習","reading":"れんしゅう","meaning":"práctica","example":"練習すれば、上手になります。"},
   {"id":"a3","kind":"intro_vocab","word":"天気","reading":"てんき","meaning":"clima / tiempo","example":"天気がよければ、行きます。"},
   {"id":"a4","kind":"quiz","prompt":"Forma condicional ば de 行く:","options":["行けば","行くば","行ば","行ければ"],"correctIndex":0},
   {"id":"a5","kind":"speaking","textJp":"練習すれば、上手になります。","reading":"れんしゅう すれば、じょうずに なります","meaning":"Si practicas, mejoras.","voice":"Otoya"},
   {"id":"a6","kind":"summary","learned":["〜ば (condicional)","練習, 天気","Formación por grupo de verbo"]}
 ]}'
),
(515, 27, 'Dar: あげる', 'あげる',
 'Decir que le das algo a alguien.', 8, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"あげる — dar (a otra persona)","pattern":"A に B を あげる","explanation":"あげる = «dar» de mí (o de alguien) HACIA otra persona. La persona que recibe lleva に. 友達にプレゼントをあげます.","example":{"jp":"母に花をあげます。","reading":"ははにはなをあげます","meaning":"Le doy flores a mi madre."}},
   {"id":"a2","kind":"intro_vocab","word":"プレゼント","reading":"ぷれぜんと","meaning":"regalo","example":"友達にプレゼントをあげます。"},
   {"id":"a3","kind":"intro_vocab","word":"花","reading":"はな","meaning":"flor","example":"母に花をあげます。"},
   {"id":"a4","kind":"quiz","promptJp":"友達 ___ プレゼントをあげます。","prompt":"¿Qué partícula marca a quien recibe?","options":["に","が","を","で"],"correctIndex":0},
   {"id":"a5","kind":"speaking","textJp":"友達にプレゼントをあげます。","reading":"ともだちに ぷれぜんとを あげます","meaning":"Le doy un regalo a un amigo.","voice":"Kyoko"},
   {"id":"a6","kind":"summary","learned":["あげる (dar a otro)","プレゼント, 花","Quien recibe lleva に"]}
 ]}'
),
(516, 27, 'Me dan / recibir: くれる・もらう', 'くれる・もらう',
 'くれる (me dan) y もらう (recibo).', 9, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_grammar","title":"くれる・もらう — recibir","pattern":"〜が くれる / 〜に もらう","explanation":"くれる = alguien ME da a mí (友達がくれる). もらう = yo RECIBO de alguien (友達にもらう). くれる es solo cuando el receptor soy yo o mi grupo.","example":{"jp":"先生が本をくれました。","reading":"せんせいがほんをくれました","meaning":"El profesor me dio un libro."}},
   {"id":"a2","kind":"intro_vocab","word":"母","reading":"はは","meaning":"madre (propia)","example":"母にセーターをもらいました。"},
   {"id":"a3","kind":"intro_vocab","word":"本","reading":"ほん","meaning":"libro","example":"先生が本をくれました。"},
   {"id":"a4","kind":"quiz","prompt":"«Recibí un regalo de un amigo» es:","options":["友達にプレゼントをもらいました","友達にプレゼントをあげました","友達がプレゼントをもらいました","友達をプレゼントにあげました"],"correctIndex":0},
   {"id":"a5","kind":"speaking","textJp":"母にセーターをもらいました。","reading":"ははに せーたーを もらいました","meaning":"Recibí un suéter de mi madre.","voice":"Otoya"},
   {"id":"a6","kind":"summary","learned":["くれる (me dan) y もらう (recibo)","母, 本","くれる: el receptor soy yo"]}
 ]}'
),
(517, 28, 'Por teléfono', 'でんわ',
 'Contestar y hablar por teléfono.', 8, 1, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_vocab","word":"電話","reading":"でんわ","meaning":"teléfono / llamada","example":"電話をします。"},
   {"id":"a2","kind":"intro_vocab","word":"もしもし","reading":"もしもし","meaning":"«¿aló?» (al teléfono)","example":"もしもし、田中です。"},
   {"id":"a3","kind":"intro_vocab","word":"番号","reading":"ばんごう","meaning":"número","example":"電話番号を教えてください。"},
   {"id":"a4","kind":"quiz","prompt":"¿Qué dices al contestar el teléfono?","options":["もしもし","いただきます","ただいま","おやすみ"],"correctIndex":0},
   {"id":"a5","kind":"listening","textJp":"もしもし、田中です。","voice":"Otoya","prompt":"¿Qué está haciendo?","options":["Contestando el teléfono","Pidiendo comida","Despidiéndose","Saludando de mañana"],"correctIndex":0},
   {"id":"a6","kind":"speaking","textJp":"もしもし、田中です。","reading":"もしもし、たなか です","meaning":"¿Aló? Habla Tanaka.","voice":"Otoya"},
   {"id":"a7","kind":"summary","learned":["電話, もしもし, 番号","Contestar el teléfono","Pedir un número"]}
 ]}'
),
(518, 28, 'En el banco', 'ぎんこう',
 'Palabras básicas del banco.', 8, 2, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_vocab","word":"銀行","reading":"ぎんこう","meaning":"banco","example":"銀行はどこですか。"},
   {"id":"a2","kind":"intro_vocab","word":"口座","reading":"こうざ","meaning":"cuenta (bancaria)","example":"口座を作りたいです。"},
   {"id":"a3","kind":"intro_vocab","word":"お金","reading":"おかね","meaning":"dinero","example":"お金を引き出します。"},
   {"id":"a4","kind":"quiz","prompt":"¿Qué significa 口座?","options":["cuenta bancaria","dinero","banco","tarjeta"],"correctIndex":0},
   {"id":"a5","kind":"speaking","textJp":"口座を作りたいです。","reading":"こうざを つくりたいです","meaning":"Quiero abrir una cuenta.","voice":"Kyoko"},
   {"id":"a6","kind":"summary","learned":["銀行, 口座, お金","Abrir una cuenta","En el banco"]}
 ]}'
),
(519, 28, 'Una emergencia', 'きんきゅう',
 'Pedir ayuda en una emergencia.', 8, 3, 1,
 '{"activities":[
   {"id":"a1","kind":"intro_vocab","word":"助けて","reading":"たすけて","meaning":"¡ayuda!","example":"助けて！"},
   {"id":"a2","kind":"intro_vocab","word":"警察","reading":"けいさつ","meaning":"policía","example":"警察を呼んでください。"},
   {"id":"a3","kind":"intro_vocab","word":"救急車","reading":"きゅうきゅうしゃ","meaning":"ambulancia","example":"救急車を呼んでください。"},
   {"id":"a4","kind":"quiz","prompt":"¿Qué gritas si necesitas ayuda urgente?","options":["助けて","いただきます","はじめまして","おかえり"],"correctIndex":0},
   {"id":"a5","kind":"listening","textJp":"救急車を呼んでください。","voice":"Kyoko","prompt":"¿Qué pide?","options":["Una ambulancia","La cuenta","Un taxi","El menú"],"correctIndex":0},
   {"id":"a6","kind":"speaking","textJp":"警察を呼んでください。","reading":"けいさつを よんでください","meaning":"Llame a la policía, por favor.","voice":"Otoya"},
   {"id":"a7","kind":"summary","learned":["助けて, 警察, 救急車","Pedir ayuda","En una emergencia"]}
 ]}'
);

INSERT OR IGNORE INTO lesson_progress (lesson_id, status)
    SELECT id, 'available' FROM lessons WHERE id BETWEEN 511 AND 599;
