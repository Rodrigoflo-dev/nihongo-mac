-- 020_more_reading_listening.sql
-- More real-life reading passages (travel/daily situations) + more listening
-- dialogues, and extra comprehension questions on the original 3 listenings.
-- All Japanese is hand-written and verified N5. INSERT OR IGNORE for new rows.

-- ---------------------------------------------------------------------------
-- READING: 5 new passages (ids 6-10), 3 comprehension questions each
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO reading_passages (id, title, jlpt_level, summary, text_jp, text_translation, questions, ordering, is_seed) VALUES
(6, 'En el aeropuerto', 'N5', 'Llegar al aeropuerto y pasar migración',
 'すみません、パスポートをお願いします。 はい、どうぞ。 旅行は何日間ですか。 七日間です。 では、楽しい旅行を。',
 'Disculpe, su pasaporte por favor.\nSí, aquí tiene.\n¿Cuántos días es su viaje?\nSiete días.\nQue tenga buen viaje.',
 '{"questions":[{"id":"q1","prompt":"¿Qué le piden a la persona?","options":[{"text":"El boleto","correct":false},{"text":"El pasaporte","correct":true},{"text":"La maleta","correct":false}]},{"id":"q2","prompt":"¿Cuántos días dura el viaje?","options":[{"text":"7 días","correct":true},{"text":"5 días","correct":false},{"text":"10 días","correct":false}]},{"id":"q3","prompt":"¿Qué le desean al final?","options":[{"text":"Buen viaje","correct":true},{"text":"Buenas noches","correct":false},{"text":"Buen provecho","correct":false}]}]}',
 6, 1),

(7, 'En el hotel', 'N5', 'Registrarse en la recepción del hotel',
 'こんばんは。予約した田中です。 はい、田中様ですね。お部屋は305号室です。 朝ごはんは何時からですか。 七時からです。',
 'Buenas noches. Soy Tanaka, tengo reserva.\nSí, señor Tanaka. Su habitación es la 305.\n¿Desde qué hora es el desayuno?\nDesde las siete.',
 '{"questions":[{"id":"q1","prompt":"¿Cómo se llama el huésped?","options":[{"text":"Tanaka","correct":true},{"text":"Yamada","correct":false},{"text":"Suzuki","correct":false}]},{"id":"q2","prompt":"¿Cuál es el número de habitación?","options":[{"text":"305","correct":true},{"text":"503","correct":false},{"text":"350","correct":false}]},{"id":"q3","prompt":"¿A qué hora empieza el desayuno?","options":[{"text":"A las 7","correct":true},{"text":"A las 8","correct":false},{"text":"A las 6","correct":false}]}]}',
 7, 1),

(8, 'En la tienda', 'N5', 'Comprar en una tienda de conveniencia',
 'いらっしゃいませ。 このお弁当をください。 あたためますか。 はい、お願いします。 五百円です。',
 'Bienvenido.\nDeme este obento, por favor.\n¿Se lo caliento?\nSí, por favor.\nSon 500 yenes.',
 '{"questions":[{"id":"q1","prompt":"¿Qué compra la persona?","options":[{"text":"Un obento","correct":true},{"text":"Un café","correct":false},{"text":"Un periódico","correct":false}]},{"id":"q2","prompt":"¿Qué le pregunta el empleado?","options":[{"text":"Si lo calienta","correct":true},{"text":"Si quiere bolsa","correct":false},{"text":"Si paga con tarjeta","correct":false}]},{"id":"q3","prompt":"¿Cuánto cuesta?","options":[{"text":"500 yenes","correct":true},{"text":"100 yenes","correct":false},{"text":"1000 yenes","correct":false}]}]}',
 8, 1),

(9, 'Estoy perdido', 'N5', 'Pedir ayuda cuando te pierdes',
 'すみません、道に迷いました。 駅はどこですか。 まっすぐ行って、右に曲がってください。 近いですか。 はい、五分くらいです。',
 'Disculpe, me perdí.\n¿Dónde está la estación?\nSiga derecho y gire a la derecha.\n¿Está cerca?\nSí, unos cinco minutos.',
 '{"questions":[{"id":"q1","prompt":"¿Qué busca la persona?","options":[{"text":"La estación","correct":true},{"text":"El hotel","correct":false},{"text":"El baño","correct":false}]},{"id":"q2","prompt":"¿Hacia dónde debe girar?","options":[{"text":"A la derecha","correct":true},{"text":"A la izquierda","correct":false},{"text":"Hacia atrás","correct":false}]},{"id":"q3","prompt":"¿Está lejos?","options":[{"text":"No, unos 5 minutos","correct":true},{"text":"Sí, muy lejos","correct":false},{"text":"Una hora","correct":false}]}]}',
 9, 1),

(10, 'En la farmacia', 'N5', 'Comprar medicina cuando te sientes mal',
 'どうしましたか。 頭が痛いです。 この薬を飲んでください。 一日に何回ですか。 朝と夜、二回です。 お大事に。',
 '¿Qué le pasa?\nMe duele la cabeza.\nTome este medicamento.\n¿Cuántas veces al día?\nDos veces, mañana y noche.\nCuídese.',
 '{"questions":[{"id":"q1","prompt":"¿Qué le duele?","options":[{"text":"La cabeza","correct":true},{"text":"El estómago","correct":false},{"text":"La garganta","correct":false}]},{"id":"q2","prompt":"¿Cuántas veces al día debe tomar la medicina?","options":[{"text":"2 veces","correct":true},{"text":"3 veces","correct":false},{"text":"1 vez","correct":false}]},{"id":"q3","prompt":"¿Cuándo debe tomarla?","options":[{"text":"Mañana y noche","correct":true},{"text":"Solo de noche","correct":false},{"text":"Después de comer","correct":false}]}]}',
 10, 1);

-- ---------------------------------------------------------------------------
-- LISTENING: 7 new dialogues (ids 4-10), 3 comprehension questions each
-- ---------------------------------------------------------------------------
INSERT OR IGNORE INTO listening_dialogues (id, title, jlpt_level, description, transcript_jp, transcript_translation, voice, questions, ordering, is_seed) VALUES
(4, 'En la cafetería', 'N5', 'Pedir algo de tomar',
 'いらっしゃいませ。ご注文は？ アイスコーヒーをひとつください。 かしこまりました。三百八十円です。',
 'Bienvenido. ¿Qué va a ordenar?\nUn café helado, por favor.\nDe acuerdo. Son 380 yenes.',
 'Kyoko',
 '{"questions":[{"id":"q1","prompt":"¿Qué pide la persona?","options":[{"text":"Café helado","correct":true},{"text":"Té caliente","correct":false},{"text":"Jugo","correct":false}]},{"id":"q2","prompt":"¿Cuántos pide?","options":[{"text":"Uno","correct":true},{"text":"Dos","correct":false},{"text":"Tres","correct":false}]},{"id":"q3","prompt":"¿Cuánto cuesta?","options":[{"text":"380 yenes","correct":true},{"text":"180 yenes","correct":false},{"text":"830 yenes","correct":false}]}]}',
 4, 1),

(5, 'De compras', 'N5', 'Preguntar el precio de algo',
 'すみません、これはいくらですか。 そのTシャツは千二百円です。 じゃあ、これをください。 ありがとうございます。',
 'Disculpe, ¿cuánto cuesta esto?\nEsa camiseta cuesta 1200 yenes.\nEntonces, deme esta.\nGracias.',
 'Otoya',
 '{"questions":[{"id":"q1","prompt":"¿Qué quiere comprar?","options":[{"text":"Una camiseta","correct":true},{"text":"Un sombrero","correct":false},{"text":"Zapatos","correct":false}]},{"id":"q2","prompt":"¿Cuánto cuesta?","options":[{"text":"1200 yenes","correct":true},{"text":"2100 yenes","correct":false},{"text":"1000 yenes","correct":false}]},{"id":"q3","prompt":"¿Qué decide hacer?","options":[{"text":"Comprarla","correct":true},{"text":"No comprar nada","correct":false},{"text":"Buscar otra tienda","correct":false}]}]}',
 5, 1),

(6, 'Pedir indicaciones', 'N5', 'Cómo llegar a un lugar',
 'すみません、銀行はどこですか。 あの信号を右に曲がってください。 遠いですか。 いいえ、すぐそこです。',
 'Disculpe, ¿dónde está el banco?\nGire a la derecha en ese semáforo.\n¿Está lejos?\nNo, está ahí mismo.',
 'Kyoko',
 '{"questions":[{"id":"q1","prompt":"¿Qué lugar busca?","options":[{"text":"El banco","correct":true},{"text":"El correo","correct":false},{"text":"La escuela","correct":false}]},{"id":"q2","prompt":"¿Dónde debe girar?","options":[{"text":"En el semáforo, a la derecha","correct":true},{"text":"En la esquina, a la izquierda","correct":false},{"text":"Después del puente","correct":false}]},{"id":"q3","prompt":"¿Está lejos?","options":[{"text":"No, está cerca","correct":true},{"text":"Sí, muy lejos","correct":false},{"text":"A 30 minutos","correct":false}]}]}',
 6, 1),

(7, 'En el restaurante', 'N5', 'Hacer un pedido en un restaurante',
 'ご注文はお決まりですか。 はい、ラーメンをふたつお願いします。 お飲み物は？ お水でいいです。',
 '¿Ya decidió su pedido?\nSí, dos ramen por favor.\n¿Y para tomar?\nCon agua está bien.',
 'Otoya',
 '{"questions":[{"id":"q1","prompt":"¿Qué pide?","options":[{"text":"Ramen","correct":true},{"text":"Sushi","correct":false},{"text":"Curry","correct":false}]},{"id":"q2","prompt":"¿Cuántos pide?","options":[{"text":"Dos","correct":true},{"text":"Uno","correct":false},{"text":"Tres","correct":false}]},{"id":"q3","prompt":"¿Qué quiere para tomar?","options":[{"text":"Agua","correct":true},{"text":"Té","correct":false},{"text":"Cerveza","correct":false}]}]}',
 7, 1),

(8, 'En la estación', 'N5', 'Comprar un boleto de tren',
 '大阪までの切符を一枚ください。 千五百円です。 何番線ですか。 二番線です。',
 'Un boleto a Osaka, por favor.\nSon 1500 yenes.\n¿Qué andén?\nEl andén número 2.',
 'Kyoko',
 '{"questions":[{"id":"q1","prompt":"¿A dónde va?","options":[{"text":"Osaka","correct":true},{"text":"Tokio","correct":false},{"text":"Nagoya","correct":false}]},{"id":"q2","prompt":"¿Cuántos boletos compra?","options":[{"text":"Uno","correct":true},{"text":"Dos","correct":false},{"text":"Tres","correct":false}]},{"id":"q3","prompt":"¿Qué andén?","options":[{"text":"El número 2","correct":true},{"text":"El número 3","correct":false},{"text":"El número 5","correct":false}]}]}',
 8, 1),

(9, 'Presentación', 'N5', 'Conocer a alguien por primera vez',
 'はじめまして。山田です。 はじめまして。私はマリアです。 どうぞよろしくお願いします。 こちらこそ、よろしくお願いします。',
 'Mucho gusto. Soy Yamada.\nMucho gusto. Yo soy María.\nEncantado.\nIgualmente, encantada.',
 'Otoya',
 '{"questions":[{"id":"q1","prompt":"¿Cómo se llama el hombre?","options":[{"text":"Yamada","correct":true},{"text":"Tanaka","correct":false},{"text":"Sato","correct":false}]},{"id":"q2","prompt":"¿Cómo se llama la mujer?","options":[{"text":"María","correct":true},{"text":"Yuki","correct":false},{"text":"Ana","correct":false}]},{"id":"q3","prompt":"¿Qué situación es?","options":[{"text":"Se conocen por primera vez","correct":true},{"text":"Se despiden","correct":false},{"text":"Discuten","correct":false}]}]}',
 9, 1),

(10, 'En el hotel', 'N5', 'Llegar a la recepción del hotel',
 'チェックインをお願いします。 お名前は？ スミスです。 はい、お部屋は二階の210号室です。',
 'Quisiera hacer el check-in.\n¿Su nombre?\nSmith.\nBien, su habitación es la 210, en el segundo piso.',
 'Kyoko',
 '{"questions":[{"id":"q1","prompt":"¿Qué quiere hacer?","options":[{"text":"Check-in","correct":true},{"text":"Check-out","correct":false},{"text":"Pedir comida","correct":false}]},{"id":"q2","prompt":"¿Cómo se llama?","options":[{"text":"Smith","correct":true},{"text":"Jones","correct":false},{"text":"Brown","correct":false}]},{"id":"q3","prompt":"¿En qué piso está la habitación?","options":[{"text":"Segundo piso","correct":true},{"text":"Primer piso","correct":false},{"text":"Tercer piso","correct":false}]}]}',
 10, 1);

-- ---------------------------------------------------------------------------
-- Add more comprehension questions to the original 3 listenings (had only 1)
-- ---------------------------------------------------------------------------
UPDATE listening_dialogues SET questions =
 '{"questions":[{"id":"q1","prompt":"¿Qué momento del día es?","options":[{"text":"Mañana","correct":true},{"text":"Tarde","correct":false},{"text":"Noche","correct":false}]},{"id":"q2","prompt":"¿De qué habla además del saludo?","options":[{"text":"Del buen tiempo","correct":true},{"text":"De la comida","correct":false},{"text":"Del trabajo","correct":false}]},{"id":"q3","prompt":"¿Cómo es el tono?","options":[{"text":"Amable y cortés","correct":true},{"text":"Enojado","correct":false},{"text":"Triste","correct":false}]}]}'
 WHERE id = 1;
