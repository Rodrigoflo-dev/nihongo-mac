pub mod auth;
pub mod dashboard;
pub mod exams;
pub mod exercises;
pub mod grammar;
pub mod guidance;
pub mod journal;
pub mod kanji;
pub mod lessons;
pub mod listening;
pub mod minigames;
pub mod missions;
pub mod notifications;
pub mod player;
pub mod reading;
pub mod rewards;
pub mod user;

use chrono::{DateTime, Utc};
use rusqlite::{params, Connection};

use crate::error::AppResult;

/// Shared: record that the user studied today, accumulating minutes + activity
/// counts into `daily_sessions`. EVERY "complete an activity" command must call
/// this so "Tiempo aprendido" and "Días activos" reflect ALL study (lessons,
/// listening, reading, grammar, exams, minigames, kanji), not just kanji review.
///
/// `activity` is one of: "kanji" | "vocab" | "grammar" | "listening" |
/// "speaking" | "lesson" | "reading" | "exam" | "game" (used for the per-skill
/// counters; unknown values still count toward minutes + days).
pub fn bump_daily_session(
    conn: &Connection,
    now: DateTime<Utc>,
    activity: &str,
    duration_seconds: i64,
) -> AppResult<()> {
    let today = now.format("%Y-%m-%d").to_string();
    // Round to the nearest minute (so a 90s activity counts as ~2 min, and a
    // 40s one still counts as 1) — short sessions used to vanish to 0.
    let minutes_delta = ((duration_seconds + 30) / 60).max(if duration_seconds > 0 { 1 } else { 0 });

    conn.execute(
        "INSERT INTO daily_sessions (session_date, minutes_studied, activities_completed,
                                     kanji_reviewed, vocab_reviewed, grammar_completed,
                                     listening_minutes, speaking_minutes, journaled)
         VALUES (?1, ?2, 1,
                 CASE WHEN ?3 = 'kanji' THEN 1 ELSE 0 END,
                 CASE WHEN ?3 = 'vocab' THEN 1 ELSE 0 END,
                 CASE WHEN ?3 = 'grammar' THEN 1 ELSE 0 END,
                 CASE WHEN ?3 = 'listening' THEN ?2 ELSE 0 END,
                 CASE WHEN ?3 = 'speaking' THEN ?2 ELSE 0 END, 0)
         ON CONFLICT(session_date) DO UPDATE SET
             minutes_studied = minutes_studied + excluded.minutes_studied,
             activities_completed = activities_completed + 1,
             kanji_reviewed = kanji_reviewed + (CASE WHEN ?3 = 'kanji' THEN 1 ELSE 0 END),
             vocab_reviewed = vocab_reviewed + (CASE WHEN ?3 = 'vocab' THEN 1 ELSE 0 END),
             grammar_completed = grammar_completed + (CASE WHEN ?3 = 'grammar' THEN 1 ELSE 0 END),
             listening_minutes = listening_minutes + (CASE WHEN ?3 = 'listening' THEN excluded.minutes_studied ELSE 0 END),
             speaking_minutes = speaking_minutes + (CASE WHEN ?3 = 'speaking' THEN excluded.minutes_studied ELSE 0 END)",
        params![today, minutes_delta, activity],
    )?;
    Ok(())
}
