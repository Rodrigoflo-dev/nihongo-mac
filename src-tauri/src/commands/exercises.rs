//! Procedural exercise generator.
//!
//! Instead of shipping a fixed handful of quiz questions per lesson (which made
//! everyone see the SAME questions, every run), this builds a fresh set of 20
//! graded exercises from the lesson's taught items + the kanji/vocab catalog,
//! split into three difficulty bands (fácil / medio / difícil) and shuffled with
//! a per-attempt seed so no two runs — and no two users — get the same set.
//!
//! Exercises reuse the existing `Activity::Quiz` variant, so the frontend renders
//! and grades them with the machinery it already has (select → comprobar →
//! retry-on-wrong). The only addition is a `difficulty` tag per item so the UI
//! can announce when the learner moves up a band.

use std::collections::{HashMap, HashSet};

use rand::rngs::StdRng;
use rand::seq::SliceRandom;
use rand::SeedableRng;
use rusqlite::Connection;
use serde::Serialize;
use tauri::State;

use crate::db::DbState;
use crate::error::AppResult;
use crate::models::{Activity, LessonActivities, MatchPair};

/// Real-life situational questions ("en esta situación, ¿qué dices?"). Verified
/// fixed conversation responses, mixed into every round for practical practice.
const SITUATIONS: &[(&str, &str, [&str; 3])] = &[
    ("Alguien te dice «おはようございます». ¿Qué respondes?", "おはようございます。", ["さようなら。", "おやすみなさい。", "いただきます。"]),
    ("El empleado dice «いらっしゃいませ» y quieres un café. ¿Qué dices?", "コーヒーをください。", ["ありがとう。", "さようなら。", "はじめまして。"]),
    ("Te presentan a alguien por primera vez. ¿Qué dices?", "はじめまして。", ["おかえりなさい。", "いただきます。", "おやすみ。"]),
    ("Alguien te ayudó. ¿Cómo agradeces de forma cortés?", "ありがとうございます。", ["すみません。", "ごめんなさい。", "いただきます。"]),
    ("Vas a empezar a comer. ¿Qué dices?", "いただきます。", ["ごちそうさま。", "おやすみ。", "ただいま。"]),
    ("Terminaste de comer. ¿Qué dices?", "ごちそうさまでした。", ["いただきます。", "こんばんは。", "はじめまして。"]),
    ("Llegas a casa. ¿Qué dices?", "ただいま。", ["いってきます。", "さようなら。", "こんにちは。"]),
    ("Alguien sale de casa y dice «いってきます». ¿Qué respondes?", "いってらっしゃい。", ["おかえりなさい。", "ただいま。", "おやすみ。"]),
    ("Es de noche y te vas a dormir. ¿Qué dices?", "おやすみなさい。", ["こんにちは。", "いってきます。", "はじめまして。"]),
    ("Quieres preguntar cuánto cuesta algo. ¿Qué dices?", "いくらですか。", ["どこですか。", "なんじですか。", "だれですか。"]),
    ("Necesitas disculparte para llamar la atención. ¿Qué dices?", "すみません。", ["おはよう。", "ありがとう。", "いただきます。"]),
    ("Te despides de alguien al irte. ¿Qué dices?", "さようなら。", ["おはよう。", "ただいま。", "いただきます。"]),
    // Real-life situations (restaurant / station / shop / meeting people).
    ("En un restaurante quieres el menú. ¿Qué dices?", "メニューをおねがいします。", ["おかえりなさい。", "いってきます。", "おやすみなさい。"]),
    ("Terminaste de comer y quieres pagar. ¿Qué pides?", "おかいけいをおねがいします。", ["いただきます。", "はじめまして。", "さようなら。"]),
    ("Quieres saber dónde está el baño. ¿Qué preguntas?", "トイレはどこですか。", ["いくらですか。", "なんじですか。", "だれですか。"]),
    ("Quieres saber qué hora es. ¿Qué preguntas?", "いまなんじですか。", ["いくらですか。", "どこですか。", "だれですか。"]),
    ("En una tienda quieres esto. Lo señalas y dices…", "これをください。", ["ありがとう。", "さようなら。", "はじめまして。"]),
    ("Quieres pedir agua, por favor. ¿Qué dices?", "おみずをおねがいします。", ["ただいま。", "おやすみ。", "こんばんは。"]),
    ("No entendiste; quieres que lo repitan. ¿Qué dices?", "もういちどおねがいします。", ["いただきます。", "さようなら。", "おめでとう。"]),
    ("Te presentas y cierras cortésmente. ¿Qué dices?", "どうぞよろしくおねがいします。", ["ごちそうさまでした。", "おかえりなさい。", "いってきます。"]),
    ("Quieres decir que no comes carne. ¿Qué dices?", "にくはたべません。", ["みずをのみます。", "がくせいです。", "にほんへいきます。"]),
    ("Te preguntan de dónde eres y respondes «vengo de México». ¿Qué dices?", "メキシコからきました。", ["にほんごをはなします。", "がくせいです。", "にくをたべます。"]),
    ("Quieres pedir algo de beber. ¿Qué dices?", "のみものをおねがいします。", ["おかえりなさい。", "こんにちは。", "おやすみ。"]),
    ("Entras a la casa de alguien en Japón. Al pasar dices…", "おじゃまします。", ["いってきます。", "ごちそうさま。", "はじめまして。"]),
    ("Quieres preguntar dónde está la estación. ¿Qué dices?", "えきはどこですか。", ["いくらですか。", "なんじですか。", "だれですか。"]),
];

/// Strip trailing/leading Japanese punctuation and spaces so we can match a
/// situation's answer («おやすみなさい。») against a taught surface («おやすみなさい»).
fn normalize_phrase(s: &str) -> String {
    s.trim()
        .trim_matches(|c: char| {
            matches!(
                c,
                '。' | '、' | '！' | '？' | '!' | '?' | '.' | ',' | ' ' | '　'
            )
        })
        .to_string()
}

/// Build a specific situational question (deterministic index). We only ever
/// call this with situations whose CORRECT answer the learner has already been
/// taught (see `gated_situations`), so practice never demands untaught phrases.
fn build_situation_at(rng: &mut StdRng, idx: usize, sit_index: usize) -> Activity {
    let (prompt, correct, distractors) = SITUATIONS[sit_index];
    let mut options: Vec<String> = vec![correct.to_string()];
    options.extend(distractors.iter().map(|s| s.to_string()));
    options.shuffle(rng);
    let correct_index = options.iter().position(|o| o == correct).unwrap_or(0);
    Activity::Quiz {
        id: format!("gen-sit-{idx}"),
        prompt: prompt.to_string(),
        prompt_jp: None,
        options,
        correct_index,
        explanation: Some(format!("En esa situación se dice «{correct}».")),
    }
}

/// Indices of SITUATIONS whose correct answer is within `taught` (the phrases the
/// learner has already seen, cumulatively up to this lesson), shuffled. If the
/// learner hasn't been taught any of the greetings yet (e.g. lesson 1), this is
/// empty and no situational questions are injected.
fn gated_situations(rng: &mut StdRng, taught: &HashSet<String>) -> Vec<usize> {
    let mut ok: Vec<usize> = SITUATIONS
        .iter()
        .enumerate()
        .filter(|(_, (_, correct, _))| taught.contains(&normalize_phrase(correct)))
        .map(|(i, _)| i)
        .collect();
    ok.shuffle(rng);
    ok
}

/// Clean, common Spanish meanings used as plausible wrong options for the
/// "¿qué significa?" questions (keeps distractors in Spanish, never English).
const COMMON_MEANINGS: &[&str] = &[
    "agua", "fuego", "montaña", "río", "persona", "día", "mes", "año", "sol",
    "luna", "libro", "escuela", "estudiante", "profesor", "amigo", "casa",
    "coche", "tren", "comida", "perro", "gato", "grande", "pequeño", "nuevo",
    "viejo", "blanco", "negro", "rojo", "azul", "comer", "beber", "ir", "venir",
    "ver", "hablar", "leer", "escribir", "comprar", "dinero", "tiempo",
    "mañana", "tarde", "noche", "gracias", "adiós", "arriba", "abajo", "salir",
    "entrar", "tienda", "estación", "trabajo", "ciudad", "país", "mano", "ojo",
];

const TOTAL: usize = 20;
const N_FACIL: usize = 7;
const N_MEDIO: usize = 7;
// difícil = TOTAL - N_FACIL - N_MEDIO = 6

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratedExercise {
    pub activity: Activity,
    /// "facil" | "medio" | "dificil"
    pub difficulty: String,
}

/// A quizzable item the lesson teaches (or a catalog filler at the same level).
#[derive(Clone)]
struct Item {
    /// The Japanese surface form (kanji char or vocab word).
    jp: String,
    /// Reading in kana (may be empty for single kanji where we use on/kun).
    reading: String,
    /// Spanish meaning (first/primary gloss).
    meaning: String,
    /// Whether this is a single kanji (enables reading questions from on/kun).
    is_kanji: bool,
    /// A real authored example SENTENCE that uses this item (for context/usage
    /// fill-in-the-blank questions). None if the lesson gave no usable example.
    example_jp: Option<String>,
    /// Spanish translation of the example sentence, when available.
    example_meaning: Option<String>,
}

/// Take the first gloss from a "a / b, c" style meaning string.
fn primary_gloss(s: &str) -> String {
    // Take the first sense…
    let first = s
        .split(['/', ',', '；', ';', '・'])
        .map(|x| x.trim())
        .find(|x| !x.is_empty())
        .unwrap_or(s.trim());
    // …and drop any parenthetical note so options are short and never show a
    // half-open paren like "Buenos días (formal".
    let cut = first.split(['(', '（']).next().unwrap_or(first).trim();
    if cut.is_empty() {
        first.to_string()
    } else {
        cut.to_string()
    }
}

fn parse_json_array(s: &Option<String>) -> Vec<String> {
    let Some(raw) = s else { return vec![] };
    serde_json::from_str::<Vec<String>>(raw).unwrap_or_default()
}

/// Resolve the JLPT level for a lesson via lesson → unit → course.
fn lesson_level(conn: &Connection, lesson_id: i64) -> String {
    conn.query_row(
        "SELECT c.jlpt_level
           FROM lessons l
           JOIN units u ON u.id = l.unit_id
           JOIN courses c ON c.id = u.course_id
          WHERE l.id = ?1",
        [lesson_id],
        |r| r.get::<_, String>(0),
    )
    .unwrap_or_else(|_| "N5".to_string())
}

/// Every Japanese surface form the learner has been taught CUMULATIVELY up to
/// and including this lesson (all earlier lessons in the same course, by unit /
/// lesson ordering). Used to gate situational questions so we never demand a
/// phrase the learner hasn't seen yet (e.g. greetings before they're taught).
fn cumulative_taught_surfaces(conn: &Connection, lesson_id: i64) -> HashSet<String> {
    let mut set = HashSet::new();
    // Position of the current lesson within its course.
    let pos: Option<(i64, i64, i64)> = conn
        .query_row(
            "SELECT u.course_id, u.ordering, l.ordering
               FROM lessons l JOIN units u ON u.id = l.unit_id
              WHERE l.id = ?1",
            [lesson_id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .ok();
    let Some((course_id, unit_ord, lesson_ord)) = pos else {
        return set;
    };
    let mut stmt = match conn.prepare(
        "SELECT l.activities_json
           FROM lessons l
           JOIN units u ON u.id = l.unit_id
          WHERE u.course_id = ?1
            AND (u.ordering < ?2 OR (u.ordering = ?2 AND l.ordering <= ?3))",
    ) {
        Ok(s) => s,
        Err(_) => return set,
    };
    let rows = stmt
        .query_map(rusqlite::params![course_id, unit_ord, lesson_ord], |r| {
            r.get::<_, String>(0)
        })
        .map(|it| it.filter_map(Result::ok).collect::<Vec<_>>())
        .unwrap_or_default();
    for json in rows {
        let parsed: LessonActivities = serde_json::from_str(&json).unwrap_or(LessonActivities {
            activities: vec![],
        });
        for a in parsed.activities {
            match a {
                Activity::IntroKanji { kanji_char, .. } => {
                    set.insert(normalize_phrase(&kanji_char));
                }
                Activity::IntroVocab { word, reading, .. } => {
                    set.insert(normalize_phrase(&word));
                    if !reading.is_empty() {
                        set.insert(normalize_phrase(&reading));
                    }
                }
                _ => {}
            }
        }
    }
    set
}

/// A grammar point the lesson teaches (from intro_grammar) that we can turn into
/// a "fill the particle" exercise, grounded in its authored example sentence.
#[derive(Clone)]
struct GrammarPoint {
    particle: char,
    example_jp: String,
    example_meaning: String,
}

/// Particles we quiz on (and use as distractors for each other).
const PARTICLES: &[char] = &['は', 'が', 'を', 'に', 'へ', 'で', 'の', 'と', 'か', 'も'];

/// Extract quizzable grammar points from THIS lesson's intro_grammar activities.
/// Only patterns that pivot on a single particle (は/を/に/で…) become exercises.
fn taught_grammar(conn: &Connection, lesson_id: i64) -> Vec<GrammarPoint> {
    let json: String = match conn.query_row(
        "SELECT activities_json FROM lessons WHERE id = ?1",
        [lesson_id],
        |r| r.get(0),
    ) {
        Ok(j) => j,
        Err(_) => return vec![],
    };
    let parsed: LessonActivities = serde_json::from_str(&json).unwrap_or(LessonActivities {
        activities: vec![],
    });
    let mut out = Vec::new();
    for a in parsed.activities {
        if let Activity::IntroGrammar {
            pattern, example, ..
        } = a
        {
            // The particle is the standalone particle char that appears in the
            // pattern AND inside the example sentence (so we can blank it).
            let particle = pattern
                .chars()
                .find(|c| PARTICLES.contains(c) && example.jp.contains(*c));
            if let Some(particle) = particle {
                out.push(GrammarPoint {
                    particle,
                    example_jp: example.jp.clone(),
                    example_meaning: example.meaning.clone(),
                });
            }
        }
    }
    out
}

/// "Completa con la partícula correcta" — blank the taught particle in its real
/// example sentence and let the learner pick it. Reinforces grammar with a
/// verified sentence (never invented).
fn build_grammar_blank(rng: &mut StdRng, idx: usize, gp: &GrammarPoint) -> Option<Activity> {
    let blanked = gp
        .example_jp
        .replacen(gp.particle, "＿", 1);
    let mut distractors: Vec<char> = PARTICLES
        .iter()
        .copied()
        .filter(|c| *c != gp.particle)
        .collect();
    distractors.shuffle(rng);
    distractors.truncate(3);
    make_quiz(
        rng,
        format!("gen-gram-{idx}"),
        "Completa con la partícula correcta".to_string(),
        Some(blanked),
        gp.particle.to_string(),
        distractors.iter().map(|c| c.to_string()).collect(),
        format!("{} — {}", gp.example_jp, gp.example_meaning),
    )
}

/// Items explicitly taught by the lesson (from its intro_* activities).
fn taught_items(conn: &Connection, lesson_id: i64) -> Vec<Item> {
    let json: String = match conn.query_row(
        "SELECT activities_json FROM lessons WHERE id = ?1",
        [lesson_id],
        |r| r.get(0),
    ) {
        Ok(j) => j,
        Err(_) => return vec![],
    };
    let parsed: LessonActivities = serde_json::from_str(&json).unwrap_or(LessonActivities {
        activities: vec![],
    });
    let mut items = Vec::new();
    for a in parsed.activities {
        match a {
            Activity::IntroKanji {
                kanji_char,
                meaning,
                onyomi,
                kunyomi,
                example,
                ..
            } => {
                let reading = kunyomi
                    .first()
                    .or_else(|| onyomi.first())
                    .cloned()
                    .unwrap_or_default();
                items.push(Item {
                    jp: kanji_char,
                    reading,
                    meaning: primary_gloss(&meaning),
                    is_kanji: true,
                    example_jp: example.as_ref().map(|e| e.jp.clone()),
                    example_meaning: example.as_ref().map(|e| e.meaning.clone()),
                });
            }
            Activity::IntroVocab {
                word,
                reading,
                meaning,
                example,
                ..
            } => items.push(Item {
                jp: word.clone(),
                reading,
                meaning: primary_gloss(&meaning),
                // single-character vocab still behaves like a kanji for readings
                is_kanji: word.chars().count() == 1,
                // the vocab "example" is a plain JP phrase (no translation)
                example_jp: example,
                example_meaning: None,
            }),
            _ => {}
        }
    }
    items
}

/// Catalog kanji at the level, used to fill items and to draw distractors.
fn catalog_kanji(conn: &Connection, level: &str) -> Vec<Item> {
    let mut stmt = match conn.prepare(
        "SELECT character, meaning_es, onyomi, kunyomi
           FROM kanji WHERE jlpt_level = ?1",
    ) {
        Ok(s) => s,
        Err(_) => return vec![],
    };
    let rows = stmt
        .query_map([level], |r| {
            let onyomi: Option<String> = r.get(2)?;
            let kunyomi: Option<String> = r.get(3)?;
            let reading = parse_json_array(&kunyomi)
                .into_iter()
                .next()
                .or_else(|| parse_json_array(&onyomi).into_iter().next())
                .unwrap_or_default();
            Ok(Item {
                jp: r.get(0)?,
                reading,
                meaning: primary_gloss(&r.get::<_, String>(1)?),
                is_kanji: true,
                example_jp: None,
                example_meaning: None,
            })
        })
        .map(|it| it.filter_map(Result::ok).collect::<Vec<_>>())
        .unwrap_or_default();
    rows
}

fn is_kana_char(c: char) -> bool {
    ('\u{3040}'..='\u{30FF}').contains(&c) || ('\u{31F0}'..='\u{31FF}').contains(&c)
}

/// Coarse "shape" of an answer: which script dominates (2 kanji, 1 kana, 0
/// latin/Spanish) and how many characters it has. Distractors that share the
/// shape look plausible, so the learner can't guess from length or script alone.
fn answer_shape(s: &str) -> (u8, usize) {
    let script = if s.chars().any(is_kanji_char) {
        2
    } else if s.chars().any(is_kana_char) {
        1
    } else {
        0
    };
    (script, s.chars().count())
}

/// Pull `n` distinct distractors, PREFERRING the same-theme `primary` pool (other
/// items taught in THIS lesson) and only topping up from the broad `fallback`
/// pool when the lesson doesn't have enough items of its own. Within each pool,
/// candidates are ranked so the wrong options stay plausible in TWO ways
/// (Rodrigo's request — options were too easy to tell apart):
///   1. ON-TOPIC — same-theme lesson items first (colors → other colors).
///   2. SAME SHAPE — same script + similar length, so a 4-char ます-verb never
///      sits next to a single kanji like 校, and short/long options don't give
///      the answer away.
fn pick_distractors(
    rng: &mut StdRng,
    primary: &[String],
    fallback: &[String],
    exclude: &str,
    n: usize,
) -> Vec<String> {
    let ex = exclude.trim().to_string();
    let (target_script, target_len) = answer_shape(&ex);
    let mut chosen: Vec<String> = Vec::new();
    let mut seen: HashSet<String> = HashSet::new();
    seen.insert(ex);

    for pool in [primary, fallback] {
        if chosen.len() >= n {
            break;
        }
        let mut candidates: Vec<String> = pool
            .iter()
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty() && !seen.contains(s))
            .collect();
        candidates.sort();
        candidates.dedup();
        // Shuffle first so ties (same score) come out varied across quizzes; the
        // stable sort below then ranks by shape closeness without losing that.
        candidates.shuffle(rng);
        candidates.sort_by_key(|c| {
            let (script, len) = answer_shape(c);
            let script_penalty = if script == target_script { 0 } else { 50 };
            let len_penalty = (len as i32 - target_len as i32).abs();
            script_penalty + len_penalty
        });
        for c in candidates {
            if chosen.len() >= n {
                break;
            }
            if seen.insert(c.clone()) {
                chosen.push(c);
            }
        }
    }
    chosen
}

/// Same-theme distractor pools for a lesson: the primary pools are ONLY the items
/// taught in this lesson (so wrong answers stay on-topic); the `_fb` fallbacks are
/// the broad level-wide pools, used just to top up tiny lessons.
struct DistractorPools {
    lesson_meanings: Vec<String>,
    lesson_kanji: Vec<String>,
    lesson_readings: Vec<String>,
    meaning_fb: Vec<String>,
    kanji_fb: Vec<String>,
    reading_fb: Vec<String>,
}

fn make_quiz(
    rng: &mut StdRng,
    id: String,
    prompt: String,
    prompt_jp: Option<String>,
    correct: String,
    mut distractors: Vec<String>,
    explanation: String,
) -> Option<Activity> {
    // Need at least 2 options to be a real question.
    distractors.retain(|d| d != &correct);
    if distractors.is_empty() {
        return None;
    }
    let mut options = vec![correct.clone()];
    options.append(&mut distractors);
    options.shuffle(rng);
    let correct_index = options.iter().position(|o| o == &correct)?;
    Some(Activity::Quiz {
        id,
        prompt,
        prompt_jp,
        options,
        correct_index,
        explanation: Some(explanation),
    })
}

/// Real-life USAGE question: take an authored example sentence, blank out the
/// taught word, and ask the learner to fill it in. This teaches *how the word
/// is used in context* (the whole point — speaking real Japanese), grounded in
/// verified sentences (never invented). Returns None if there's no usable
/// example sentence (e.g. the example is just the word itself).
fn build_blank_exercise(
    rng: &mut StdRng,
    idx: usize,
    item: &Item,
    pools: &DistractorPools,
) -> Option<Activity> {
    let sentence = item.example_jp.as_ref()?;
    // Needs to be an actual sentence/phrase that CONTAINS the word and is longer
    // than the word alone (otherwise blanking gives no context).
    if !sentence.contains(&item.jp)
        || sentence.chars().count() <= item.jp.chars().count()
    {
        return None;
    }
    let blanked = sentence.replacen(&item.jp, "＿＿", 1);
    let hint = item
        .example_meaning
        .clone()
        .unwrap_or_else(|| item.meaning.clone());
    let distractors = pick_distractors(rng, &pools.lesson_kanji, &pools.kanji_fb, &item.jp, 3);
    let explanation = format!("{sentence} — {hint}");
    make_quiz(
        rng,
        format!("gen-ctx-{idx}"),
        format!("Completa la frase — «{hint}»"),
        Some(blanked),
        item.jp.clone(),
        distractors,
        explanation,
    )
}

/// A fuller explanation for a wrong answer: meaning + reading + a real example,
/// so the learner actually understands the item (not just "学 = estudiar").
fn rich_explanation(item: &Item) -> String {
    let mut s = format!("{} significa «{}»", item.jp, item.meaning);
    if !item.reading.is_empty() {
        s.push_str(&format!(". Se lee {}", item.reading));
    }
    if let Some(ex) = &item.example_jp {
        if ex != &item.jp {
            match &item.example_meaning {
                Some(m) if !m.is_empty() => {
                    s.push_str(&format!(". Ejemplo: {ex} — {m}"))
                }
                _ => s.push_str(&format!(". Ejemplo: {ex}")),
            }
        }
    }
    s
}

/// Build one exercise for an item at a given difficulty band.
#[allow(clippy::too_many_arguments)]
fn build_exercise(
    rng: &mut StdRng,
    idx: usize,
    band: &str,
    item: &Item,
    pools: &DistractorPools,
) -> Option<Activity> {
    let id = format!("gen-{band}-{idx}");
    match band {
        // Recognition: see the kanji/word, pick the meaning. 3 options.
        "facil" => {
            let prompt_jp = Some(item.jp.clone());
            let distractors = pick_distractors(rng, &pools.lesson_meanings, &pools.meaning_fb, &item.meaning, 2);
            make_quiz(
                rng,
                id,
                "¿Qué significa esto?".to_string(),
                prompt_jp,
                item.meaning.clone(),
                distractors,
                rich_explanation(item),
            )
        }
        // Production: see the meaning, pick the kanji/word. 4 options.
        "medio" => {
            let distractors = pick_distractors(rng, &pools.lesson_kanji, &pools.kanji_fb, &item.jp, 3);
            make_quiz(
                rng,
                id,
                format!("¿Cuál corresponde a «{}»?", item.meaning),
                None,
                item.jp.clone(),
                distractors,
                rich_explanation(item),
            )
        }
        // Hard: reading recall (any word that CONTAINS kanji and has a reading,
        // e.g. 学生→がくせい) else meaning→word with 4 options.
        _ => {
            if !item.reading.is_empty() && item.jp.chars().any(is_kanji_char) {
                let distractors = pick_distractors(rng, &pools.lesson_readings, &pools.reading_fb, &item.reading, 3);
                make_quiz(
                    rng,
                    id,
                    "¿Cómo se lee?".to_string(),
                    Some(item.jp.clone()),
                    item.reading.clone(),
                    distractors,
                    rich_explanation(item),
                )
            } else {
                let distractors = pick_distractors(rng, &pools.lesson_kanji, &pools.kanji_fb, &item.jp, 3);
                make_quiz(
                    rng,
                    id,
                    format!("¿Cuál corresponde a «{}»?", item.meaning),
                    None,
                    item.jp.clone(),
                    distractors,
                    rich_explanation(item),
                )
            }
        }
    }
}

/// "¿Cómo suena?" — play the word/kanji (TTS) and pick its meaning. Audio
/// listening practice grounded in the taught item.
fn build_listen(
    rng: &mut StdRng,
    idx: usize,
    item: &Item,
    pools: &DistractorPools,
) -> Option<Activity> {
    let mut distractors = pick_distractors(rng, &pools.lesson_meanings, &pools.meaning_fb, &item.meaning, 3);
    distractors.retain(|d| d != &item.meaning);
    if distractors.is_empty() {
        return None;
    }
    let mut options = vec![item.meaning.clone()];
    options.append(&mut distractors);
    options.shuffle(rng);
    let correct_index = options.iter().position(|o| o == &item.meaning)?;
    Some(Activity::Listening {
        id: format!("gen-listen-{idx}"),
        text_jp: item.jp.clone(),
        voice: "Kyoko".to_string(),
        prompt: "Escucha y elige el significado".to_string(),
        options,
        correct_index,
        explanation: Some(rich_explanation(item)),
    })
}

fn is_kanji_char(c: char) -> bool {
    ('\u{4E00}'..='\u{9FFF}').contains(&c) || ('\u{3400}'..='\u{4DBF}').contains(&c)
}

/// "Escribe la palabra" — the learner writes the WORD correctly in Japanese from
/// its meaning (NOT its pronunciation). This teaches real spelling: e.g. こんにちは
/// is written with は even though it sounds «wa». Works for kanji words (学生) and
/// kana words (こんにちは). Accepts the kanji form and the kana reading; the
/// frontend grader is phonetically tolerant so romaji-input quirks don't block.
fn build_write_word(idx: usize, item: &Item) -> Option<Activity> {
    // Need at least 2 characters to be worth typing.
    if item.jp.chars().count() < 2 {
        return None;
    }
    let kanji: Vec<String> = item
        .jp
        .chars()
        .filter(|c| is_kanji_char(*c))
        .map(String::from)
        .collect();

    let mut accepted = vec![item.jp.clone()];
    if !item.reading.is_empty() && item.reading != item.jp {
        for r in item
            .reading
            .split(['／', '/', '・', ';', '；', ',', '、'])
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
        {
            accepted.push(r.to_string());
        }
    }
    // De-dup but KEEP item.jp first: the UI shows accepted[0] as the "versión
    // natural", so the real word (e.g. katakana メニュー) must outrank its
    // hiragana reading (めにゅー) — sorting used to put hiragana first.
    let mut seen = HashSet::new();
    accepted.retain(|a| seen.insert(a.clone()));

    // Hint teaches the spelling. Highlight the は/へ particle-spelling trap.
    let ends_wa = item.jp.ends_with('は');
    let ends_e = item.jp.ends_with('へ');
    let hint = if ends_wa {
        format!("«{}» · termina en は (se escribe は aunque suene «wa»)", item.meaning)
    } else if ends_e {
        format!("«{}» · termina en へ (se escribe へ aunque suene «e»)", item.meaning)
    } else if kanji.is_empty() {
        format!("«{}» · {} caracteres en kana", item.meaning, item.jp.chars().count())
    } else {
        format!("Necesitas estos kanji: {} · se lee «{}»", kanji.join(" + "), item.reading)
    };

    Some(Activity::WriteSentence {
        id: format!("gen-word-{idx}"),
        prompt: format!("Escribe «{}» en japonés", item.meaning),
        hint: Some(hint),
        accepted,
        explanation: rich_explanation(item),
    })
}

/// "Escribe la frase" — write a whole SHORT taught sentence from its Spanish
/// meaning (e.g. «Hoy es domingo» → 今日は日曜日です). Grounded in a real authored
/// sentence, this practices building phrases, not just single words — so writing
/// practice teaches instead of repeating (Rodrigo's request).
fn build_write_phrase(idx: usize, jp: &str, meaning: &str) -> Option<Activity> {
    let len = jp.chars().count();
    // Drop any parenthetical note so the prompt stays clean («Buenos días»,
    // not «Buenos días (formal)»).
    let meaning = meaning
        .split(['(', '（'])
        .next()
        .unwrap_or(meaning)
        .trim();
    if len < 4 || len > 16 || meaning.is_empty() {
        return None;
    }
    let mut kanji: Vec<String> = jp
        .chars()
        .filter(|c| is_kanji_char(*c))
        .map(String::from)
        .collect();
    kanji.dedup();
    let hint = if kanji.is_empty() {
        format!("Frase completa · {len} caracteres en kana")
    } else {
        format!("Frase completa · usa estos kanji: {}", kanji.join(" + "))
    };
    Some(Activity::WriteSentence {
        id: format!("gen-phrase-{idx}"),
        prompt: format!("Escribe esta frase en japonés: «{meaning}»"),
        hint: Some(hint),
        accepted: vec![jp.to_string()],
        explanation: format!("{jp} — {meaning}"),
    })
}

/// Short taught SENTENCES (jp + Spanish meaning) usable for "write the phrase":
/// pulled from grammar examples, speaking lines and kanji examples that are real
/// sentences (contain a particle/です), not just single words.
fn taught_sentences(conn: &Connection, lesson_id: i64) -> Vec<(String, String)> {
    let json: String = match conn.query_row(
        "SELECT activities_json FROM lessons WHERE id = ?1",
        [lesson_id],
        |r| r.get(0),
    ) {
        Ok(j) => j,
        Err(_) => return vec![],
    };
    let parsed: LessonActivities = serde_json::from_str(&json).unwrap_or(LessonActivities {
        activities: vec![],
    });
    let looks_like_sentence = |s: &str| {
        s.chars().count() >= 4
            && ['は', 'を', 'に', 'で', 'が', 'へ', 'も']
                .iter()
                .any(|p| s.contains(*p))
            || s.contains("です")
            || s.contains("ます")
    };
    let mut out: Vec<(String, String)> = Vec::new();
    for a in parsed.activities {
        match a {
            Activity::IntroGrammar { example, .. } => {
                if looks_like_sentence(&example.jp) && !example.meaning.trim().is_empty() {
                    out.push((example.jp, example.meaning));
                }
            }
            Activity::Speaking {
                text_jp, meaning, ..
            } => {
                if looks_like_sentence(&text_jp) && !meaning.trim().is_empty() {
                    out.push((text_jp, meaning));
                }
            }
            Activity::IntroKanji {
                example: Some(ex), ..
            } => {
                if looks_like_sentence(&ex.jp) && !ex.meaning.trim().is_empty() {
                    out.push((ex.jp, ex.meaning));
                }
            }
            _ => {}
        }
    }
    // De-dup by jp.
    let mut seen = HashSet::new();
    out.retain(|(jp, _)| seen.insert(jp.clone()));
    out
}

/// "Dibuja el kanji" — trace it stroke by stroke (StrokeTrainer). Only for
/// single kanji.
fn build_draw(idx: usize, item: &Item) -> Option<Activity> {
    if !item.is_kanji {
        return None;
    }
    Some(Activity::WriteKanji {
        id: format!("gen-draw-{idx}"),
        kanji_char: item.jp.clone(),
        meaning: item.meaning.clone(),
        reading: item.reading.clone(),
        note: None,
    })
}

/// "¿Cómo se lee «X»?" — see the Spanish meaning, pick the reading (kana). A
/// different angle from the plain meaning question. Only for words that CONTAIN
/// kanji and have a distinct reading.
fn build_meaning_to_reading(
    rng: &mut StdRng,
    idx: usize,
    item: &Item,
    pools: &DistractorPools,
) -> Option<Activity> {
    if item.reading.is_empty()
        || item.reading == item.jp
        || !item.jp.chars().any(is_kanji_char)
    {
        return None;
    }
    let distractors = pick_distractors(rng, &pools.lesson_readings, &pools.reading_fb, &item.reading, 3);
    make_quiz(
        rng,
        format!("gen-mr-{idx}"),
        format!("¿Cómo se lee «{}»?", item.meaning),
        None,
        item.reading.clone(),
        distractors,
        rich_explanation(item),
    )
}

/// "¿Qué significa esta lectura?" — show only the kana reading and pick the
/// meaning (recognizing a word by its sound). For words that contain kanji.
fn build_reading_to_meaning(
    rng: &mut StdRng,
    idx: usize,
    item: &Item,
    pools: &DistractorPools,
) -> Option<Activity> {
    if item.reading.is_empty()
        || item.reading == item.jp
        || !item.jp.chars().any(is_kanji_char)
    {
        return None;
    }
    let distractors = pick_distractors(rng, &pools.lesson_meanings, &pools.meaning_fb, &item.meaning, 2);
    make_quiz(
        rng,
        format!("gen-rm-{idx}"),
        "¿Qué significa esta lectura?".to_string(),
        Some(item.reading.clone()),
        item.meaning.clone(),
        distractors,
        rich_explanation(item),
    )
}

/// "Empareja" — pair Japanese words with their meanings. A distinct, active
/// format (not another multiple-choice) so practice feels varied.
fn build_match_pairs(rng: &mut StdRng, idx: usize, items: &[Item]) -> Option<Activity> {
    let mut pool: Vec<&Item> = items
        .iter()
        .filter(|it| !it.jp.is_empty() && !it.meaning.is_empty())
        .collect();
    if pool.len() < 3 {
        return None;
    }
    pool.shuffle(rng);
    // Dedupe by meaning AND by jp so every pairing is unambiguous.
    let mut seen_m = HashSet::new();
    let mut seen_j = HashSet::new();
    let pairs: Vec<MatchPair> = pool
        .into_iter()
        .filter(|it| seen_m.insert(it.meaning.clone()) && seen_j.insert(it.jp.clone()))
        .take(4)
        .map(|it| MatchPair {
            jp: it.jp.clone(),
            meaning: it.meaning.clone(),
            reading: if it.reading.is_empty() || it.reading == it.jp {
                None
            } else {
                Some(it.reading.clone())
            },
        })
        .collect();
    if pairs.len() < 3 {
        return None;
    }
    Some(Activity::MatchPairs {
        id: format!("gen-match-{idx}"),
        prompt: "Une cada palabra con su significado".to_string(),
        pairs,
    })
}

// Boundary tiles for tokenizing an N5 sentence into word tiles. Greedy longest
// match against these + the taught vocabulary; if any part can't be matched we
// simply skip the exercise (so tiles are never wrong).
const ORDER_PARTICLES: &[&str] = &[
    "から", "まで", "は", "が", "を", "に", "へ", "で", "と", "も", "の", "か", "ね", "よ",
];
const ORDER_ENDINGS: &[&str] = &[
    "ませんでした",
    "ましょう",
    "ですか",
    "ください",
    "たいです",
    "ました",
    "ません",
    "でした",
    "です",
    "ますか",
    "ます",
];
const ORDER_FUNCTION: &[&str] = &[
    "私", "あなた", "彼女", "彼", "これ", "それ", "あれ", "この", "その", "あの", "ここ",
    "そこ", "あそこ", "何", "誰", "どこ", "いつ", "今", "毎日", "とても", "少し", "もう",
];

/// Every intro-vocab surface (word) taught anywhere — the base dictionary for the
/// sentence-ordering tokenizer.
fn all_vocab_surfaces(conn: &Connection) -> Vec<String> {
    let mut out: Vec<String> = Vec::new();
    if let Ok(mut stmt) = conn.prepare("SELECT activities_json FROM lessons") {
        if let Ok(rows) = stmt.query_map([], |r| r.get::<_, String>(0)) {
            for raw in rows.flatten() {
                if let Ok(parsed) = serde_json::from_str::<LessonActivities>(&raw) {
                    for a in parsed.activities {
                        if let Activity::IntroVocab { word, .. } = a {
                            if !word.is_empty() {
                                out.push(word);
                            }
                        }
                    }
                }
            }
        }
    }
    out
}

/// Candidate tiles, sorted longest-first for greedy matching.
fn order_dictionary(conn: &Connection, catalog: &[Item]) -> Vec<String> {
    let mut set: HashSet<String> = HashSet::new();
    for s in all_vocab_surfaces(conn) {
        set.insert(s);
    }
    for it in catalog {
        if !it.jp.is_empty() {
            set.insert(it.jp.clone());
        }
    }
    for s in ORDER_PARTICLES
        .iter()
        .chain(ORDER_ENDINGS.iter())
        .chain(ORDER_FUNCTION.iter())
    {
        set.insert((*s).to_string());
    }
    let mut v: Vec<String> = set.into_iter().collect();
    v.sort_by(|a, b| b.chars().count().cmp(&a.chars().count()).then(a.cmp(b)));
    v
}

/// Split a sentence into word tiles by greedy longest-match against `dict`.
/// Returns None if any part can't be matched (so we never show broken tiles).
fn order_tokenize(sentence: &str, dict: &[String]) -> Option<Vec<String>> {
    let chars: Vec<char> = sentence
        .chars()
        .filter(|c| !matches!(c, '。' | '、' | ' ' | '　' | '！' | '？'))
        .collect();
    let mut tokens: Vec<String> = Vec::new();
    let mut i = 0usize;
    'outer: while i < chars.len() {
        for cand in dict {
            let clen = cand.chars().count();
            if clen == 0 || i + clen > chars.len() {
                continue;
            }
            if chars[i..i + clen].iter().collect::<String>() == *cand {
                tokens.push(cand.clone());
                i += clen;
                continue 'outer;
            }
        }
        return None;
    }
    Some(tokens)
}

/// "Ordena la frase" — arrange shuffled word tiles into the correct sentence.
fn build_order_sentence(
    rng: &mut StdRng,
    idx: usize,
    jp: &str,
    meaning: &str,
    dict: &[String],
) -> Option<Activity> {
    let tokens = order_tokenize(jp, dict)?;
    // Need enough tiles to be a real puzzle, but not so many it's tedious.
    if tokens.len() < 3 || tokens.len() > 7 {
        return None;
    }
    // At least two "content" tiles (not just particles/endings).
    let content = tokens
        .iter()
        .filter(|t| {
            !ORDER_PARTICLES.contains(&t.as_str()) && !ORDER_ENDINGS.contains(&t.as_str())
        })
        .count();
    if content < 2 {
        return None;
    }
    let clean = meaning
        .split(['(', '（'])
        .next()
        .unwrap_or(meaning)
        .trim()
        .to_string();
    // Harder variant: add 1-2 DECOY particle tiles that don't belong in this
    // sentence, so the learner must choose the RIGHT particle instead of just
    // permuting the given tiles. More decoys for longer sentences.
    let used: HashSet<&str> = tokens.iter().map(|s| s.as_str()).collect();
    let mut decoy_pool: Vec<String> = ORDER_PARTICLES
        .iter()
        .filter(|p| !used.contains(**p))
        .map(|p| p.to_string())
        .collect();
    decoy_pool.shuffle(rng);
    let decoys: Vec<String> = decoy_pool
        .into_iter()
        .take(if tokens.len() >= 5 { 2 } else { 1 })
        .collect();
    Some(Activity::OrderSentence {
        id: format!("gen-order-{idx}"),
        tokens,
        meaning: clean,
        decoys,
        reading: None,
        explanation: Some(format!("{jp} — {meaning}")),
    })
}

/// Plausible full-phrase distractors for the "understand the sentence" question,
/// so the wrong options aren't single words.
const GENERIC_PHRASES: &[&str] = &[
    "Soy estudiante.",
    "Bebo agua.",
    "Como pan.",
    "Voy a la escuela.",
    "Hoy hace calor.",
    "Me gusta el café.",
    "Es un libro nuevo.",
    "Mañana voy a Tokio.",
    "Tengo hambre.",
    "No entiendo.",
    "Es muy caro.",
    "¿Cuánto cuesta?",
];

/// "¿Qué significa esta frase?" — read a whole taught SENTENCE and choose what it
/// means. The creative comprehension question Rodrigo asked for, grounded in a
/// verified sentence.
fn build_sentence_comprehension(
    rng: &mut StdRng,
    idx: usize,
    jp: &str,
    meaning: &str,
    phrase_primary: &[String],
    phrase_fb: &[String],
) -> Option<Activity> {
    let clean = meaning
        .split(['(', '（'])
        .next()
        .unwrap_or(meaning)
        .trim()
        .to_string();
    if clean.is_empty() {
        return None;
    }
    let distractors = pick_distractors(rng, phrase_primary, phrase_fb, &clean, 3);
    make_quiz(
        rng,
        format!("gen-comp-{idx}"),
        "¿Qué significa esta frase?".to_string(),
        Some(jp.to_string()),
        clean.clone(),
        distractors,
        format!("{jp} — {clean}"),
    )
}

/// The lesson's OWN authored practice questions (quiz/listening). They are
/// verified and perfectly on-topic, so we fold them into the candidate pool for
/// extra, creative variety (particle pronunciation, sentence meaning, etc.).
fn authored_questions(conn: &Connection, lesson_id: i64) -> Vec<Activity> {
    let json: String = match conn.query_row(
        "SELECT activities_json FROM lessons WHERE id = ?1",
        [lesson_id],
        |r| r.get(0),
    ) {
        Ok(j) => j,
        Err(_) => return vec![],
    };
    let parsed: LessonActivities = serde_json::from_str(&json).unwrap_or(LessonActivities {
        activities: vec![],
    });
    parsed
        .activities
        .into_iter()
        .filter(|a| matches!(a, Activity::Quiz { .. } | Activity::Listening { .. }))
        .collect()
}

/// Coarse "kind of question" used to spread the set so the same modality never
/// clusters (e.g. two listening questions back to back).
fn modality(a: &Activity) -> &'static str {
    match a {
        Activity::Listening { .. } => "listen",
        Activity::WriteSentence { .. } => "write",
        Activity::WriteKanji { .. } => "draw",
        Activity::OrderSentence { .. } => "order",
        Activity::MatchPairs { .. } => "match",
        Activity::Quiz { id, .. } => {
            if id.starts_with("gen-sit") {
                "sit"
            } else if id.starts_with("gen-gram") {
                "gram"
            } else if id.starts_with("gen-ctx") {
                "blank"
            } else if id.starts_with("gen-comp") {
                "comp"
            } else if id.starts_with("gen-mr") || id.starts_with("gen-rm") {
                "read"
            } else {
                "mcq"
            }
        }
        _ => "other",
    }
}

/// How many of a modality may appear WITHIN one band, so no band is dominated by
/// one type (keeps audio/writing/drawing spread out).
fn band_modality_cap(m: &str, count: usize) -> usize {
    match m {
        "listen" => 1,
        "write" => 1,
        "draw" => 2,
        "blank" => 2,
        "sit" => 1,
        "gram" => 2,
        "comp" => 2,
        "order" => 2,
        "match" => 1,
        _ => count,
    }
}

/// Select up to `count` questions from a band's candidate pool: distinct
/// questions first (respecting per-modality caps for variety), then relax the
/// caps, and finally allow a second copy only if the pool is too small — writing
/// and listening never repeat. `counts` tracks copies across the whole set.
fn select_band(
    mut pool: Vec<Activity>,
    count: usize,
    counts: &mut HashMap<String, usize>,
    rng: &mut StdRng,
) -> Vec<Activity> {
    pool.shuffle(rng);
    let mut out: Vec<Activity> = Vec::new();
    let mut mod_count: HashMap<&str, usize> = HashMap::new();

    // Pass 1: fresh questions, spread across modalities.
    for a in &pool {
        if out.len() >= count {
            break;
        }
        let sig = signature(a);
        if counts.get(&sig).copied().unwrap_or(0) > 0 {
            continue;
        }
        let m = modality(a);
        if mod_count.get(m).copied().unwrap_or(0) >= band_modality_cap(m, count) {
            continue;
        }
        *counts.entry(sig).or_insert(0) += 1;
        *mod_count.entry(m).or_insert(0) += 1;
        out.push(a.clone());
    }
    // Pass 2: still fresh, but ignore the per-modality caps.
    if out.len() < count {
        for a in &pool {
            if out.len() >= count {
                break;
            }
            let sig = signature(a);
            if counts.get(&sig).copied().unwrap_or(0) > 0 {
                continue;
            }
            *counts.entry(sig).or_insert(0) += 1;
            out.push(a.clone());
        }
    }
    // No repeat pass: every question in the set is DISTINCT. A tiny lesson simply
    // gets fewer than `count` questions instead of padding with duplicates —
    // better 12 different questions than 20 with repeats.
    out
}

/// Reorder a band so the same "special" modality (listen/write/draw/blank) never
/// sits next to another: interleave plain multiple-choice with the specials, and
/// keep the band's first/last slots plain so band boundaries don't clash either.
fn arrange(items: Vec<Activity>) -> Vec<Activity> {
    let (special, plain): (Vec<Activity>, Vec<Activity>) = items
        .into_iter()
        .partition(|a| matches!(modality(a), "listen" | "write" | "draw" | "blank" | "order" | "match"));
    let mut out = Vec::with_capacity(special.len() + plain.len());
    let mut pi = 0usize;
    let mut si = 0usize;
    // Start with a plain question, then alternate plain / special.
    while pi < plain.len() || si < special.len() {
        if pi < plain.len() {
            out.push(plain[pi].clone());
            pi += 1;
        }
        if si < special.len() {
            out.push(special[si].clone());
            si += 1;
        }
    }
    out
}

/// A stable fingerprint of a question (its "what am I asking" identity), used to
/// avoid handing the learner the SAME question twice in one set. Two questions
/// with the same prompt + shown item + correct answer collapse to one signature.
fn signature(a: &Activity) -> String {
    match a {
        Activity::Quiz {
            prompt,
            prompt_jp,
            options,
            correct_index,
            ..
        } => format!(
            "Q|{prompt}|{}|{}",
            prompt_jp.clone().unwrap_or_default(),
            options.get(*correct_index).cloned().unwrap_or_default()
        ),
        Activity::Listening {
            text_jp,
            options,
            correct_index,
            ..
        } => format!(
            "L|{text_jp}|{}",
            options.get(*correct_index).cloned().unwrap_or_default()
        ),
        Activity::WriteSentence {
            prompt, accepted, ..
        } => format!("W|{prompt}|{}", accepted.join("/")),
        Activity::WriteKanji { kanji_char, .. } => format!("D|{kanji_char}"),
        Activity::OrderSentence { tokens, .. } => format!("O|{}", tokens.join("")),
        Activity::MatchPairs { pairs, .. } => {
            let mut jps: Vec<&str> = pairs.iter().map(|p| p.jp.as_str()).collect();
            jps.sort();
            format!("M|{}", jps.join(","))
        }
        _ => "?".to_string(),
    }
}

/// Core generator (pure, testable): produce up to TOTAL exercises for a lesson.
///
/// Builds a rich POOL of distinct question types from the lesson's taught items,
/// its grammar, its example sentences, the lesson's own authored questions, and
/// gated real-life situations — then selects a varied set per band (dedup + a
/// per-modality cap so the same kind never clusters) and arranges each band so
/// audio/writing/drawing don't sit next to each other. Everything stays strictly
/// on the lesson's topic; nothing repeats needlessly.
pub fn generate(conn: &Connection, lesson_id: i64, seed: u64) -> Vec<GeneratedExercise> {
    let mut rng = StdRng::seed_from_u64(seed ^ (lesson_id as u64).wrapping_mul(0x9E3779B97F4A7C15));
    let level = lesson_level(conn, lesson_id);
    let catalog = catalog_kanji(conn, &level);

    // TARGETS = only what THIS lesson actually taught. If a lesson has no taught
    // items at all we fall back to the level catalog.
    let mut items = taught_items(conn, lesson_id);
    if items.is_empty() {
        items = catalog.clone();
        items.shuffle(&mut rng);
        items.truncate(10);
    }
    if items.is_empty() {
        return vec![];
    }

    // Distractors are drawn PRIMARILY from this lesson's own items (same theme),
    // and only topped up from the broad level-wide fallback pools when the lesson
    // is too small. This keeps every wrong option on-topic. (Rodrigo's #1 fix.)
    let pools = DistractorPools {
        lesson_meanings: items.iter().map(|i| i.meaning.clone()).collect(),
        lesson_kanji: items.iter().map(|i| i.jp.clone()).collect(),
        lesson_readings: items
            .iter()
            .map(|i| i.reading.clone())
            .filter(|r| !r.is_empty())
            .collect(),
        meaning_fb: COMMON_MEANINGS
            .iter()
            .map(|s| s.to_string())
            .chain(items.iter().map(|i| i.meaning.clone()))
            .collect(),
        kanji_fb: catalog
            .iter()
            .map(|i| i.jp.clone())
            .chain(items.iter().map(|i| i.jp.clone()))
            .collect(),
        reading_fb: catalog
            .iter()
            .map(|i| i.reading.clone())
            .chain(items.iter().map(|i| i.reading.clone()))
            .filter(|r| !r.is_empty())
            .collect(),
    };

    let grammar = taught_grammar(conn, lesson_id);
    let sentences = taught_sentences(conn, lesson_id);
    let authored = authored_questions(conn, lesson_id);
    // Situational questions must be ON-TOPIC: only appear when the situation's
    // phrase is taught in THIS lesson (not cumulatively). Otherwise a greeting
    // scenario ('¿qué respondes a おはようございます?') would leak into the numbers
    // lesson just because greetings were taught earlier — off-topic and confusing.
    let current_surfaces: HashSet<String> = items
        .iter()
        .flat_map(|it| {
            [normalize_phrase(&it.jp), normalize_phrase(&it.reading)]
        })
        .filter(|s| !s.is_empty())
        .collect();
    let sit_indices = gated_situations(&mut rng, &current_surfaces);

    // "Understand the sentence": distractors are OTHER taught sentence meanings
    // from this lesson first (same theme), then generic plausible phrases.
    let clean = |m: &str| {
        m.split(['(', '（']).next().unwrap_or(m).trim().to_string()
    };
    let phrase_primary: Vec<String> = sentences.iter().map(|(_, m)| clean(m)).collect();
    let phrase_fb: Vec<String> = GENERIC_PHRASES.iter().map(|s| s.to_string()).collect();

    // ---- Build the candidate pools per band -------------------------------
    let mut facil: Vec<Activity> = Vec::new();
    let mut medio: Vec<Activity> = Vec::new();
    let mut dificil: Vec<Activity> = Vec::new();
    let mut idc = 0usize;

    for item in &items {
        // fácil — recognition
        if let Some(a) = build_exercise(&mut rng, idc, "facil", item, &pools) {
            facil.push(a);
        }
        idc += 1;
        if let Some(a) = build_listen(&mut rng, idc, item, &pools) {
            facil.push(a);
        }
        idc += 1;
        if let Some(a) = build_reading_to_meaning(&mut rng, idc, item, &pools) {
            facil.push(a);
        }
        idc += 1;
        // medio — production
        if let Some(a) = build_exercise(&mut rng, idc, "medio", item, &pools) {
            medio.push(a);
        }
        idc += 1;
        if let Some(a) = build_meaning_to_reading(&mut rng, idc, item, &pools) {
            medio.push(a);
        }
        idc += 1;
        if let Some(a) = build_write_word(idc, item) {
            medio.push(a);
        }
        idc += 1;
        // difícil — recall / usage
        if let Some(a) = build_exercise(&mut rng, idc, "dificil", item, &pools) {
            dificil.push(a);
        }
        idc += 1;
        if let Some(a) = build_draw(idc, item) {
            dificil.push(a);
        }
        idc += 1;
        if let Some(a) = build_blank_exercise(&mut rng, idc, item, &pools) {
            dificil.push(a);
        }
        idc += 1;
    }

    // Grammar → medio; sentences → comprehension (medio) + write-the-phrase (dif.)
    for gp in &grammar {
        if let Some(a) = build_grammar_blank(&mut rng, idc, gp) {
            medio.push(a);
        }
        idc += 1;
    }
    let order_dict = order_dictionary(conn, &catalog);
    for (jp, meaning) in &sentences {
        if let Some(a) = build_sentence_comprehension(&mut rng, idc, jp, meaning, &phrase_primary, &phrase_fb) {
            medio.push(a);
        }
        idc += 1;
        if let Some(a) = build_write_phrase(idc, jp, meaning) {
            dificil.push(a);
        }
        idc += 1;
        // NEW format: arrange the shuffled word tiles into the sentence.
        if let Some(a) = build_order_sentence(&mut rng, idc, jp, meaning, &order_dict) {
            dificil.push(a);
        }
        idc += 1;
    }

    // NEW format: match Japanese words to their meanings (varies the practice).
    if let Some(a) = build_match_pairs(&mut rng, idc, &items) {
        medio.push(a);
    }
    idc += 1;

    // Real-life situations (already gated to taught phrases): spread facil/medio.
    for (i, &si) in sit_indices.iter().enumerate() {
        let a = build_situation_at(&mut rng, idc, si);
        idc += 1;
        if i % 2 == 0 {
            facil.push(a);
        } else {
            medio.push(a);
        }
    }

    // The lesson's own verified questions add creative variety, on-topic.
    for a in authored {
        match &a {
            Activity::Listening { .. } => facil.push(a),
            Activity::WriteSentence { .. } => dificil.push(a),
            _ => medio.push(a),
        }
    }

    // ---- Select a varied, non-repetitive set per band ---------------------
    let mut counts: HashMap<String, usize> = HashMap::new();
    let facil_sel = arrange(select_band(facil, N_FACIL, &mut counts, &mut rng));
    let medio_sel = arrange(select_band(medio, N_MEDIO, &mut counts, &mut rng));
    let dificil_sel = arrange(select_band(
        dificil,
        TOTAL - N_FACIL - N_MEDIO,
        &mut counts,
        &mut rng,
    ));

    let mut out = Vec::with_capacity(TOTAL);
    for a in facil_sel {
        out.push(GeneratedExercise { activity: a, difficulty: "facil".to_string() });
    }
    for a in medio_sel {
        out.push(GeneratedExercise { activity: a, difficulty: "medio".to_string() });
    }
    for a in dificil_sel {
        out.push(GeneratedExercise { activity: a, difficulty: "dificil".to_string() });
    }
    out
}
#[tauri::command]
pub fn generate_lesson_exercises(
    db: State<'_, DbState>,
    lesson_id: i64,
    seed: i64,
) -> AppResult<Vec<GeneratedExercise>> {
    db.with(|c| Ok(generate(c, lesson_id, seed as u64)))
}

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;

    fn fresh_db() -> Connection {
        let conn = Connection::open_in_memory().expect("open in-memory db");
        conn.execute_batch("PRAGMA foreign_keys = ON;").unwrap();
        crate::db::migrations::run(&conn).expect("migrations run clean");
        crate::seed::run_if_empty(&conn).expect("seed runs clean");
        conn
    }

    #[test]
    fn distractors_prefer_same_shape_over_random() {
        // 食べます is a 4-char kanji+kana verb. Given a fallback mixing 4-char
        // ます-verbs with single kanji, the picker must choose the plausible
        // same-shape verbs — never 校/火 — so the option isn't obvious.
        let mut rng = StdRng::seed_from_u64(7);
        let primary: Vec<String> = Vec::new();
        let fallback: Vec<String> = ["飲みます", "行きます", "校", "火", "水"]
            .iter()
            .map(|s| s.to_string())
            .collect();
        let picked = pick_distractors(&mut rng, &primary, &fallback, "食べます", 2);
        assert_eq!(picked.len(), 2);
        for p in &picked {
            assert_eq!(
                p.chars().count(),
                4,
                "distractor '{p}' should match the 4-char shape of 食べます"
            );
        }
    }

    #[test]
    fn distractors_prefer_same_theme_primary_pool_first() {
        // Same-lesson items (primary) win even if a fallback item is closer in
        // length: on-topic beats shape.
        let mut rng = StdRng::seed_from_u64(3);
        let primary = vec!["venir".to_string(), "volver".to_string()];
        let fallback = vec!["gato".to_string(), "agua".to_string()];
        let picked = pick_distractors(&mut rng, &primary, &fallback, "ir", 2);
        assert_eq!(picked.len(), 2);
        for p in &picked {
            assert!(
                p == "venir" || p == "volver",
                "expected same-theme verbs, got '{p}'"
            );
        }
    }

    #[test]
    fn generates_twenty_valid_exercises_across_three_bands() {
        let conn = fresh_db();
        // Lesson 1 exists in seed.
        let ex = generate(&conn, 1, 12345);
        assert_eq!(ex.len(), 20, "should produce a full set of 20");

        let facil = ex.iter().filter(|e| e.difficulty == "facil").count();
        let medio = ex.iter().filter(|e| e.difficulty == "medio").count();
        let dificil = ex.iter().filter(|e| e.difficulty == "dificil").count();
        assert_eq!((facil, medio, dificil), (7, 7, 6), "band split");

        // Multiple-choice exercises (quiz/listening) must be valid: >=2 distinct
        // options and an in-range correct index. Other modalities (write/draw)
        // are also allowed for variety.
        for e in &ex {
            let mcq = match &e.activity {
                Activity::Quiz {
                    options,
                    correct_index,
                    ..
                }
                | Activity::Listening {
                    options,
                    correct_index,
                    ..
                } => Some((options, correct_index)),
                _ => None,
            };
            if let Some((options, correct_index)) = mcq {
                assert!(options.len() >= 2, "needs >=2 options");
                assert!(*correct_index < options.len(), "correct idx in range");
                let mut sorted = options.clone();
                sorted.sort();
                sorted.dedup();
                assert_eq!(sorted.len(), options.len(), "options must be distinct");
            }
        }
    }

    #[test]
    fn exercises_only_target_taught_items() {
        use std::collections::HashSet;
        let conn = fresh_db();
        // Find a lesson that actually teaches items (intro_kanji/intro_vocab).
        let mut lesson_id = 0i64;
        for id in 1..=60 {
            if !taught_items(&conn, id).is_empty() {
                lesson_id = id;
                break;
            }
        }
        assert!(lesson_id > 0, "expected at least one lesson with taught items");

        let taught = taught_items(&conn, lesson_id);
        let allowed: HashSet<String> = taught
            .iter()
            .flat_map(|i| [i.jp.clone(), i.meaning.clone(), i.reading.clone()])
            .filter(|s| !s.is_empty())
            .collect();

        let ex = generate(&conn, lesson_id, 999);
        for e in &ex {
            if let Activity::Quiz {
                id,
                options,
                correct_index,
                ..
            } = &e.activity
            {
                // Only the item-targeting GENERATED questions must draw their
                // answer from a taught item. Situational (gen-sit), grammar
                // (gen-gram), sentence-comprehension (gen-comp) and the lesson's
                // own authored questions (non-"gen-" ids) are on-topic by design
                // but don't target a single vocabulary item.
                if !id.starts_with("gen-")
                    || id.starts_with("gen-sit")
                    || id.starts_with("gen-gram")
                    || id.starts_with("gen-comp")
                {
                    continue;
                }
                let correct = &options[*correct_index];
                assert!(
                    allowed.contains(correct),
                    "correct answer '{correct}' must come from a TAUGHT item (lesson {lesson_id}); the learner was never shown untaught material"
                );
            }
        }
    }

    /// HARD GUARD against the critical bugs Rodrigo hit: walks EVERY lesson with
    /// several seeds and asserts every generated exercise is answerable and fair:
    ///  - MCQs have >=2 DISTINCT options, a valid correct index, and NO option
    ///    with a parenthesis (no truncated "(formal" glosses).
    ///  - "Escribe la lectura" only targets words that CONTAIN kanji (never a
    ///    kana-only word like こんにちは, which the romaji input mangles).
    ///  - Every write exercise has accepted answers + a hint; draws are kanji.
    #[test]
    fn all_lessons_generate_answerable_fair_exercises() {
        let conn = fresh_db();
        let has_kanji = |s: &str| {
            s.chars().any(|c| {
                ('\u{4E00}'..='\u{9FFF}').contains(&c)
                    || ('\u{3400}'..='\u{4DBF}').contains(&c)
            })
        };
        let mut lessons_seen = 0;
        for id in 1..=200 {
            for seed in [1u64, 7, 42] {
                let ex = generate(&conn, id, seed);
                if ex.is_empty() {
                    continue;
                }
                lessons_seen += 1;
                for e in &ex {
                    match &e.activity {
                        Activity::Quiz {
                            id: qid,
                            options,
                            correct_index,
                            ..
                        }
                        | Activity::Listening {
                            id: qid,
                            options,
                            correct_index,
                            ..
                        } => {
                            assert!(options.len() >= 2, "MCQ needs >=2 options (lesson {id})");
                            assert!(
                                *correct_index < options.len(),
                                "correct idx out of range (lesson {id})"
                            );
                            let mut sorted = options.clone();
                            sorted.sort();
                            sorted.dedup();
                            assert_eq!(
                                sorted.len(),
                                options.len(),
                                "options must be DISTINCT (lesson {id}): {options:?}"
                            );
                            // The no-parenthesis rule guards GENERATED options from
                            // truncated glosses; the lesson's own authored options
                            // may legitimately read like "に (destino)".
                            if qid.starts_with("gen-") {
                                for o in options {
                                    assert!(
                                        !o.contains('(') && !o.contains('（'),
                                        "generated option has a parenthesis (lesson {id}): '{o}'"
                                    );
                                }
                            }
                        }
                        Activity::WriteSentence {
                            id: aid,
                            prompt,
                            accepted,
                            hint,
                            ..
                        } => {
                            assert!(!accepted.is_empty(), "write needs accepted answers (lesson {id})");
                            assert!(
                                hint.as_ref().map(|h| !h.trim().is_empty()).unwrap_or(false),
                                "write needs a hint (lesson {id})"
                            );
                            if aid.starts_with("gen-write") {
                                assert!(
                                    has_kanji(prompt),
                                    "reading-write must target a KANJI word, not kana-only (lesson {id}): {prompt}"
                                );
                            }
                        }
                        Activity::WriteKanji { kanji_char, .. } => {
                            assert!(
                                has_kanji(kanji_char),
                                "draw must be a kanji (lesson {id}): {kanji_char}"
                            );
                        }
                        _ => {}
                    }
                }
            }
        }
        assert!(
            lessons_seen > 30,
            "expected many lessons to generate exercises, got {lessons_seen}"
        );
    }

    #[test]
    fn produces_varied_exercise_types() {
        use std::collections::HashSet;
        let conn = fresh_db();
        let mut kinds: HashSet<&str> = HashSet::new();
        for id in 1..=40 {
            for seed in [1u64, 2, 3, 4] {
                for e in generate(&conn, id, seed) {
                    kinds.insert(match &e.activity {
                        Activity::Quiz { .. } => "quiz",
                        Activity::Listening { .. } => "listening",
                        Activity::WriteSentence { .. } => "write",
                        Activity::WriteKanji { .. } => "draw",
                        _ => "other",
                    });
                }
            }
        }
        assert!(
            kinds.len() >= 3,
            "practice should mix modalities (mcq/audio/write/draw), got {kinds:?}"
        );
    }

    #[test]
    fn write_exercises_always_have_hints() {
        let conn = fresh_db();
        let mut checked = 0;
        for id in 1..=40 {
            for seed in [1u64, 2, 3, 4, 5] {
                for e in generate(&conn, id, seed) {
                    if let Activity::WriteSentence { hint, .. } = &e.activity {
                        assert!(
                            hint.as_ref().map(|h| !h.trim().is_empty()).unwrap_or(false),
                            "every write exercise must include a guiding hint"
                        );
                        checked += 1;
                    }
                }
            }
        }
        assert!(checked > 0, "expected some write exercises to be generated");
    }

    #[test]
    fn produces_contextual_usage_questions() {
        let conn = fresh_db();
        let mut found = false;
        for id in 1..=80 {
            let ex = generate(&conn, id, 7);
            let ctx: Vec<_> = ex
                .iter()
                .filter(|e| match &e.activity {
                    Activity::Quiz { id, .. } => id.starts_with("gen-ctx"),
                    _ => false,
                })
                .collect();
            if !ctx.is_empty() {
                found = true;
                // Every contextual question must blank out the word in a real
                // sentence (prompt_jp contains the blank marker).
                for e in &ctx {
                    if let Activity::Quiz { prompt_jp, .. } = &e.activity {
                        assert!(
                            prompt_jp.as_deref().unwrap_or("").contains("＿＿"),
                            "contextual question must show a fill-in-the-blank sentence"
                        );
                    }
                }
                break;
            }
        }
        assert!(
            found,
            "expected at least one lesson to yield a real-usage fill-in-the-blank question"
        );
    }

    /// GUARD (APP-WIDE) for Rodrigo's "las preguntas se repiten" complaint
    /// (Q1=Q4=Q7, Q12=Q14): across EVERY lesson in the whole app and several
    /// seeds, no question may appear 3+ times, and WRITING exercises may never
    /// repeat at all. Every non-trivial set must also stay varied.
    #[test]
    fn no_repeated_questions_across_the_whole_app() {
        use std::collections::HashMap;
        let conn = fresh_db();
        let mut lessons_seen = 0;
        for id in 1..=600 {
            for seed in [1u64, 7, 42, 100] {
                let ex = generate(&conn, id, seed);
                if ex.is_empty() {
                    continue;
                }
                lessons_seen += 1;
                let total = ex.len();
                let mut counts: HashMap<String, usize> = HashMap::new();
                let mut write_counts: HashMap<String, usize> = HashMap::new();
                for e in &ex {
                    let sig = signature(&e.activity);
                    *counts.entry(sig.clone()).or_insert(0) += 1;
                    if matches!(e.activity, Activity::WriteSentence { .. }) {
                        *write_counts.entry(sig).or_insert(0) += 1;
                    }
                }
                // Every question in the set is now DISTINCT — no repeats at all.
                let max_mult = counts.values().copied().max().unwrap_or(0);
                assert_eq!(
                    max_mult, 1,
                    "lesson {id} seed {seed}: a question repeats {max_mult} times (must be unique)"
                );
                assert_eq!(
                    counts.len(),
                    total,
                    "lesson {id} seed {seed}: {}/{total} distinct — a question repeated",
                    counts.len()
                );
                let _ = &write_counts;
            }
        }
        assert!(
            lessons_seen > 100,
            "expected to validate many lessons app-wide, saw {lessons_seen}"
        );
    }

    /// GUARD for the "pregunta que nada que ver" complaint: situational questions
    /// must be ON-TOPIC — their answer is taught IN THIS LESSON, never leaking a
    /// greeting scenario into the numbers / これ / はい lessons. Lesson 1 (no
    /// greetings) has none at all. Uses the cumulative helper as a sanity anchor.
    /// GUARD for the new practice formats (ordenar la frase / emparejar): tiles
    /// must be well-formed and the formats must actually appear somewhere.
    #[test]
    fn new_formats_are_well_formed() {
        let conn = fresh_db();
        let mut saw_order = false;
        let mut saw_match = false;
        for id in 1..=600 {
            if taught_items(&conn, id).is_empty() {
                continue;
            }
            for seed in [1u64, 4, 8, 15, 23] {
                for e in generate(&conn, id, seed) {
                    match &e.activity {
                        Activity::OrderSentence { tokens, decoys, .. } => {
                            saw_order = true;
                            assert!(
                                (3..=7).contains(&tokens.len()),
                                "lesson {id}: order tiles out of range: {tokens:?}"
                            );
                            assert!(
                                tokens.iter().all(|t| !t.trim().is_empty()),
                                "lesson {id}: empty order tile"
                            );
                            // Decoy tiles (harder variant) must be real, non-empty,
                            // and must NOT belong to the sentence (else no puzzle).
                            for d in decoys {
                                assert!(!d.trim().is_empty(), "lesson {id}: empty decoy");
                                assert!(
                                    !tokens.contains(d),
                                    "lesson {id}: decoy '{d}' is actually part of the sentence"
                                );
                            }
                        }
                        Activity::MatchPairs { pairs, .. } => {
                            saw_match = true;
                            assert!(
                                (3..=4).contains(&pairs.len()),
                                "lesson {id}: match pairs out of range"
                            );
                            let jps: HashSet<_> = pairs.iter().map(|p| &p.jp).collect();
                            let ms: HashSet<_> = pairs.iter().map(|p| &p.meaning).collect();
                            assert_eq!(jps.len(), pairs.len(), "match: duplicate jp");
                            assert_eq!(ms.len(), pairs.len(), "match: duplicate meaning");
                        }
                        _ => {}
                    }
                }
            }
        }
        assert!(saw_order, "no order-sentence exercises were generated anywhere");
        assert!(saw_match, "no match-pairs exercises were generated anywhere");
    }

    /// GUARD for Rodrigo's #1 fix: quiz distractors must stay ON-THEME. In a
    /// meaning-recognition question, every wrong option must be another meaning
    /// TAUGHT IN THE SAME LESSON — never a random word from a different topic
    /// (so the colors lesson can't offer "mes"/"estudiante" as the only non-color
    /// options, giving the answer away). Checked on every lesson that has enough
    /// items of its own that no generic fallback is needed.
    #[test]
    fn distractors_stay_on_theme() {
        let conn = fresh_db();
        for id in 1..=600 {
            let items = taught_items(&conn, id);
            let meanings: std::collections::HashSet<String> = items
                .iter()
                .map(|it| it.meaning.trim().to_string())
                .filter(|m| !m.is_empty())
                .collect();
            // Only assert when the lesson alone can fill a 3-option meaning
            // question without borrowing from the broad fallback pool.
            if meanings.len() < 5 {
                continue;
            }
            for seed in [1u64, 5, 13, 27] {
                for e in generate(&conn, id, seed) {
                    if let Activity::Quiz { id: qid, options, .. } = &e.activity {
                        // meaning-answer questions: recognition + reading→meaning
                        if qid.starts_with("gen-facil") || qid.starts_with("gen-rm") {
                            for o in options {
                                assert!(
                                    meanings.contains(o.trim()),
                                    "lesson {id}: off-theme distractor '{o}' in {qid} (not a meaning taught in this lesson)"
                                );
                            }
                        }
                    }
                    if let Activity::Listening { id: lid, options, .. } = &e.activity {
                        if lid.starts_with("gen-listen") {
                            for o in options {
                                assert!(
                                    meanings.contains(o.trim()),
                                    "lesson {id}: off-theme listening distractor '{o}' (not taught here)"
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    #[test]
    fn situations_only_use_current_lesson_phrases() {
        let conn = fresh_db();
        let _cumulative = cumulative_taught_surfaces(&conn, 1); // helper still exercised

        // Lesson 1 teaches no greetings yet → zero situational questions.
        let l1_sits = generate(&conn, 1, 7)
            .iter()
            .filter(|e| matches!(&e.activity, Activity::Quiz { id, .. } if id.starts_with("gen-sit")))
            .count();
        assert_eq!(l1_sits, 0, "lesson 1 must not ask situational greetings");

        // A NUMBERS lesson (301) must never show a greeting situation.
        for seed in [1u64, 3, 9, 42] {
            let sits: Vec<_> = generate(&conn, 301, seed)
                .into_iter()
                .filter(|e| matches!(&e.activity, Activity::Quiz { id, .. } if id.starts_with("gen-sit")))
                .collect();
            assert!(
                sits.is_empty(),
                "the numbers lesson (301) must have NO situational greeting questions"
            );
        }

        // For every lesson: a situational answer must be taught IN THAT lesson.
        for id in 1..=600 {
            let items = taught_items(&conn, id);
            if items.is_empty() {
                continue;
            }
            let current: std::collections::HashSet<String> = items
                .iter()
                .flat_map(|it| [normalize_phrase(&it.jp), normalize_phrase(&it.reading)])
                .filter(|s| !s.is_empty())
                .collect();
            for seed in [1u64, 3, 9] {
                for e in generate(&conn, id, seed) {
                    if let Activity::Quiz {
                        id: qid,
                        options,
                        correct_index,
                        ..
                    } = &e.activity
                    {
                        if qid.starts_with("gen-sit") {
                            let correct = normalize_phrase(&options[*correct_index]);
                            assert!(
                                current.contains(&correct),
                                "lesson {id}: off-topic situational answer '{correct}' (not taught in THIS lesson)"
                            );
                        }
                    }
                }
            }
        }
    }

    /// Lesson 1 teaches the は particle → practice should include a grammar
    /// "fill the particle" question at least sometimes.
    #[test]
    fn teaches_grammar_particle_questions() {
        let conn = fresh_db();
        let mut found = false;
        for seed in [1u64, 7, 42, 100, 200] {
            if generate(&conn, 1, seed).iter().any(|e| {
                matches!(&e.activity, Activity::Quiz { id, .. } if id.starts_with("gen-gram"))
            }) {
                found = true;
                break;
            }
        }
        assert!(found, "lesson 1 should produce a grammar particle question");
    }

    /// The write prompt must NOT carry the old "(escribe la palabra, no como
    /// suena)" parenthetical Rodrigo asked to remove.
    #[test]
    fn write_prompt_has_no_parenthetical() {
        let conn = fresh_db();
        for id in 1..=5 {
            for seed in [1u64, 2, 3] {
                for e in generate(&conn, id, seed) {
                    if let Activity::WriteSentence { prompt, .. } = &e.activity {
                        assert!(
                            !prompt.contains('('),
                            "write prompt should have no parenthetical: {prompt}"
                        );
                    }
                }
            }
        }
    }

    #[test]
    fn different_seeds_produce_different_sets() {
        let conn = fresh_db();
        let a = generate(&conn, 1, 1);
        let b = generate(&conn, 1, 2);
        // Compare the prompt/option sequence; overwhelmingly likely to differ.
        let serialize = |v: &Vec<GeneratedExercise>| {
            v.iter()
                .map(|e| match &e.activity {
                    Activity::Quiz {
                        prompt, options, ..
                    } => format!("{prompt}|{}", options.join(",")),
                    _ => String::new(),
                })
                .collect::<Vec<_>>()
                .join("\n")
        };
        assert_ne!(
            serialize(&a),
            serialize(&b),
            "two seeds should not yield identical question sets"
        );
    }
}
