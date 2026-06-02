//! Reward shop: list catalog, purchase items, claim or activate them.

use chrono::{Duration, Utc};
use rusqlite::{params, Connection};
use tauri::State;

use crate::commands::player::read_player_state;
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{PlayerState, Reward, RewardPurchaseResult};

fn read_reward(conn: &Connection, reward_id: i64) -> AppResult<Reward> {
    conn.query_row(
        "SELECT r.id, r.key, r.name, r.description, r.icon, r.cost, r.kind,
                COALESCE(SUM(CASE WHEN p.used_at IS NULL THEN p.quantity ELSE 0 END), 0)
           FROM rewards r
           LEFT JOIN reward_purchases p ON p.reward_id = r.id
          WHERE r.id = ?1
          GROUP BY r.id",
        [reward_id],
        |r| {
            Ok(Reward {
                id: r.get(0)?,
                key: r.get(1)?,
                name: r.get(2)?,
                description: r.get(3)?,
                icon: r.get(4)?,
                cost: r.get(5)?,
                kind: r.get(6)?,
                owned_quantity: r.get(7)?,
            })
        },
    )
    .map_err(|e| AppError::Database(format!("read reward {reward_id}: {e}")))
}

#[tauri::command]
pub fn list_rewards(db: State<'_, DbState>) -> AppResult<Vec<Reward>> {
    db.with(|c| {
        let mut stmt = c.prepare(
            "SELECT r.id, r.key, r.name, r.description, r.icon, r.cost, r.kind,
                    COALESCE(SUM(CASE WHEN p.used_at IS NULL THEN p.quantity ELSE 0 END), 0) AS owned
               FROM rewards r
               LEFT JOIN reward_purchases p ON p.reward_id = r.id
              GROUP BY r.id
              ORDER BY r.cost",
        )?;
        let rows = stmt.query_map([], |r| {
            Ok(Reward {
                id: r.get(0)?,
                key: r.get(1)?,
                name: r.get(2)?,
                description: r.get(3)?,
                icon: r.get(4)?,
                cost: r.get(5)?,
                kind: r.get(6)?,
                owned_quantity: r.get(7)?,
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
pub fn purchase_reward(
    db: State<'_, DbState>,
    reward_id: i64,
) -> AppResult<RewardPurchaseResult> {
    db.with(|c| {
        let reward = read_reward(c, reward_id)?;
        let stars: i64 = c.query_row("SELECT stars FROM player_state WHERE id = 1", [], |r| {
            r.get(0)
        })?;
        if stars < reward.cost {
            return Err(AppError::InvalidInput(format!(
                "no tienes suficientes estrellas (necesitas {}, tienes {})",
                reward.cost, stars
            )));
        }

        c.execute(
            "UPDATE player_state SET stars = stars - ?1 WHERE id = 1",
            [reward.cost],
        )?;

        // For consumable rewards we record an unused purchase. For one-shot
        // unlocks (themes), we still record a purchase but with metadata so the
        // shop can mark them as owned.
        c.execute(
            "INSERT INTO reward_purchases (reward_id, quantity) VALUES (?1, 1)",
            [reward_id],
        )?;

        // Increment any directly-applicable counters so the UI reflects state
        // immediately (rest_days_available).
        if reward.kind == "rest_day" {
            c.execute(
                "UPDATE player_state SET rest_days_available = rest_days_available + 1 WHERE id = 1",
                [],
            )?;
        }

        let stars_remaining: i64 = c
            .query_row("SELECT stars FROM player_state WHERE id = 1", [], |r| r.get(0))?;

        let reward = read_reward(c, reward_id)?;
        Ok(RewardPurchaseResult {
            success: true,
            stars_remaining,
            reward,
        })
    })
}

#[tauri::command]
pub fn activate_double_xp(db: State<'_, DbState>) -> AppResult<PlayerState> {
    db.with(|c| {
        // Find an unused double_xp_24h purchase
        let purchase_id: Option<i64> = c
            .query_row(
                "SELECT p.id FROM reward_purchases p
                   JOIN rewards r ON r.id = p.reward_id
                  WHERE p.used_at IS NULL AND r.kind = 'double_xp_24h'
                  ORDER BY p.id ASC LIMIT 1",
                [],
                |r| r.get(0),
            )
            .ok()
            .flatten();

        let purchase_id = purchase_id
            .ok_or_else(|| AppError::InvalidInput("no tienes un boost de XP doble".into()))?;

        let until = Utc::now() + Duration::hours(24);
        c.execute(
            "UPDATE player_state SET double_xp_until = ?1 WHERE id = 1",
            [until.to_rfc3339()],
        )?;
        c.execute(
            "UPDATE reward_purchases SET used_at = datetime('now') WHERE id = ?1",
            [purchase_id],
        )?;
        read_player_state(c)
    })
}

#[tauri::command]
pub fn claim_rest_day(db: State<'_, DbState>) -> AppResult<PlayerState> {
    db.with(|c| {
        let now = Utc::now();
        let today = now.format("%Y-%m-%d").to_string();

        let available: i64 = c.query_row(
            "SELECT rest_days_available FROM player_state WHERE id = 1",
            [],
            |r| r.get(0),
        )?;
        if available <= 0 {
            return Err(AppError::InvalidInput(
                "no tienes días libres disponibles".into(),
            ));
        }

        c.execute(
            "UPDATE player_state
                SET rest_days_available = rest_days_available - 1,
                    rest_day_active_on = ?1
              WHERE id = 1",
            [today.as_str()],
        )?;

        // Mark today's daily missions as automatically completed (their
        // rewards are NOT granted — this is a rest, not a freebie XP day).
        c.execute(
            "UPDATE daily_missions
                SET completed = 1,
                    completed_at = ?1,
                    progress = target_value
              WHERE mission_date = ?2 AND completed = 0",
            params![now.to_rfc3339(), today],
        )?;

        read_player_state(c)
    })
}
