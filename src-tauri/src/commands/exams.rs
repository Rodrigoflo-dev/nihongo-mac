//! Unit exams — generated dynamically by sampling quiz/listening/write_sentence
//! activities from the unit's completed lessons.
//!
//! No content is duplicated in the schema; we just remix the existing lessons.

use chrono::Utc;
use rand::seq::SliceRandom;
use rusqlite::{params, Connection};
use serde::Serialize;
use tauri::State;

use crate::commands::missions::{apply_event, MissionEvent};
use crate::commands::player::{award_stars_internal, award_xp_internal};
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{Activity, LessonActivities, LessonResult, XpAward};

const XP_EXAM_BASE: i64 = 250;
const XP_EXAM_PER_CORRECT: i64 = 12;
const XP_EXAM_PASS_BONUS: i64 = 80;
const XP_EXAM_PERFECT_BONUS: i64 = 120;
const STAR_EXAM_PASS: i64 = 8;
const STAR_EXAM_PERFECT_BONUS: i64 = 6;

const EXAM_QUESTION_COUNT: usize = 10;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UnitExam {
    pub unit_id: i64,
    pub unit_title: String,
    pub unit_jp_title: Option<String>,
    pub activities: Vec<Activity>,
    pub all_lessons_complete: bool,
    pub best_score: Option<i64>,
    pub last_score: Option<i64>,
    pub completions: i64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UnitExamResult {
    pub score: i64,
    pub passed: bool,
    pub previous_best: Option<i64>,
    pub new_best: bool,
    pub award: XpAward,
}

#[tauri::command]
pub fn get_unit_exam(db: State<'_, DbState>, unit_id: i64) -> AppResult<UnitExam> {
    db.with(|c| build_unit_exam(c, unit_id))
}

fn build_unit_exam(c: &Connection, unit_id: i64) -> AppResult<UnitExam> {
    let (unit_title, unit_jp_title): (String, Option<String>) = c
        .query_row(
            "SELECT title, jp_title FROM units WHERE id = ?1",
            [unit_id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        )
        .map_err(|e| AppError::Database(format!("unit {unit_id}: {e}")))?;

    let lesson_total: i64 = c.query_row(
        "SELECT COUNT(*) FROM lessons WHERE unit_id = ?1",
        [unit_id],
        |r| r.get(0),
    )?;
    let lesson_completed: i64 = c.query_row(
        "SELECT COUNT(*) FROM lessons l
           JOIN lesson_progress p ON p.lesson_id = l.id
          WHERE l.unit_id = ?1 AND p.status = 'completed'",
        [unit_id],
        |r| r.get(0),
    )?;
    let all_lessons_complete = lesson_total > 0 && lesson_completed >= lesson_total;

    let (best_score, last_score, completions): (Option<i64>, Option<i64>, i64) = c
        .query_row(
            "SELECT best_score, last_score, completions FROM unit_exam_progress WHERE unit_id = ?1",
            [unit_id],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .unwrap_or((None, None, 0));

    let mut all_pool: Vec<Activity> = Vec::new();
    {
        let mut stmt = c.prepare(
            "SELECT activities_json FROM lessons WHERE unit_id = ?1 ORDER BY ordering, id",
        )?;
        let rows = stmt.query_map([unit_id], |r| r.get::<_, String>(0))?;
        for r in rows {
            let raw = r?;
            if let Ok(parsed) = serde_json::from_str::<LessonActivities>(&raw) {
                for a in parsed.activities {
                    if matches!(
                        a,
                        Activity::Quiz { .. }
                            | Activity::Listening { .. }
                            | Activity::WriteSentence { .. }
                    ) {
                        all_pool.push(a);
                    }
                }
            }
        }
    }

    let mut rng = rand::thread_rng();
    all_pool.shuffle(&mut rng);
    let picked = all_pool
        .into_iter()
        .take(EXAM_QUESTION_COUNT)
        .collect::<Vec<_>>();

    Ok(UnitExam {
        unit_id,
        unit_title,
        unit_jp_title,
        activities: picked,
        all_lessons_complete,
        best_score,
        last_score,
        completions,
    })
}

#[tauri::command]
pub fn complete_unit_exam(
    db: State<'_, DbState>,
    unit_id: i64,
    result: LessonResult,
) -> AppResult<UnitExamResult> {
    db.with(|c| {
        let score = if result.total_quizzes > 0 {
            ((result.correct_count as f64 / result.total_quizzes as f64) * 100.0) as i64
        } else {
            0
        };
        let passed = score >= 70;
        let perfect = result.total_quizzes > 0 && result.correct_count == result.total_quizzes;

        let previous_best: Option<i64> = c
            .query_row(
                "SELECT best_score FROM unit_exam_progress WHERE unit_id = ?1",
                [unit_id],
                |r| r.get(0),
            )
            .ok()
            .flatten();
        let new_best = previous_best.map_or(true, |b| score > b);

        c.execute(
            "INSERT INTO unit_exam_progress
                (unit_id, best_score, last_score, completions, last_attempt_at, passed_at)
             VALUES (?1, ?2, ?2, 1, datetime('now'),
                     CASE WHEN ?3 = 1 THEN datetime('now') ELSE NULL END)
             ON CONFLICT(unit_id) DO UPDATE SET
                 best_score = MAX(COALESCE(best_score, 0), ?2),
                 last_score = ?2,
                 completions = completions + 1,
                 last_attempt_at = datetime('now'),
                 passed_at = CASE
                     WHEN ?3 = 1 THEN COALESCE(passed_at, datetime('now'))
                     ELSE passed_at
                 END",
            params![unit_id, score, if passed { 1 } else { 0 }],
        )?;

        c.execute(
            "INSERT INTO activity_log (activity_type, item_id, correct, duration_seconds, metadata)
             VALUES ('unit_exam', ?1, ?2, ?3, NULL)",
            params![
                unit_id,
                if passed { 1 } else { 0 },
                result.seconds_spent
            ],
        )?;

        let now = Utc::now();
        let xp = XP_EXAM_BASE
            + result.correct_count * XP_EXAM_PER_CORRECT
            + if passed { XP_EXAM_PASS_BONUS } else { 0 }
            + if perfect { XP_EXAM_PERFECT_BONUS } else { 0 };
        let (xp_awarded, level_change) =
            award_xp_internal(c, xp, "unit_exam", Some(&unit_id.to_string()), now)?;

        let stars = if passed {
            STAR_EXAM_PASS + if perfect { STAR_EXAM_PERFECT_BONUS } else { 0 }
        } else {
            0
        };
        let stars_awarded = if stars > 0 {
            award_stars_internal(c, stars, "unit_exam", Some(&unit_id.to_string()))?
        } else {
            0
        };

        let outcome = apply_event(c, MissionEvent::KanjiReviewed, now)?;

        Ok(UnitExamResult {
            score,
            passed,
            previous_best,
            new_best,
            award: XpAward {
                xp_amount: xp_awarded + outcome.xp_awarded,
                star_amount: stars_awarded + outcome.stars_awarded,
                leveled_up: level_change.leveled_up
                    || outcome
                        .level_change
                        .as_ref()
                        .map(|c| c.leveled_up)
                        .unwrap_or(false),
                new_level: outcome
                    .level_change
                    .as_ref()
                    .map(|c| c.new_level)
                    .unwrap_or(level_change.new_level),
                previous_level: level_change.previous_level,
                completed_daily: outcome.completed_daily,
                completed_weekly: outcome.completed_weekly,
            },
        })
    })
}
