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
        crate::commands::bump_daily_session(c, now, "exam", result.seconds_spent)?;
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

// =============================================================================
// Level final exams — pass a level's final exam (>= 60%) to UNLOCK the next
// level in "Curso". The learner only ever sees their unlocked level(s).
// =============================================================================

const LEVEL_SEQUENCE: &[&str] = &["N5", "N4", "N3", "N2", "N1"];
const LEVEL_EXAM_QUESTION_COUNT: usize = 15;
const LEVEL_PASS_THRESHOLD: i64 = 60;

fn level_rank(level: &str) -> usize {
    LEVEL_SEQUENCE.iter().position(|l| *l == level).unwrap_or(0)
}

fn next_level(level: &str) -> Option<&'static str> {
    let i = LEVEL_SEQUENCE.iter().position(|l| *l == level)?;
    LEVEL_SEQUENCE.get(i + 1).copied()
}

/// The highest JLPT level the learner has unlocked (default N5).
#[tauri::command]
pub fn get_unlocked_level(db: State<'_, DbState>) -> AppResult<String> {
    db.with(|c| {
        Ok(c.query_row("SELECT unlocked_level FROM player_state WHERE id = 1", [], |r| {
            r.get::<_, String>(0)
        })
        .unwrap_or_else(|_| "N5".to_string()))
    })
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LevelExam {
    pub level: String,
    pub activities: Vec<Activity>,
    pub all_lessons_complete: bool,
    pub lessons_total: i64,
    pub lessons_completed: i64,
    pub best_score: Option<i64>,
    pub last_score: Option<i64>,
    pub completions: i64,
    pub pass_threshold: i64,
    pub next_level: Option<String>,
}

#[tauri::command]
pub fn get_level_exam(db: State<'_, DbState>, level: String) -> AppResult<LevelExam> {
    db.with(|c| build_level_exam(c, &level))
}

fn build_level_exam(c: &Connection, level: &str) -> AppResult<LevelExam> {
    let lessons_total: i64 = c.query_row(
        "SELECT COUNT(*) FROM lessons l
           JOIN units u ON u.id = l.unit_id
           JOIN courses c ON c.id = u.course_id
          WHERE c.jlpt_level = ?1",
        [level],
        |r| r.get(0),
    )?;
    let lessons_completed: i64 = c.query_row(
        "SELECT COUNT(*) FROM lessons l
           JOIN units u ON u.id = l.unit_id
           JOIN courses c ON c.id = u.course_id
           JOIN lesson_progress p ON p.lesson_id = l.id
          WHERE c.jlpt_level = ?1 AND p.status = 'completed'",
        [level],
        |r| r.get(0),
    )?;
    let all_lessons_complete = lessons_total > 0 && lessons_completed >= lessons_total;

    let (best_score, last_score, completions): (Option<i64>, Option<i64>, i64) = c
        .query_row(
            "SELECT best_score, last_score, completions FROM level_exam_progress WHERE level = ?1",
            [level],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .unwrap_or((None, None, 0));

    // Pool of multiple-choice questions from every lesson at this level.
    let mut pool: Vec<Activity> = Vec::new();
    {
        let mut stmt = c.prepare(
            "SELECT l.activities_json FROM lessons l
               JOIN units u ON u.id = l.unit_id
               JOIN courses c ON c.id = u.course_id
              WHERE c.jlpt_level = ?1",
        )?;
        let rows = stmt.query_map([level], |r| r.get::<_, String>(0))?;
        for r in rows {
            let raw = r?;
            if let Ok(parsed) = serde_json::from_str::<LessonActivities>(&raw) {
                for a in parsed.activities {
                    if matches!(a, Activity::Quiz { .. } | Activity::Listening { .. }) {
                        pool.push(a);
                    }
                }
            }
        }
    }
    let mut rng = rand::thread_rng();
    pool.shuffle(&mut rng);
    let activities = pool
        .into_iter()
        .take(LEVEL_EXAM_QUESTION_COUNT)
        .collect::<Vec<_>>();

    Ok(LevelExam {
        level: level.to_string(),
        activities,
        all_lessons_complete,
        lessons_total,
        lessons_completed,
        best_score,
        last_score,
        completions,
        pass_threshold: LEVEL_PASS_THRESHOLD,
        next_level: next_level(level).map(|s| s.to_string()),
    })
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LevelExamResult {
    pub score: i64,
    pub passed: bool,
    pub unlocked_level: String,
    pub unlocked_next: bool,
    pub next_level: Option<String>,
    pub award: XpAward,
}

#[tauri::command]
pub fn complete_level_exam(
    db: State<'_, DbState>,
    level: String,
    result: LessonResult,
) -> AppResult<LevelExamResult> {
    db.with(|c| {
        let score = if result.total_quizzes > 0 {
            ((result.correct_count as f64 / result.total_quizzes as f64) * 100.0) as i64
        } else {
            0
        };
        let passed = score >= LEVEL_PASS_THRESHOLD;

        c.execute(
            "INSERT INTO level_exam_progress
                (level, best_score, last_score, completions, last_attempt_at, passed_at)
             VALUES (?1, ?2, ?2, 1, datetime('now'),
                     CASE WHEN ?3 = 1 THEN datetime('now') ELSE NULL END)
             ON CONFLICT(level) DO UPDATE SET
                 best_score = MAX(COALESCE(best_score, 0), ?2),
                 last_score = ?2,
                 completions = completions + 1,
                 last_attempt_at = datetime('now'),
                 passed_at = CASE WHEN ?3 = 1 THEN COALESCE(passed_at, datetime('now')) ELSE passed_at END",
            params![level, score, if passed { 1 } else { 0 }],
        )?;

        // Unlock the next level on a pass.
        let mut unlocked_next = false;
        let next = next_level(&level);
        if passed {
            if let Some(next) = next {
                let current: String = c
                    .query_row("SELECT unlocked_level FROM player_state WHERE id = 1", [], |r| {
                        r.get(0)
                    })
                    .unwrap_or_else(|_| "N5".to_string());
                if level_rank(next) > level_rank(&current) {
                    c.execute(
                        "UPDATE player_state SET unlocked_level = ?1 WHERE id = 1",
                        [next],
                    )?;
                    unlocked_next = true;
                }
            }
        }

        let now = Utc::now();
        crate::commands::bump_daily_session(c, now, "exam", result.seconds_spent)?;
        let perfect = result.total_quizzes > 0 && result.correct_count == result.total_quizzes;
        let xp = XP_EXAM_BASE
            + result.correct_count * XP_EXAM_PER_CORRECT
            + if passed { XP_EXAM_PASS_BONUS } else { 0 }
            + if perfect { XP_EXAM_PERFECT_BONUS } else { 0 };
        let (xp_awarded, level_change) =
            award_xp_internal(c, xp, "level_exam", Some(&level), now)?;
        let stars = if passed { STAR_EXAM_PASS } else { 0 };
        let stars_awarded = if stars > 0 {
            award_stars_internal(c, stars, "level_exam", Some(&level))?
        } else {
            0
        };

        let unlocked_level: String = c
            .query_row("SELECT unlocked_level FROM player_state WHERE id = 1", [], |r| {
                r.get(0)
            })
            .unwrap_or_else(|_| "N5".to_string());

        Ok(LevelExamResult {
            score,
            passed,
            unlocked_level,
            unlocked_next,
            next_level: next.map(|s| s.to_string()),
            award: XpAward {
                xp_amount: xp_awarded,
                star_amount: stars_awarded,
                leveled_up: level_change.leveled_up,
                new_level: level_change.new_level,
                previous_level: level_change.previous_level,
                completed_daily: Vec::new(),
                completed_weekly: Vec::new(),
            },
        })
    })
}
