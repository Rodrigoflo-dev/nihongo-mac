//! Mini-games — store scores and award XP based on performance.

use chrono::Utc;
use rusqlite::params;
use serde::Serialize;
use tauri::State;

use crate::commands::missions::{apply_event, MissionEvent};
use crate::commands::player::{award_stars_internal, award_xp_internal};
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::XpAward;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MinigameResult {
    pub score: i64,
    pub best_score: i64,
    pub new_best: bool,
    pub award: XpAward,
}

fn xp_for_game(game_key: &str, score: i64) -> i64 {
    match game_key {
        "kanji_match" => 80 + score * 5,
        "hiragana_speed" => 60 + score * 4,
        _ => 50 + score * 3,
    }
}

fn stars_for_game(game_key: &str, score: i64, best: i64) -> i64 {
    let new_best = score > best;
    match game_key {
        "kanji_match" => {
            let base = if score >= 8 { 3 } else if score >= 4 { 1 } else { 0 };
            base + if new_best { 2 } else { 0 }
        }
        "hiragana_speed" => {
            let base = if score >= 20 { 3 } else if score >= 10 { 1 } else { 0 };
            base + if new_best { 2 } else { 0 }
        }
        _ => if new_best { 2 } else { 0 },
    }
}

#[tauri::command]
pub fn get_minigame_best(db: State<'_, DbState>, game_key: String) -> AppResult<i64> {
    db.with(|c| {
        c.query_row(
            "SELECT COALESCE(MAX(score), 0) FROM minigame_scores WHERE game_key = ?1",
            [game_key.as_str()],
            |r| r.get(0),
        )
        .map_err(|e| AppError::Database(format!("best score {game_key}: {e}")))
    })
}

#[tauri::command]
pub fn record_minigame_score(
    db: State<'_, DbState>,
    game_key: String,
    score: i64,
    duration_seconds: Option<i64>,
) -> AppResult<MinigameResult> {
    db.with(|c| {
        let previous_best: i64 = c
            .query_row(
                "SELECT COALESCE(MAX(score), 0) FROM minigame_scores WHERE game_key = ?1",
                [game_key.as_str()],
                |r| r.get(0),
            )
            .unwrap_or(0);

        c.execute(
            "INSERT INTO minigame_scores (game_key, score, duration_seconds)
             VALUES (?1, ?2, ?3)",
            params![game_key, score, duration_seconds.unwrap_or(0)],
        )?;

        c.execute(
            "INSERT INTO activity_log (activity_type, item_id, item_ref, correct, duration_seconds, metadata)
             VALUES ('minigame', NULL, ?1, 1, ?2, NULL)",
            params![game_key, duration_seconds.unwrap_or(0)],
        )?;

        let new_best_score = score.max(previous_best);
        let new_best = score > previous_best;

        let now = Utc::now();
        let xp = xp_for_game(&game_key, score);
        let stars = stars_for_game(&game_key, score, previous_best);

        let (xp_awarded, level_change) =
            award_xp_internal(c, xp, "minigame", Some(&game_key), now)?;
        let stars_awarded = if stars > 0 {
            award_stars_internal(c, stars, "minigame", Some(&game_key))?
        } else {
            0
        };

        let outcome = apply_event(c, MissionEvent::KanjiReviewed, now)?;

        Ok(MinigameResult {
            score,
            best_score: new_best_score,
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
