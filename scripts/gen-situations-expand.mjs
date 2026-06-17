#!/usr/bin/env node
/**
 * Generates migration 015_situations_expand.sql — expands each of the 5
 * "Situaciones de la vida real" units (101..105) from 1 to 10 lessons with
 * verified, concise N5 situational Japanese. activities_json uses the object
 * form {"activities":[...]} required by the Rust parser.
 *
 * Run: node scripts/gen-situations-expand.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "src-tauri", "migrations", "015_situations_expand.sql");

const V = (id, word, reading, meaning, example) => ({ id, kind: "intro_vocab", word, reading, meaning, example });
const Q = (id, prompt, options, correctIndex, explanation) => ({ id, kind: "quiz", prompt, options, correctIndex, explanation });
const S = (id, textJp, reading, meaning, voice) => ({ id, kind: "speaking", textJp, reading, meaning, voice });
const L = (id, textJp, voice, prompt, options, correctIndex, explanation) => ({ id, kind: "listening", textJp, voice, prompt, options, correctIndex, explanation });
const W = (id, prompt, hint, accepted, explanation) => ({ id, kind: "write_sentence", prompt, hint, accepted, explanation });
const SUM = (id, learned) => ({ id, kind: "summary", learned });

// Each unit: [unitId, prefix, [9 lessons]]. Lesson = {title, jp, summary, acts}
const units = [
  [101, "r", "En el restaurante", [
    { title: "Reservar una mesa", jp: "予約する", summary: "Pide una mesa para X personas.",
      acts: [
        V("ra1", "予約", "よやく", "reserva", "予約をおねがいします。"),
        V("ra2", "二人", "ふたり", "dos personas", "二人です。"),
        Q("rq1", "'Una reserva, por favor' es…", ["予約をおねがいします。", "予約はどこですか。", "予約を食べます。"], 0, "〜をおねがいします para pedir cortés."),
        S("rs1", "二人、おねがいします。", "ふたり、おねがいします", "Para dos, por favor.", "Kyoko"),
        SUM("rsum1", ["予約 (よやく)", "二人 (ふたり)", "〜をおねがいします"]),
      ] },
    { title: "Una mesa junto a la ventana", jp: "席", summary: "Pide un buen asiento.",
      acts: [
        V("rb1", "席", "せき", "asiento", "窓の席がいいです。"),
        V("rb2", "窓", "まど", "ventana", "窓の近く"),
        Q("rq2", "'asiento' en japonés es…", ["せき", "まど", "みせ"], 0, "席 = せき = asiento."),
        S("rs2", "窓の席をおねがいします。", "まどのせきをおねがいします", "Un asiento junto a la ventana, por favor.", "Otoya"),
        SUM("rsum2", ["席 (せき)", "窓 (まど)"]),
      ] },
    { title: "Leer el menú", jp: "メニュー", summary: "Entiende el menú y sus secciones.",
      acts: [
        V("rc1", "おすすめ", "おすすめ", "recomendación", "おすすめは何ですか。"),
        Q("rq3", "Para preguntar la recomendación dices…", ["おすすめは何ですか。", "おすすめはどこですか。", "おすすめをください。"], 0, "何ですか = ¿qué es?"),
        L("rl1", "本日のおすすめです。", "Kyoko", "¿Qué te dice el mesero?", ["Es la recomendación de hoy", "Está cerrado", "Es muy caro"], 0, "本日 = hoy; おすすめ = recomendación."),
        SUM("rsum3", ["おすすめ (recomendación)", "何ですか (¿qué es?)"]),
      ] },
    { title: "Pedir bebidas", jp: "飲み物", summary: "Ordena bebidas.",
      acts: [
        V("rd1", "お水", "おみず", "agua", "お水をください。"),
        V("rd2", "ビール", "びーる", "cerveza", "ビールをひとつ。"),
        W("rw1", "Pide agua, por favor.", "お水 + を + ください", ["お水をください", "お水をください。", "おみずをください"], "〜をください para pedir."),
        SUM("rsum4", ["お水 (おみず)", "ビール (cerveza)"]),
      ] },
    { title: "Hacer tu pedido", jp: "注文", summary: "Di 'esto, por favor' señalando el menú.",
      acts: [
        V("re1", "これ", "これ", "esto", "これをください。"),
        Q("rq4", "Señalando el menú, 'esto por favor' es…", ["これをください。", "これは何ですか。", "これはどこですか。"], 0, "これ = esto; をください = por favor."),
        S("rs3", "これをおねがいします。", "これをおねがいします", "Esto, por favor.", "Kyoko"),
        SUM("rsum5", ["これ (esto)", "これをください"]),
      ] },
    { title: "No puedo comer…", jp: "アレルギー", summary: "Avisa de algo que no puedes comer.",
      acts: [
        V("rf1", "食べられません", "たべられません", "no puedo comer", "卵が食べられません。"),
        V("rf2", "卵", "たまご", "huevo", "卵料理"),
        Q("rq5", "'No puedo comer huevo' usa…", ["食べられません", "食べます", "飲みます"], 0, "食べられません = no poder comer."),
        SUM("rsum6", ["食べられません", "卵 (たまご)"]),
      ] },
    { title: "Pedir la cuenta", jp: "お会計", summary: "Pide la cuenta al final.",
      acts: [
        V("rg1", "お会計", "おかいけい", "la cuenta", "お会計、おねがいします。"),
        Q("rq6", "Para pedir la cuenta dices…", ["お会計、おねがいします。", "お会計はどこですか。", "お会計を食べます。"], 0, "お会計 = la cuenta."),
        S("rs4", "お会計、おねがいします。", "おかいけい、おねがいします", "La cuenta, por favor.", "Otoya"),
        SUM("rsum7", ["お会計 (おかいけい)"]),
      ] },
    { title: "Pagar", jp: "支払い", summary: "Paga con tarjeta o efectivo.",
      acts: [
        V("rh1", "カード", "かーど", "tarjeta", "カードでおねがいします。"),
        V("rh2", "現金", "げんきん", "efectivo", "現金で払います。"),
        Q("rq7", "'Con tarjeta, por favor' es…", ["カードでおねがいします。", "カードはどこですか。", "カードを食べます。"], 0, "で indica el medio: con tarjeta."),
        SUM("rsum8", ["カード (tarjeta)", "現金 (げんきん)", "〜でおねがいします"]),
      ] },
    { title: "Estuvo delicioso", jp: "おいしい", summary: "Elogia la comida y despídete.",
      acts: [
        V("ri1", "おいしい", "おいしい", "delicioso", "おいしいです。"),
        V("ri2", "ごちそうさま", "ごちそうさま", "gracias por la comida", "ごちそうさまでした。"),
        S("rs5", "おいしかったです。ごちそうさまでした。", "おいしかったです。ごちそうさまでした", "Estuvo delicioso. Gracias por la comida.", "Kyoko"),
        SUM("rsum9", ["おいしい (delicioso)", "ごちそうさま (gracias por la comida)"]),
      ] },
  ]],
  [102, "p", "Presentarte", [
    { title: "¿De dónde eres?", jp: "出身", summary: "Di tu país de origen.",
      acts: [
        V("pa1", "出身", "しゅっしん", "lugar de origen", "メキシコ出身です。"),
        V("pa2", "国", "くに", "país", "国はどこですか。"),
        Q("pq1", "'¿De dónde eres?' es…", ["出身はどこですか。", "出身は何ですか。", "出身をください。"], 0, "出身 = origen; どこ = dónde."),
        S("ps1", "メキシコ出身です。", "メキシコしゅっしんです", "Soy de México.", "Otoya"),
        SUM("psum1", ["出身 (しゅっしん)", "国 (くに)"]),
      ] },
    { title: "Tu nombre completo", jp: "名前", summary: "Di y pregunta el nombre.",
      acts: [
        V("pb1", "名前", "なまえ", "nombre", "お名前は？"),
        Q("pq2", "Para preguntar el nombre, cortés:", ["お名前は何ですか。", "名前はどこですか。", "名前を食べます。"], 0, "お〜 hace la pregunta más cortés."),
        W("pw1", "Escribe: 'Me llamo Ana.'", "私 + は + アナ + です", ["私はアナです", "私はアナです。", "わたしはアナです"], "X は Y です."),
        SUM("psum2", ["名前 (なまえ)", "お名前は何ですか"]),
      ] },
    { title: "Tu edad", jp: "年齢", summary: "Di cuántos años tienes.",
      acts: [
        V("pc1", "歳", "さい", "años (edad)", "二十歳です。"),
        V("pc2", "何歳", "なんさい", "¿cuántos años?", "何歳ですか。"),
        Q("pq3", "'¿Cuántos años tienes?' es…", ["何歳ですか。", "何時ですか。", "何ですか。"], 0, "何歳 = cuántos años."),
        SUM("psum3", ["歳 (さい)", "何歳 (なんさい)"]),
      ] },
    { title: "Tu trabajo", jp: "仕事", summary: "Di a qué te dedicas.",
      acts: [
        V("pd1", "仕事", "しごと", "trabajo", "仕事は何ですか。"),
        V("pd2", "会社員", "かいしゃいん", "empleado de empresa", "会社員です。"),
        Q("pq4", "'¿En qué trabajas?' es…", ["仕事は何ですか。", "仕事はどこですか。", "仕事を食べます。"], 0, "仕事 = trabajo; 何 = qué."),
        S("ps2", "会社員です。", "かいしゃいんです", "Soy empleado de empresa.", "Kyoko"),
        SUM("psum4", ["仕事 (しごと)", "会社員 (かいしゃいん)"]),
      ] },
    { title: "Tus pasatiempos", jp: "趣味", summary: "Habla de lo que te gusta hacer.",
      acts: [
        V("pe1", "趣味", "しゅみ", "pasatiempo", "趣味は音楽です。"),
        V("pe2", "映画", "えいが", "película / cine", "映画が好きです。"),
        W("pw2", "Escribe: 'Me gusta el cine.'", "映画 + が + 好き + です", ["映画が好きです", "映画が好きです。", "えいががすきです"], "〜が好きです = me gusta."),
        SUM("psum5", ["趣味 (しゅみ)", "映画 (えいが)"]),
      ] },
    { title: "Idiomas que hablas", jp: "言語", summary: "Di qué idiomas hablas.",
      acts: [
        V("pf1", "スペイン語", "すぺいんご", "español (idioma)", "スペイン語を話します。"),
        V("pf2", "話します", "はなします", "hablar", "日本語を話します。"),
        Q("pq5", "'Hablo japonés' es…", ["日本語を話します。", "日本語を食べます。", "日本語はどこですか。"], 0, "話します = hablar."),
        SUM("psum6", ["スペイン語 (español)", "話します (hablar)"]),
      ] },
    { title: "Mucho gusto", jp: "はじめまして", summary: "La frase clave de presentación.",
      acts: [
        V("pg1", "はじめまして", "はじめまして", "mucho gusto", "はじめまして。"),
        S("ps3", "はじめまして。よろしくおねがいします。", "はじめまして。よろしくおねがいします", "Mucho gusto. Encantado.", "Otoya"),
        L("pl1", "こちらこそ。", "Kyoko", "Te responden 'こちらこそ'. Significa…", ["El gusto es mío", "Adiós", "No"], 0, "こちらこそ = el gusto es mío."),
        SUM("psum7", ["はじめまして", "よろしくおねがいします"]),
      ] },
    { title: "Intercambiar contacto", jp: "連絡先", summary: "Pide el contacto de alguien.",
      acts: [
        V("ph1", "電話番号", "でんわばんごう", "número de teléfono", "電話番号は？"),
        Q("pq6", "Para pedir el teléfono dices…", ["電話番号をおしえてください。", "電話番号を食べます。", "電話番号はおいしいです。"], 0, "おしえてください = por favor dime/enséñame."),
        SUM("psum8", ["電話番号 (でんわばんごう)", "おしえてください"]),
      ] },
    { title: "Despedirse", jp: "さようなら", summary: "Despídete con cortesía.",
      acts: [
        V("pi1", "また", "また", "de nuevo / hasta", "また明日。"),
        V("pi2", "さようなら", "さようなら", "adiós", "さようなら。"),
        S("ps4", "また明日。さようなら。", "またあした。さようなら", "Hasta mañana. Adiós.", "Kyoko"),
        SUM("psum9", ["また (de nuevo)", "さようなら (adiós)"]),
      ] },
  ]],
  [103, "s", "De compras", [
    { title: "¿Cuánto cuesta?", jp: "いくら", summary: "Pregunta precios.",
      acts: [
        V("sa1", "いくら", "いくら", "cuánto", "いくらですか。"),
        Q("sq1", "'¿Cuánto cuesta esto?' es…", ["これはいくらですか。", "これは何ですか。", "これはどこですか。"], 0, "いくら = cuánto."),
        S("ss1", "これはいくらですか。", "これはいくらですか", "¿Cuánto cuesta esto?", "Otoya"),
        SUM("ssum1", ["いくら (cuánto)"]),
      ] },
    { title: "Tallas", jp: "サイズ", summary: "Pide otra talla.",
      acts: [
        V("sb1", "サイズ", "さいず", "talla", "Mサイズです。"),
        V("sb2", "大きい", "おおきい", "grande", "大きいサイズ"),
        Q("sq2", "'grande' es…", ["大きい", "小さい", "高い"], 0, "大きい = おおきい = grande."),
        SUM("ssum2", ["サイズ (talla)", "大きい (おおきい)"]),
      ] },
    { title: "Colores", jp: "色", summary: "Pide otro color.",
      acts: [
        V("sc1", "色", "いろ", "color", "ほかの色は？"),
        V("sc2", "黒", "くろ", "negro", "黒いかばん"),
        W("sw1", "Pregunta: '¿Cuánto cuesta esto?'", "これ + は + いくら + ですか", ["これはいくらですか", "これはいくらですか。"], "いくらですか = ¿cuánto cuesta?"),
        SUM("ssum3", ["色 (いろ)", "黒 (くろ)"]),
      ] },
    { title: "Probarse ropa", jp: "試着", summary: "Pide probarte algo.",
      acts: [
        V("sd1", "試着", "しちゃく", "probarse (ropa)", "試着してもいいですか。"),
        Q("sq3", "'¿Puedo probármelo?' es…", ["試着してもいいですか。", "試着はどこですか。", "試着を食べます。"], 0, "〜てもいいですか = ¿puedo…?"),
        SUM("ssum4", ["試着 (しちゃく)", "〜てもいいですか"]),
      ] },
    { title: "Pagar", jp: "支払い", summary: "Paga en caja.",
      acts: [
        V("se1", "カード", "かーど", "tarjeta", "カードで。"),
        V("se2", "袋", "ふくろ", "bolsa", "袋はいりますか。"),
        L("sl1", "袋はいりますか。", "Kyoko", "¿Qué te preguntan en caja?", ["¿Necesita bolsa?", "¿Cuánto es?", "¿Su nombre?"], 0, "袋 = bolsa; いりますか = ¿necesita?"),
        SUM("ssum5", ["カード (tarjeta)", "袋 (ふくろ)"]),
      ] },
    { title: "Descuentos", jp: "割引", summary: "Pregunta por ofertas.",
      acts: [
        V("sf1", "安い", "やすい", "barato", "安いです。"),
        V("sf2", "高い", "たかい", "caro", "高いです。"),
        Q("sq4", "'barato' es…", ["安い", "高い", "大きい"], 0, "安い = やすい = barato."),
        SUM("ssum6", ["安い (やすい)", "高い (たかい)"]),
      ] },
    { title: "En el conbini", jp: "コンビニ", summary: "Compra en una tienda 24h.",
      acts: [
        V("sg1", "コンビニ", "こんびに", "tienda de conveniencia", "コンビニに行きます。"),
        V("sg2", "お弁当", "おべんとう", "bento (almuerzo)", "お弁当をください。"),
        S("ss2", "お弁当をひとつください。", "おべんとうをひとつください", "Un bento, por favor.", "Otoya"),
        SUM("ssum7", ["コンビニ (conbini)", "お弁当 (おべんとう)"]),
      ] },
    { title: "Cantidades", jp: "数", summary: "Pide varias unidades.",
      acts: [
        V("sh1", "ひとつ", "ひとつ", "uno (cosa)", "ひとつください。"),
        V("sh2", "ふたつ", "ふたつ", "dos (cosas)", "ふたつください。"),
        Q("sq5", "'Dos, por favor' es…", ["ふたつください。", "ひとつください。", "いくつですか。"], 0, "ふたつ = dos cosas."),
        SUM("ssum8", ["ひとつ (uno)", "ふたつ (dos)"]),
      ] },
    { title: "Gracias por su compra", jp: "ありがとう", summary: "Cierre cortés de la compra.",
      acts: [
        V("si1", "ありがとう", "ありがとう", "gracias", "ありがとうございます。"),
        L("sl2", "ありがとうございました。", "Kyoko", "Al pagar te dicen…", ["Muchas gracias", "Bienvenido", "Disculpe"], 0, "ありがとうございました = muchas gracias."),
        SUM("ssum9", ["ありがとう (gracias)"]),
      ] },
  ]],
  [104, "e", "En la estación", [
    { title: "Comprar un boleto", jp: "切符", summary: "Compra tu billete.",
      acts: [
        V("ea1", "切符", "きっぷ", "boleto", "切符をください。"),
        V("ea2", "一枚", "いちまい", "uno (plano)", "切符を一枚ください。"),
        Q("eq1", "'Un boleto, por favor' es…", ["切符を一枚ください。", "切符はどこですか。", "切符を食べます。"], 0, "一枚 = un (objeto plano)."),
        S("es1", "東京まで、一枚ください。", "とうきょうまで、いちまいください", "Uno hasta Tokio, por favor.", "Otoya"),
        SUM("esum1", ["切符 (きっぷ)", "一枚 (いちまい)", "〜まで (hasta)"]),
      ] },
    { title: "¿Dónde está la estación?", jp: "駅", summary: "Pregunta por la estación.",
      acts: [
        V("eb1", "駅", "えき", "estación", "駅はどこですか。"),
        Q("eq2", "'¿Dónde está la estación?' es…", ["駅はどこですか。", "駅は何ですか。", "駅をください。"], 0, "どこ = dónde."),
        S("es2", "すみません、駅はどこですか。", "すみません、えきはどこですか", "Disculpe, ¿dónde está la estación?", "Kyoko"),
        SUM("esum2", ["駅 (えき)", "どこですか"]),
      ] },
    { title: "El andén", jp: "ホーム", summary: "Encuentra tu andén.",
      acts: [
        V("ec1", "何番線", "なんばんせん", "¿qué andén/línea?", "何番線ですか。"),
        Q("eq3", "'¿Qué andén es?' es…", ["何番線ですか。", "何時ですか。", "何歳ですか。"], 0, "何番線 = qué número de vía."),
        SUM("esum3", ["何番線 (なんばんせん)"]),
      ] },
    { title: "Líneas de tren", jp: "電車", summary: "Identifica la línea correcta.",
      acts: [
        V("ed1", "電車", "でんしゃ", "tren", "電車に乗ります。"),
        V("ed2", "乗ります", "のります", "subir (al tren)", "電車に乗ります。"),
        Q("eq4", "'Subo al tren' es…", ["電車に乗ります。", "電車を食べます。", "電車はどこですか。"], 0, "に乗ります = subir a."),
        SUM("esum4", ["電車 (でんしゃ)", "乗ります (のります)"]),
      ] },
    { title: "El anuncio del tren", jp: "アナウンス", summary: "Entiende los anuncios.",
      acts: [
        V("ee1", "次", "つぎ", "siguiente", "次は東京です。"),
        L("el1", "次は東京です。", "Otoya", "El anuncio dice…", ["La próxima es Tokio", "Puerta cerrada", "Llega tarde"], 0, "次 = siguiente."),
        SUM("esum5", ["次 (つぎ)"]),
      ] },
    { title: "Transbordo", jp: "乗り換え", summary: "Cambia de línea.",
      acts: [
        V("ef1", "乗り換え", "のりかえ", "transbordo", "乗り換えはどこですか。"),
        Q("eq5", "'¿Dónde hago transbordo?' es…", ["乗り換えはどこですか。", "乗り換えを食べます。", "乗り換えはおいしいです。"], 0, "乗り換え = transbordo."),
        SUM("esum6", ["乗り換え (のりかえ)"]),
      ] },
    { title: "La salida", jp: "出口", summary: "Encuentra la salida.",
      acts: [
        V("eg1", "出口", "でぐち", "salida", "出口はどこですか。"),
        V("eg2", "入口", "いりぐち", "entrada", "入口はあそこです。"),
        W("ew1", "Pregunta: '¿Dónde está la salida?'", "出口 + は + どこ + ですか", ["出口はどこですか", "出口はどこですか。", "でぐちはどこですか"], "出口 (でぐち) = salida."),
        SUM("esum7", ["出口 (でぐち)", "入口 (いりぐち)"]),
      ] },
    { title: "El horario", jp: "時間", summary: "Pregunta a qué hora sale.",
      acts: [
        V("eh1", "何時", "なんじ", "¿qué hora?", "何時ですか。"),
        Q("eq6", "'¿A qué hora sale?' empieza con…", ["何時", "何番線", "どこ"], 0, "何時 = qué hora."),
        SUM("esum8", ["何時 (なんじ)"]),
      ] },
    { title: "Pedir ayuda", jp: "すみません", summary: "Pide ayuda con cortesía.",
      acts: [
        V("ei1", "すみません", "すみません", "disculpe", "すみません。"),
        S("es3", "すみません、ちょっといいですか。", "すみません、ちょっといいですか", "Disculpe, ¿tiene un momento?", "Kyoko"),
        SUM("esum9", ["すみません (disculpe)"]),
      ] },
  ]],
  [105, "c", "En el café", [
    { title: "Pedir un café", jp: "コーヒー", summary: "Ordena tu bebida.",
      acts: [
        V("ca1", "コーヒー", "こーひー", "café", "コーヒーをください。"),
        Q("cq1", "'Un café, por favor' es…", ["コーヒーをください。", "コーヒーはどこですか。", "コーヒーを食べます。"], 0, "〜をください."),
        S("cs1", "コーヒーをひとつください。", "こーひーをひとつください", "Un café, por favor.", "Kyoko"),
        SUM("csum1", ["コーヒー (café)"]),
      ] },
    { title: "Tamaños", jp: "サイズ", summary: "Elige el tamaño.",
      acts: [
        V("cb1", "大きい", "おおきい", "grande", "大きいサイズ"),
        V("cb2", "小さい", "ちいさい", "pequeño", "小さいサイズ"),
        Q("cq2", "'pequeño' es…", ["小さい", "大きい", "高い"], 0, "小さい = ちいさい = pequeño."),
        SUM("csum2", ["大きい (grande)", "小さい (pequeño)"]),
      ] },
    { title: "¿Para aquí o para llevar?", jp: "テイクアウト", summary: "Responde dónde lo tomarás.",
      acts: [
        V("cc1", "ここで", "ここで", "aquí", "ここで飲みます。"),
        V("cc2", "持ち帰り", "もちかえり", "para llevar", "持ち帰りで。"),
        L("cl1", "店内ですか、お持ち帰りですか。", "Otoya", "¿Qué te preguntan?", ["¿Para aquí o para llevar?", "¿Cuánto es?", "¿Su nombre?"], 0, "店内 = aquí; 持ち帰り = para llevar."),
        SUM("csum3", ["ここで (aquí)", "持ち帰り (もちかえり)"]),
      ] },
    { title: "Leche y azúcar", jp: "ミルク", summary: "Personaliza tu bebida.",
      acts: [
        V("cd1", "ミルク", "みるく", "leche", "ミルクをおねがいします。"),
        V("cd2", "砂糖", "さとう", "azúcar", "砂糖はいりません。"),
        Q("cq3", "'No necesito azúcar' usa…", ["いりません", "ください", "おいしい"], 0, "いりません = no necesito."),
        SUM("csum4", ["ミルク (leche)", "砂糖 (さとう)"]),
      ] },
    { title: "Postres", jp: "ケーキ", summary: "Pide algo dulce.",
      acts: [
        V("ce1", "ケーキ", "けーき", "pastel", "ケーキをください。"),
        W("cw1", "Pide un café, por favor.", "コーヒー + を + ください", ["コーヒーをください", "コーヒーをください。", "こーひーをください"], "〜をください."),
        SUM("csum5", ["ケーキ (pastel)"]),
      ] },
    { title: "¿Hay wifi?", jp: "ワイファイ", summary: "Pregunta por el wifi.",
      acts: [
        V("cf1", "ワイファイ", "わいふぁい", "wifi", "ワイファイはありますか。"),
        Q("cq4", "'¿Hay wifi?' es…", ["ワイファイはありますか。", "ワイファイを食べます。", "ワイファイはおいしいです。"], 0, "ありますか = ¿hay?"),
        SUM("csum6", ["ワイファイ (wifi)", "ありますか (¿hay?)"]),
      ] },
    { title: "Esperar el pedido", jp: "待つ", summary: "Entiende que esperes un momento.",
      acts: [
        V("cg1", "少々お待ちください", "しょうしょうおまちください", "espere un momento (cortés)", "少々お待ちください。"),
        L("cl2", "少々お待ちください。", "Kyoko", "El barista dice…", ["Espere un momento", "Está cerrado", "Gracias"], 0, "お待ちください = por favor espere."),
        SUM("csum7", ["少々お待ちください (espere un momento)"]),
      ] },
    { title: "Pagar el café", jp: "支払い", summary: "Paga en la barra.",
      acts: [
        V("ch1", "全部で", "ぜんぶで", "en total", "全部でいくらですか。"),
        Q("cq5", "'¿Cuánto es en total?' es…", ["全部でいくらですか。", "全部で何ですか。", "全部でどこですか。"], 0, "全部で = en total."),
        SUM("csum8", ["全部で (en total)"]),
      ] },
    { title: "Disfruta y despídete", jp: "また", summary: "Cierra tu visita al café.",
      acts: [
        V("ci1", "おいしい", "おいしい", "delicioso", "おいしいです。"),
        S("cs2", "おいしいです。ありがとうございます。", "おいしいです。ありがとうございます", "Está delicioso. Gracias.", "Kyoko"),
        SUM("csum9", ["おいしい (delicioso)", "ありがとう (gracias)"]),
      ] },
  ]],
];

const esc = (s) => s.replace(/'/g, "''");
const jstr = (obj) => `'${esc(JSON.stringify(obj))}'`;

let sql = `-- 015_situations_expand.sql (generated by scripts/gen-situations-expand.mjs)
-- Expands the 5 Situaciones units (101..105) to 10 lessons each. Object form.

`;
let count = 0;
let acts = 0;
for (const [unitId, , , lessons] of units) {
  lessons.forEach((l, i) => {
    const id = 400 + (unitId - 101) * 20 + (i + 1); // distinct ids per unit
    const ordering = i + 2; // existing lesson is ordering 1
    count++;
    acts += l.acts.length;
    sql += `INSERT OR REPLACE INTO lessons (id, unit_id, title, jp_title, summary, duration_minutes, ordering, is_seed, activities_json) VALUES (${id}, ${unitId}, '${esc(l.title)}', '${esc(l.jp)}', '${esc(l.summary)}', 5, ${ordering}, 1, ${jstr({ activities: l.acts })});\n`;
  });
}

writeFileSync(OUT, sql);
console.log(`015_situations_expand.sql: ${count} lessons, ${acts} activities.`);
