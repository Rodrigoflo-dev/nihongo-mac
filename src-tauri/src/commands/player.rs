//! Player-state commands: read progression, award XP/stars, level-up math.

use chrono::{DateTime, Utc};
use rusqlite::{params, Connection};
use tauri::State;

use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::PlayerState;

/// XP required to reach the next level. Friendly growth: linear baseline +
/// gentle level scaling so the curve never feels punishing.
pub fn xp_for_next_level(level: i64) -> i64 {
    100 + (level - 1) * 30
}

/// Title (es / jp) earned at a given level. Stored so the UI can refer to it
/// without recomputing.
pub fn title_for(level: i64) -> (&'static str, &'static str) {
    match level {
        ..=2 => ("Principiante", "初心者"),
        3..=5 => ("Aprendiz", "初学者"),
        6..=10 => ("Estudiante", "学生"),
        11..=20 => ("Intermedio", "中級者"),
        21..=35 => ("Avanzado", "上級者"),
        36..=50 => ("Experto", "達人"),
        _ => ("Maestro", "師範"),
    }
}

pub fn double_xp_active_at(conn: &Connection, now: DateTime<Utc>) -> AppResult<bool> {
    let until: Option<String> = conn
        .query_row(
            "SELECT double_xp_until FROM player_state WHERE id = 1",
            [],
            |r| r.get(0),
        )
        .map_err(|e| AppError::Database(format!("read double_xp_until: {e}")))?;
    Ok(match until {
        Some(s) => DateTime::parse_from_rfc3339(&s)
            .map(|d| d.with_timezone(&Utc) > now)
            .unwrap_or(false),
        None => false,
    })
}

pub struct LevelChange {
    pub leveled_up: bool,
    pub new_level: i64,
    pub previous_level: i64,
}

/// Add XP to the player. Applies double-XP multiplier when active. Handles
/// level rollover. Records an `xp_events` row for the source.
pub fn award_xp_internal(
    conn: &Connection,
    amount: i64,
    source: &str,
    reference: Option<&str>,
    now: DateTime<Utc>,
) -> AppResult<(i64, LevelChange)> {
    let amount = amount.max(0);
    if amount == 0 {
        return Ok((
            0,
            LevelChange {
                leveled_up: false,
                new_level: read_level(conn)?,
                previous_level: read_level(conn)?,
            },
        ));
    }

    let multiplier = if double_xp_active_at(conn, now)? { 2 } else { 1 };
    let effective = amount * multiplier;

    let (mut level, mut current, total): (i64, i64, i64) = conn
        .query_row(
            "SELECT level, current_level_xp, total_xp FROM player_state WHERE id = 1",
            [],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?)),
        )
        .map_err(|e| AppError::Database(format!("read xp: {e}")))?;

    let previous_level = level;
    current += effective;
    let new_total = total + effective;

    let mut last_up: Option<String> = None;
    loop {
        let threshold = xp_for_next_level(level);
        if current < threshold {
            break;
        }
        current -= threshold;
        level += 1;
        last_up = Some(now.to_rfc3339());
    }

    let (title, title_jp) = title_for(level);

    conn.execute(
        "UPDATE player_state
            SET level = ?1,
                total_xp = ?2,
                current_level_xp = ?3,
                title = ?4,
                title_jp = ?5,
                last_level_up_at = COALESCE(?6, last_level_up_at),
                updated_at = datetime('now')
          WHERE id = 1",
        params![level, new_total, current, title, title_jp, last_up],
    )?;

    conn.execute(
        "INSERT INTO xp_events (amount, star_amount, source, reference) VALUES (?1, 0, ?2, ?3)",
        params![effective, source, reference],
    )?;

    Ok((
        effective,
        LevelChange {
            leveled_up: level > previous_level,
            new_level: level,
            previous_level,
        },
    ))
}

pub fn award_stars_internal(
    conn: &Connection,
    amount: i64,
    source: &str,
    reference: Option<&str>,
) -> AppResult<i64> {
    if amount <= 0 {
        return Ok(0);
    }
    conn.execute(
        "UPDATE player_state SET stars = stars + ?1, updated_at = datetime('now') WHERE id = 1",
        [amount],
    )?;
    conn.execute(
        "INSERT INTO xp_events (amount, star_amount, source, reference) VALUES (0, ?1, ?2, ?3)",
        params![amount, source, reference],
    )?;
    Ok(amount)
}

fn read_level(conn: &Connection) -> AppResult<i64> {
    conn.query_row("SELECT level FROM player_state WHERE id = 1", [], |r| {
        r.get(0)
    })
    .map_err(|e| AppError::Database(format!("read level: {e}")))
}

pub fn read_player_state(conn: &Connection) -> AppResult<PlayerState> {
    let now = Utc::now();
    let today = now.format("%Y-%m-%d").to_string();

    // Unused XP-doble boosts the player can activate.
    let double_xp_available: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM reward_purchases p
               JOIN rewards r ON r.id = p.reward_id
              WHERE p.used_at IS NULL AND r.kind = 'double_xp_24h'",
            [],
            |r| r.get(0),
        )
        .unwrap_or(0);

    conn.query_row(
        "SELECT level, total_xp, current_level_xp, stars, title, title_jp,
                rest_days_available, rest_day_active_on, double_xp_until,
                last_level_up_at
           FROM player_state WHERE id = 1",
        [],
        |r| {
            let level: i64 = r.get(0)?;
            let total_xp: i64 = r.get(1)?;
            let current_level_xp: i64 = r.get(2)?;
            let stars: i64 = r.get(3)?;
            let title: String = r.get(4)?;
            let title_jp: String = r.get(5)?;
            let rest_days: i64 = r.get(6)?;
            let rest_day_active_on: Option<String> = r.get(7)?;
            let double_xp_until: Option<String> = r.get(8)?;
            let last_level_up_at: Option<String> = r.get(9)?;

            let xp_to_next = xp_for_next_level(level);
            let progress_pct = if xp_to_next > 0 {
                ((current_level_xp as f64 / xp_to_next as f64) * 100.0)
                    .clamp(0.0, 100.0) as i64
            } else {
                0
            };
            let double_xp_active = match double_xp_until.as_deref() {
                Some(s) => DateTime::parse_from_rfc3339(s)
                    .map(|d| d.with_timezone(&Utc) > now)
                    .unwrap_or(false),
                None => false,
            };
            let rest_day_active_today = rest_day_active_on.as_deref() == Some(&today);

            Ok(PlayerState {
                level,
                total_xp,
                current_level_xp,
                xp_to_next_level: xp_to_next,
                progress_pct,
                stars,
                title,
                title_jp,
                rest_days_available: rest_days,
                rest_day_active_today,
                double_xp_until,
                double_xp_active,
                double_xp_available,
                last_level_up_at,
            })
        },
    )
    .map_err(|e| AppError::Database(format!("read player_state: {e}")))
}

// ---------------------------------------------------------------------------
// Public command surface
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn get_player_state(db: State<'_, DbState>) -> AppResult<PlayerState> {
    db.with(|c| read_player_state(c))
}
