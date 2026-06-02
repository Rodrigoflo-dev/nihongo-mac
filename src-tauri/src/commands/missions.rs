//! Daily + weekly mission generation and progression.
//!
//! Missions are generated lazily: the first read for a given date/week
//! materializes the row set from templates if it does not already exist.

use chrono::{DateTime, Datelike, Duration, Utc, Weekday};
use rusqlite::{params, Connection};
use tauri::State;

use crate::commands::player::{award_stars_internal, award_xp_internal, LevelChange};
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{DailyMission, WeeklyMission};

// ---------------------------------------------------------------------------
// Mission kinds — keep these in sync with mission-progress events.
// ---------------------------------------------------------------------------
pub const DAILY_KANJI_REVIEWS: &str = "daily_kanji_reviews";
pub const DAILY_STUDY_MINUTES: &str = "daily_study_minutes";
pub const DAILY_NEW_KANJI: &str = "daily_new_kanji";

pub const WEEKLY_KANJI_REVIEWS: &str = "weekly_kanji_reviews";
pub const WEEKLY_STUDY_MINUTES: &str = "weekly_study_minutes";

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

struct DailyTemplate {
    kind: &'static str,
    title: &'static str,
    description: fn(i64) -> String,
    target: fn(i64) -> i64, // takes daily_minutes_goal
    xp_reward: i64,
    star_reward: i64,
}

struct WeeklyTemplate {
    kind: &'static str,
    title: &'static str,
    description: fn(i64) -> String,
    target: fn(i64) -> i64, // takes daily_minutes_goal (scaled to week)
    xp_reward: i64,
    star_reward: i64,
}

const DAILY_TEMPLATES: &[DailyTemplate] = &[
    DailyTemplate {
        kind: DAILY_KANJI_REVIEWS,
        title: "Repaso del día",
        description: daily_reviews_desc,
        target: daily_reviews_target,
        xp_reward: 80,
        star_reward: 3,
    },
    DailyTemplate {
        kind: DAILY_STUDY_MINUTES,
        title: "Dedica tiempo",
        description: daily_minutes_desc,
        target: daily_minutes_target,
        xp_reward: 60,
        star_reward: 2,
    },
    DailyTemplate {
        kind: DAILY_NEW_KANJI,
        title: "Aprende algo nuevo",
        description: daily_new_desc,
        target: daily_new_target,
        xp_reward: 50,
        star_reward: 2,
    },
];

const WEEKLY_TEMPLATES: &[WeeklyTemplate] = &[
    WeeklyTemplate {
        kind: WEEKLY_KANJI_REVIEWS,
        title: "Maratón de repasos",
        description: weekly_reviews_desc,
        target: weekly_reviews_target,
        xp_reward: 400,
        star_reward: 15,
    },
    WeeklyTemplate {
        kind: WEEKLY_STUDY_MINUTES,
        title: "Constancia semanal",
        description: weekly_minutes_desc,
        target: weekly_minutes_target,
        xp_reward: 350,
        star_reward: 12,
    },
];

fn daily_reviews_target(_goal: i64) -> i64 {
    5
}
fn daily_reviews_desc(target: i64) -> String {
    format!("Repasa {target} kanjis hoy")
}

fn daily_minutes_target(goal: i64) -> i64 {
    goal.max(5)
}
fn daily_minutes_desc(target: i64) -> String {
    format!("Estudia {target} minutos")
}

fn daily_new_target(_goal: i64) -> i64 {
    1
}
fn daily_new_desc(target: i64) -> String {
    format!("Introduce {target} kanji nuevo")
}

fn weekly_reviews_target(_goal: i64) -> i64 {
    40
}
fn weekly_reviews_desc(target: i64) -> String {
    format!("Repasa {target} kanjis esta semana")
}

fn weekly_minutes_target(goal: i64) -> i64 {
    (goal * 5).max(60)
}
fn weekly_minutes_desc(target: i64) -> String {
    format!("Estudia {target} minutos esta semana")
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

fn today_iso(now: DateTime<Utc>) -> String {
    now.format("%Y-%m-%d").to_string()
}

fn week_start_iso(now: DateTime<Utc>) -> String {
    let weekday = now.weekday();
    let days_from_mon = match weekday {
        Weekday::Mon => 0,
        Weekday::Tue => 1,
        Weekday::Wed => 2,
        Weekday::Thu => 3,
        Weekday::Fri => 4,
        Weekday::Sat => 5,
        Weekday::Sun => 6,
    };
    let monday = now - Duration::days(days_from_mon);
    monday.format("%Y-%m-%d").to_string()
}

fn daily_minutes_goal(conn: &Connection) -> AppResult<i64> {
    conn.query_row(
        "SELECT daily_minutes_goal FROM user_profile WHERE id = 1",
        [],
        |r| r.get(0),
    )
    .map_err(|e| AppError::Database(format!("read daily goal: {e}")))
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

pub fn ensure_daily(conn: &Connection, now: DateTime<Utc>) -> AppResult<()> {
    let today = today_iso(now);
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM daily_missions WHERE mission_date = ?1",
        [today.as_str()],
        |r| r.get(0),
    )?;
    if count > 0 {
        return Ok(());
    }

    let goal = daily_minutes_goal(conn)?;
    for t in DAILY_TEMPLATES {
        let target = (t.target)(goal);
        let description = (t.description)(target);
        conn.execute(
            "INSERT OR IGNORE INTO daily_missions
                (mission_date, kind, title, description, target_value,
                 xp_reward, star_reward)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![today, t.kind, t.title, description, target, t.xp_reward, t.star_reward],
        )?;
    }
    Ok(())
}

pub fn ensure_weekly(conn: &Connection, now: DateTime<Utc>) -> AppResult<()> {
    let week = week_start_iso(now);
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM weekly_missions WHERE week_start = ?1",
        [week.as_str()],
        |r| r.get(0),
    )?;
    if count > 0 {
        return Ok(());
    }

    let goal = daily_minutes_goal(conn)?;
    for t in WEEKLY_TEMPLATES {
        let target = (t.target)(goal);
        let description = (t.description)(target);
        conn.execute(
            "INSERT OR IGNORE INTO weekly_missions
                (week_start, kind, title, description, target_value,
                 xp_reward, star_reward)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![week, t.kind, t.title, description, target, t.xp_reward, t.star_reward],
        )?;
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

pub fn read_daily(conn: &Connection, now: DateTime<Utc>) -> AppResult<Vec<DailyMission>> {
    let today = today_iso(now);
    let mut stmt = conn.prepare(
        "SELECT id, kind, title, description, target_value, progress,
                xp_reward, star_reward, completed, completed_at
           FROM daily_missions WHERE mission_date = ?1 ORDER BY id",
    )?;
    let rows = stmt.query_map([today.as_str()], |r| {
        Ok(DailyMission {
            id: r.get(0)?,
            kind: r.get(1)?,
            title: r.get(2)?,
            description: r.get(3)?,
            target_value: r.get(4)?,
            progress: r.get(5)?,
            xp_reward: r.get(6)?,
            star_reward: r.get(7)?,
            completed: r.get::<_, i64>(8)? != 0,
            completed_at: r.get(9)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

pub fn read_weekly(conn: &Connection, now: DateTime<Utc>) -> AppResult<Vec<WeeklyMission>> {
    let week = week_start_iso(now);
    let mut stmt = conn.prepare(
        "SELECT id, kind, title, description, target_value, progress,
                xp_reward, star_reward, completed, completed_at, week_start
           FROM weekly_missions WHERE week_start = ?1 ORDER BY id",
    )?;
    let rows = stmt.query_map([week.as_str()], |r| {
        Ok(WeeklyMission {
            id: r.get(0)?,
            kind: r.get(1)?,
            title: r.get(2)?,
            description: r.get(3)?,
            target_value: r.get(4)?,
            progress: r.get(5)?,
            xp_reward: r.get(6)?,
            star_reward: r.get(7)?,
            completed: r.get::<_, i64>(8)? != 0,
            completed_at: r.get(9)?,
            week_start: r.get(10)?,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

// ---------------------------------------------------------------------------
// Progression — called from activity commands (e.g. kanji review)
// ---------------------------------------------------------------------------

/// What just happened — used to advance missions that care.
pub enum MissionEvent {
    KanjiReviewed,
    KanjiIntroduced,
    /// Cumulative study minutes for today and the current week.
    MinutesUpdated {
        total_today: i64,
        total_week: i64,
    },
}

pub struct MissionProgressOutcome {
    pub completed_daily: Vec<DailyMission>,
    pub completed_weekly: Vec<WeeklyMission>,
    pub xp_awarded: i64,
    pub stars_awarded: i64,
    pub level_change: Option<LevelChange>,
}

pub fn apply_event(
    conn: &Connection,
    event: MissionEvent,
    now: DateTime<Utc>,
) -> AppResult<MissionProgressOutcome> {
    ensure_daily(conn, now)?;
    ensure_weekly(conn, now)?;

    match event {
        MissionEvent::KanjiReviewed => {
            increment(conn, "daily", DAILY_KANJI_REVIEWS, 1, now)?;
            increment(conn, "weekly", WEEKLY_KANJI_REVIEWS, 1, now)?;
        }
        MissionEvent::KanjiIntroduced => {
            increment(conn, "daily", DAILY_NEW_KANJI, 1, now)?;
        }
        MissionEvent::MinutesUpdated {
            total_today,
            total_week,
        } => {
            set_progress(conn, "daily", DAILY_STUDY_MINUTES, total_today, now)?;
            set_progress(conn, "weekly", WEEKLY_STUDY_MINUTES, total_week, now)?;
        }
    };

    finalize(conn, now)
}

fn increment(
    conn: &Connection,
    scope: &str,
    kind: &str,
    by: i64,
    now: DateTime<Utc>,
) -> AppResult<()> {
    let (table, date_col, date_val) = match scope {
        "daily" => ("daily_missions", "mission_date", today_iso(now)),
        "weekly" => ("weekly_missions", "week_start", week_start_iso(now)),
        _ => return Err(AppError::Other(format!("unknown scope {scope}"))),
    };

    let sql = format!(
        "UPDATE {table}
            SET progress = MIN(target_value, progress + ?1)
          WHERE {date_col} = ?2 AND kind = ?3 AND completed = 0"
    );
    conn.execute(&sql, params![by, date_val, kind])?;
    Ok(())
}

fn set_progress(
    conn: &Connection,
    scope: &str,
    kind: &str,
    value: i64,
    now: DateTime<Utc>,
) -> AppResult<()> {
    let (table, date_col, date_val) = match scope {
        "daily" => ("daily_missions", "mission_date", today_iso(now)),
        "weekly" => ("weekly_missions", "week_start", week_start_iso(now)),
        _ => return Err(AppError::Other(format!("unknown scope {scope}"))),
    };

    let sql = format!(
        "UPDATE {table}
            SET progress = MIN(target_value, MAX(progress, ?1))
          WHERE {date_col} = ?2 AND kind = ?3 AND completed = 0"
    );
    conn.execute(&sql, params![value, date_val, kind])?;
    Ok(())
}

/// Find missions that just hit their target, mark them complete, and award
/// their XP + star rewards. Returns the missions for animation purposes.
fn finalize(conn: &Connection, now: DateTime<Utc>) -> AppResult<MissionProgressOutcome> {
    let mut completed_daily = Vec::new();
    let mut completed_weekly = Vec::new();
    let mut xp_awarded = 0i64;
    let mut stars_awarded = 0i64;
    let mut level_change: Option<LevelChange> = None;

    let today = today_iso(now);
    let week = week_start_iso(now);

    // Daily completions
    {
        let mut stmt = conn.prepare(
            "SELECT id, kind, title, description, target_value, progress,
                    xp_reward, star_reward
               FROM daily_missions
              WHERE mission_date = ?1
                AND completed = 0
                AND progress >= target_value",
        )?;
        let rows = stmt.query_map([today.as_str()], |r| {
            Ok((
                r.get::<_, i64>(0)?,
                DailyMission {
                    id: r.get(0)?,
                    kind: r.get(1)?,
                    title: r.get(2)?,
                    description: r.get(3)?,
                    target_value: r.get(4)?,
                    progress: r.get(5)?,
                    xp_reward: r.get(6)?,
                    star_reward: r.get(7)?,
                    completed: true,
                    completed_at: Some(now.to_rfc3339()),
                },
            ))
        })?;
        for row in rows {
            let (_, m) = row?;
            completed_daily.push(m);
        }
    }
    for m in &completed_daily {
        conn.execute(
            "UPDATE daily_missions SET completed = 1, completed_at = ?1 WHERE id = ?2",
            params![now.to_rfc3339(), m.id],
        )?;
        let (effective_xp, change) = award_xp_internal(
            conn,
            m.xp_reward,
            "mission_daily",
            Some(&m.kind),
            now,
        )?;
        xp_awarded += effective_xp;
        stars_awarded +=
            award_stars_internal(conn, m.star_reward, "mission_daily", Some(&m.kind))?;
        if change.leveled_up {
            level_change = Some(change);
        }
    }

    // Weekly completions
    {
        let mut stmt = conn.prepare(
            "SELECT id, kind, title, description, target_value, progress,
                    xp_reward, star_reward, week_start
               FROM weekly_missions
              WHERE week_start = ?1
                AND completed = 0
                AND progress >= target_value",
        )?;
        let rows = stmt.query_map([week.as_str()], |r| {
            Ok((
                r.get::<_, i64>(0)?,
                WeeklyMission {
                    id: r.get(0)?,
                    kind: r.get(1)?,
                    title: r.get(2)?,
                    description: r.get(3)?,
                    target_value: r.get(4)?,
                    progress: r.get(5)?,
                    xp_reward: r.get(6)?,
                    star_reward: r.get(7)?,
                    completed: true,
                    completed_at: Some(now.to_rfc3339()),
                    week_start: r.get(8)?,
                },
            ))
        })?;
        for row in rows {
            let (_, m) = row?;
            completed_weekly.push(m);
        }
    }
    for m in &completed_weekly {
        conn.execute(
            "UPDATE weekly_missions SET completed = 1, completed_at = ?1 WHERE id = ?2",
            params![now.to_rfc3339(), m.id],
        )?;
        let (effective_xp, change) = award_xp_internal(
            conn,
            m.xp_reward,
            "mission_weekly",
            Some(&m.kind),
            now,
        )?;
        xp_awarded += effective_xp;
        stars_awarded +=
            award_stars_internal(conn, m.star_reward, "mission_weekly", Some(&m.kind))?;
        if change.leveled_up {
            level_change = Some(change);
        }
    }

    Ok(MissionProgressOutcome {
        completed_daily,
        completed_weekly,
        xp_awarded,
        stars_awarded,
        level_change,
    })
}

// ---------------------------------------------------------------------------
// Public commands
// ---------------------------------------------------------------------------

#[tauri::command]
pub fn get_daily_missions(db: State<'_, DbState>) -> AppResult<Vec<DailyMission>> {
    db.with(|c| {
        let now = Utc::now();
        ensure_daily(c, now)?;
        read_daily(c, now)
    })
}

#[tauri::command]
pub fn get_weekly_missions(db: State<'_, DbState>) -> AppResult<Vec<WeeklyMission>> {
    db.with(|c| {
        let now = Utc::now();
        ensure_weekly(c, now)?;
        read_weekly(c, now)
    })
}
