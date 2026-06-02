use rusqlite::{params, Connection};
use tauri::State;

use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{CompleteOnboardingInput, UpdateUserProfileInput, UserProfile};

fn read_profile(conn: &Connection) -> AppResult<UserProfile> {
    conn.query_row(
        "SELECT id, name, target_level, current_level, knows_hiragana,
                knows_katakana, daily_minutes_goal, reminder_time, locale,
                onboarded_at, created_at, updated_at
         FROM user_profile WHERE id = 1",
        [],
        |r| {
            Ok(UserProfile {
                id: r.get(0)?,
                name: r.get(1)?,
                target_level: r.get(2)?,
                current_level: r.get(3)?,
                knows_hiragana: r.get::<_, i64>(4)? != 0,
                knows_katakana: r.get::<_, i64>(5)? != 0,
                daily_minutes_goal: r.get(6)?,
                reminder_time: r.get(7)?,
                locale: r.get(8)?,
                onboarded_at: r.get(9)?,
                created_at: r.get(10)?,
                updated_at: r.get(11)?,
            })
        },
    )
    .map_err(|e| AppError::Database(format!("read profile: {e}")))
}

#[tauri::command]
pub fn get_user_profile(db: State<'_, DbState>) -> AppResult<UserProfile> {
    db.with(|c| read_profile(c))
}

#[tauri::command]
pub fn update_user_profile(
    db: State<'_, DbState>,
    input: UpdateUserProfileInput,
) -> AppResult<UserProfile> {
    db.with(|c| {
        c.execute(
            "UPDATE user_profile SET
                name = COALESCE(?1, name),
                target_level = COALESCE(?2, target_level),
                current_level = COALESCE(?3, current_level),
                knows_hiragana = COALESCE(?4, knows_hiragana),
                knows_katakana = COALESCE(?5, knows_katakana),
                daily_minutes_goal = COALESCE(?6, daily_minutes_goal),
                reminder_time = COALESCE(?7, reminder_time),
                locale = COALESCE(?8, locale),
                updated_at = datetime('now')
             WHERE id = 1",
            params![
                input.name,
                input.target_level,
                input.current_level,
                input.knows_hiragana.map(|b| if b { 1 } else { 0 }),
                input.knows_katakana.map(|b| if b { 1 } else { 0 }),
                input.daily_minutes_goal,
                input.reminder_time,
                input.locale,
            ],
        )?;
        read_profile(c)
    })
}

#[tauri::command]
pub fn complete_onboarding(
    db: State<'_, DbState>,
    input: CompleteOnboardingInput,
) -> AppResult<UserProfile> {
    db.with(|c| {
        c.execute(
            "UPDATE user_profile SET
                name = ?1,
                current_level = ?2,
                target_level = ?3,
                knows_hiragana = ?4,
                knows_katakana = ?5,
                daily_minutes_goal = ?6,
                reminder_time = ?7,
                onboarded_at = datetime('now'),
                updated_at = datetime('now')
             WHERE id = 1",
            params![
                input.name,
                input.current_level,
                input.target_level,
                if input.knows_hiragana { 1 } else { 0 },
                if input.knows_katakana { 1 } else { 0 },
                input.daily_minutes_goal,
                input.reminder_time,
            ],
        )?;
        read_profile(c)
    })
}
