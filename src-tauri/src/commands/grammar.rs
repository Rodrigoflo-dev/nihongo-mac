use chrono::Utc;
use rusqlite::{params, Connection};
use tauri::State;

use crate::commands::missions::{apply_event, MissionEvent};
use crate::commands::player::award_xp_internal;
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{
    GrammarExample, GrammarLesson, GrammarLessonData, GrammarListItem, GrammarQuizResult,
    QuizQuestion, XpAward,
};

const XP_LESSON_VIEW: i64 = 15;
const XP_QUIZ_PASS: i64 = 60;
const XP_QUIZ_PERFECT_BONUS: i64 = 30;

fn parse_data(raw: Option<String>) -> (Vec<GrammarExample>, Vec<QuizQuestion>) {
    raw.and_then(|s| serde_json::from_str::<GrammarLessonData>(&s).ok())
        .map(|d| (d.examples, d.quiz))
        .unwrap_or_default()
}

#[tauri::command]
pub fn list_grammar(db: State<'_, DbState>, level: String) -> AppResult<Vec<GrammarListItem>> {
    db.with(|c| {
        let mut stmt = c.prepare(
            "SELECT l.id, l.title, l.jlpt_level, l.category, l.structure,
                    COALESCE(p.status, 'new') AS status,
                    COALESCE(p.confidence, 0) AS confidence,
                    l.ordering
               FROM grammar_lessons l
               LEFT JOIN grammar_progress p ON p.lesson_id = l.id
              WHERE l.jlpt_level = ?1
              ORDER BY l.ordering, l.id",
        )?;
        let rows = stmt.query_map([level.as_str()], |r| {
            Ok(GrammarListItem {
                id: r.get(0)?,
                title: r.get(1)?,
                jlpt_level: r.get(2)?,
                category: r.get(3)?,
                structure: r.get(4)?,
                status: r.get(5)?,
                confidence: r.get(6)?,
                ordering: r.get(7)?,
            })
        })?;
        let mut out = Vec::new();
        for r in rows {
            out.push(r?);
        }
        Ok(out)
    })
}

#[tauri::command]
pub fn get_grammar_lesson(db: State<'_, DbState>, lesson_id: i64) -> AppResult<GrammarLesson> {
    db.with(|c| read_lesson(c, lesson_id))
}

fn read_lesson(conn: &Connection, lesson_id: i64) -> AppResult<GrammarLesson> {
    conn.query_row(
        "SELECT l.id, l.title, l.jlpt_level, l.category, l.explanation_md, l.structure,
                l.examples, l.difficulty, l.ordering,
                COALESCE(p.status, 'new'),
                COALESCE(p.confidence, 0),
                p.last_quiz_score
           FROM grammar_lessons l
           LEFT JOIN grammar_progress p ON p.lesson_id = l.id
          WHERE l.id = ?1",
        [lesson_id],
        |r| {
            let raw: Option<String> = r.get(6)?;
            let (examples, quiz) = parse_data(raw);
            Ok(GrammarLesson {
                id: r.get(0)?,
                title: r.get(1)?,
                jlpt_level: r.get(2)?,
                category: r.get(3)?,
                explanation_md: r.get(4)?,
                structure: r.get(5)?,
                examples,
                quiz,
                difficulty: r.get(7)?,
                ordering: r.get(8)?,
                status: r.get(9)?,
                confidence: r.get(10)?,
                last_quiz_score: r.get(11)?,
            })
        },
    )
    .map_err(|e| AppError::Database(format!("read lesson {lesson_id}: {e}")))
}

/// Called when the user opens a lesson — graduates it from 'new' to 'learning'
/// and awards a small XP reward (idempotent for already-started lessons).
#[tauri::command]
pub fn start_grammar_lesson(
    db: State<'_, DbState>,
    lesson_id: i64,
) -> AppResult<GrammarLesson> {
    db.with(|c| {
        let already_started: i64 = c
            .query_row(
                "SELECT COUNT(*) FROM grammar_progress
                  WHERE lesson_id = ?1 AND status != 'new'",
                [lesson_id],
                |r| r.get(0),
            )
            .unwrap_or(0);

        c.execute(
            "INSERT INTO grammar_progress (lesson_id, status, confidence, times_seen)
             VALUES (?1, 'learning', 0, 1)
             ON CONFLICT(lesson_id) DO UPDATE SET
                 status = CASE WHEN status = 'mastered' THEN 'mastered' ELSE 'learning' END,
                 times_seen = times_seen + 1",
            [lesson_id],
        )?;

        if already_started == 0 {
            let now = Utc::now();
            award_xp_internal(c, XP_LESSON_VIEW, "grammar_lesson_started", Some(&lesson_id.to_string()), now)?;
        }

        read_lesson(c, lesson_id)
    })
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuizSubmission {
    pub answers: Vec<QuizAnswer>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuizAnswer {
    pub question_id: String,
    pub option_index: usize,
}

#[tauri::command]
pub fn submit_grammar_quiz(
    db: State<'_, DbState>,
    lesson_id: i64,
    submission: QuizSubmission,
) -> AppResult<GrammarQuizResult> {
    db.with(|c| {
        let lesson = read_lesson(c, lesson_id)?;
        let total = lesson.quiz.len() as i64;
        if total == 0 {
            return Err(AppError::InvalidInput("lección sin quiz".into()));
        }

        let mut correct = 0i64;
        for q in &lesson.quiz {
            if let Some(answer) = submission.answers.iter().find(|a| a.question_id == q.id) {
                if let Some(opt) = q.options.get(answer.option_index) {
                    if opt.correct {
                        correct += 1;
                    }
                }
            }
        }
        let score = (correct as f64 / total as f64) * 100.0;
        let passed = score >= 70.0;
        let perfect = correct == total;

        let new_status = if passed { "mastered" } else { "learning" };
        let new_confidence = ((lesson.confidence as f64 * 0.4) + (score * 0.6)) as i64;

        c.execute(
            "UPDATE grammar_progress
                SET status = ?1,
                    confidence = ?2,
                    last_quiz_at = datetime('now'),
                    last_quiz_score = ?3,
                    times_seen = times_seen + 1,
                    times_correct = times_correct + ?4
              WHERE lesson_id = ?5",
            params![new_status, new_confidence, score, correct, lesson_id],
        )?;

        c.execute(
            "INSERT INTO activity_log (activity_type, item_id, correct, duration_seconds, metadata)
             VALUES ('grammar_quiz', ?1, ?2, 0, NULL)",
            params![lesson_id, if passed { 1 } else { 0 }],
        )?;

        let now = Utc::now();
        let xp_total =
            if passed { XP_QUIZ_PASS } else { 20 } + if perfect { XP_QUIZ_PERFECT_BONUS } else { 0 };
        let (xp_awarded, level_change) = award_xp_internal(
            c,
            xp_total,
            "grammar_quiz",
            Some(&lesson_id.to_string()),
            now,
        )?;

        let outcome = apply_event(c, MissionEvent::KanjiReviewed, now)?;
        // (we don't have a grammar-specific mission event — Kanji event keeps
        // mission progression simple for now; future: dedicated event types.)
        let _ = outcome;

        Ok(GrammarQuizResult {
            score,
            correct,
            total,
            passed,
            award: XpAward {
                xp_amount: xp_awarded,
                star_amount: 0,
                leveled_up: level_change.leveled_up,
                new_level: level_change.new_level,
                previous_level: level_change.previous_level,
                completed_daily: vec![],
                completed_weekly: vec![],
            },
        })
    })
}
