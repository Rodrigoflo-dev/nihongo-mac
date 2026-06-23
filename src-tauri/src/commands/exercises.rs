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

use rand::rngs::StdRng;
use rand::seq::SliceRandom;
use rand::Rng;
use rand::SeedableRng;
use rusqlite::Connection;
use serde::Serialize;
use tauri::State;

use crate::db::DbState;
use crate::error::AppResult;
use crate::models::{Activity, LessonActivities};

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
    s.split(['/', ',', '；', ';', '・'])
        .map(|x| x.trim())
        .find(|x| !x.is_empty())
        .unwrap_or(s.trim())
        .to_string()
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

/// Pull `n` distinct strings from `pool` excluding `exclude`, using the rng.
fn pick_distractors(
    rng: &mut StdRng,
    pool: &[String],
    exclude: &str,
    n: usize,
) -> Vec<String> {
    let mut candidates: Vec<String> = pool
        .iter()
        .filter(|s| !s.is_empty() && s.as_str() != exclude)
        .cloned()
        .collect();
    candidates.sort();
    candidates.dedup();
    candidates.shuffle(rng);
    candidates.into_iter().take(n).collect()
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
    kanji_pool: &[String],
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
    let distractors = pick_distractors(rng, kanji_pool, &item.jp, 3);
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
    meaning_pool: &[String],
    kanji_pool: &[String],
    reading_pool: &[String],
) -> Option<Activity> {
    let id = format!("gen-{band}-{idx}");
    match band {
        // Recognition: see the kanji/word, pick the meaning. 3 options.
        "facil" => {
            let prompt_jp = Some(item.jp.clone());
            let distractors = pick_distractors(rng, meaning_pool, &item.meaning, 2);
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
            let distractors = pick_distractors(rng, kanji_pool, &item.jp, 3);
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
        // Hard: reading recall (if kanji) else meaning→word with 4 options.
        _ => {
            if item.is_kanji && !item.reading.is_empty() {
                let distractors = pick_distractors(rng, reading_pool, &item.reading, 3);
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
                let distractors = pick_distractors(rng, kanji_pool, &item.jp, 3);
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
    meaning_pool: &[String],
) -> Option<Activity> {
    let mut distractors = pick_distractors(rng, meaning_pool, &item.meaning, 3);
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

/// Build a guiding hint for a "write" exercise: meaning + length + first sound,
/// so it nudges memory of HOW it's written without giving the whole answer.
fn reading_hint(meaning: &str, reading: &str) -> String {
    let n = reading.chars().count();
    let first = reading.chars().next().map(String::from).unwrap_or_default();
    format!("«{meaning}» · {n} caracteres, empieza con «{first}»")
}

/// "Escribe la lectura" — type the reading in hiragana (uses the JP keyboard /
/// romaji input). Accepts each variant when a reading lists several (よん／し).
fn build_write_reading(idx: usize, item: &Item) -> Option<Activity> {
    if item.reading.is_empty() {
        return None;
    }
    let accepted: Vec<String> = item
        .reading
        .split(['／', '/', '・', ';', '；', ',', '、'])
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();
    if accepted.is_empty() {
        return None;
    }
    let hint = reading_hint(&item.meaning, &accepted[0]);
    Some(Activity::WriteSentence {
        id: format!("gen-write-{idx}"),
        prompt: format!("Escribe en hiragana cómo se lee {}", item.jp),
        hint: Some(hint),
        accepted,
        explanation: rich_explanation(item),
    })
}

/// "Escribe la palabra" — write the WORD in Japanese from its meaning. The hint
/// shows WHICH kanji you need to build it (memorize the components), and we
/// accept either the kanji form or its kana reading.
fn build_write_word(idx: usize, item: &Item) -> Option<Activity> {
    // Only for multi-character words that actually contain kanji.
    let kanji: Vec<String> = item
        .jp
        .chars()
        .filter(|c| is_kanji_char(*c))
        .map(String::from)
        .collect();
    if item.jp.chars().count() < 2 || kanji.is_empty() {
        return None;
    }
    let mut accepted = vec![item.jp.clone()];
    if !item.reading.is_empty() {
        for r in item
            .reading
            .split(['／', '/', '・', ';', '；', ',', '、'])
            .map(|s| s.trim())
            .filter(|s| !s.is_empty())
        {
            accepted.push(r.to_string());
        }
    }
    let hint = format!(
        "Necesitas estos kanji: {} · se lee «{}»",
        kanji.join(" + "),
        item.reading
    );
    Some(Activity::WriteSentence {
        id: format!("gen-word-{idx}"),
        prompt: format!("Escribe «{}» en japonés", item.meaning),
        hint: Some(hint),
        accepted,
        explanation: rich_explanation(item),
    })
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

/// Pick an exercise for a band with VARIETY: each band has a chance to use a
/// richer modality (audio / writing / drawing) when applicable, otherwise it
/// falls back to the band's default multiple-choice question. This keeps the 20
/// exercises from feeling repetitive.
#[allow(clippy::too_many_arguments)]
fn build_for_band(
    rng: &mut StdRng,
    idx: usize,
    band: &str,
    item: &Item,
    meaning_pool: &[String],
    kanji_pool: &[String],
    reading_pool: &[String],
) -> Option<Activity> {
    let roll = rng.gen_range(0..4);
    let alt = match band {
        // fácil: sometimes "¿cómo suena?" (audio → meaning)
        "facil" => {
            if roll <= 1 {
                build_listen(rng, idx, item, meaning_pool)
            } else {
                None
            }
        }
        // medio: writing practice (with hints) — type the word or its reading
        "medio" => match roll {
            0 => build_write_word(idx, item).or_else(|| build_write_reading(idx, item)),
            1 => build_write_reading(idx, item),
            2 => build_listen(rng, idx, item, meaning_pool),
            _ => None,
        },
        // difícil: draw the kanji, or fill-the-blank in a real sentence
        _ => match roll {
            0 => build_draw(idx, item),
            1 => build_blank_exercise(rng, idx, item, kanji_pool),
            2 => build_write_word(idx, item),
            _ => None,
        },
    };
    alt.or_else(|| build_exercise(rng, idx, band, item, meaning_pool, kanji_pool, reading_pool))
}

/// Core generator (pure, testable): produce up to TOTAL exercises for a lesson.
pub fn generate(conn: &Connection, lesson_id: i64, seed: u64) -> Vec<GeneratedExercise> {
    let mut rng = StdRng::seed_from_u64(seed ^ (lesson_id as u64).wrapping_mul(0x9E3779B97F4A7C15));
    let level = lesson_level(conn, lesson_id);
    let catalog = catalog_kanji(conn, &level);

    // TARGETS = only what THIS lesson actually taught (intro_kanji/intro_vocab).
    // We never quiz the learner on catalog items they were never shown — that was
    // unfair (you'd fail kanji that were never in the explanation). If a lesson
    // teaches few items we just drill those with more question variety. Only when
    // a lesson has NO taught items at all do we fall back to the level catalog.
    let mut items = taught_items(conn, lesson_id);
    if items.is_empty() {
        items = catalog.clone();
        items.shuffle(&mut rng);
        items.truncate(10);
    }
    if items.is_empty() {
        return vec![];
    }

    // Distractor pools (level-appropriate). Catalog guarantees these are full.
    let meaning_pool: Vec<String> = catalog
        .iter()
        .map(|i| i.meaning.clone())
        .chain(items.iter().map(|i| i.meaning.clone()))
        .collect();
    let kanji_pool: Vec<String> = catalog
        .iter()
        .map(|i| i.jp.clone())
        .chain(items.iter().map(|i| i.jp.clone()))
        .collect();
    let reading_pool: Vec<String> = catalog
        .iter()
        .map(|i| i.reading.clone())
        .chain(items.iter().map(|i| i.reading.clone()))
        .filter(|r| !r.is_empty())
        .collect();

    // Bands: cycle items (shuffled per band) so each exercise targets one.
    let bands: [(&str, usize); 3] = [
        ("facil", N_FACIL),
        ("medio", N_MEDIO),
        ("dificil", TOTAL - N_FACIL - N_MEDIO),
    ];

    let mut out = Vec::with_capacity(TOTAL);
    let mut global_idx = 0usize;
    for (band, count) in bands {
        let mut order: Vec<usize> = (0..items.len()).collect();
        order.shuffle(&mut rng);
        let mut oi = 0usize;
        let mut made = 0usize;
        let mut guard = 0usize;
        while made < count && guard < count * 6 {
            guard += 1;
            let item = &items[order[oi % order.len()]].clone();
            oi += 1;
            let activity = build_for_band(
                &mut rng,
                global_idx,
                band,
                item,
                &meaning_pool,
                &kanji_pool,
                &reading_pool,
            );
            if let Some(activity) = activity {
                out.push(GeneratedExercise {
                    activity,
                    difficulty: band.to_string(),
                });
                global_idx += 1;
                made += 1;
            }
        }
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
                options,
                correct_index,
                ..
            } = &e.activity
            {
                let correct = &options[*correct_index];
                assert!(
                    allowed.contains(correct),
                    "correct answer '{correct}' must come from a TAUGHT item (lesson {lesson_id}); the learner was never shown untaught material"
                );
            }
        }
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
