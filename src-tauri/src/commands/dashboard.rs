use chrono::{Datelike, Duration, Utc, Weekday};
use rusqlite::Connection;
use tauri::State;

use crate::commands::missions::{ensure_daily, ensure_weekly, read_daily, read_weekly};
use crate::commands::player::read_player_state;
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{DashboardStats, LifetimeStats};

fn today_iso() -> String {
    Utc::now().format("%Y-%m-%d").to_string()
}

fn count_known_srs(conn: &Connection, item_type: &str) -> AppResult<i64> {
    conn.query_row(
        "SELECT COUNT(*) FROM srs_items WHERE item_type = ?1 AND repetitions >= 3",
        [item_type],
        |r| r.get(0),
    )
    .map_err(|e| AppError::Database(format!("count known {item_type}: {e}")))
}

fn count_due_srs(conn: &Connection, item_type: &str) -> AppResult<i64> {
    conn.query_row(
        "SELECT COUNT(*) FROM srs_items
           WHERE item_type = ?1 AND next_review_at <= datetime('now')",
        [item_type],
        |r| r.get(0),
    )
    .map_err(|e| AppError::Database(format!("count due {item_type}: {e}")))
}

fn minutes_today(conn: &Connection) -> AppResult<i64> {
    let today = today_iso();
    conn.query_row(
        "SELECT COALESCE(minutes_studied, 0) FROM daily_sessions WHERE session_date = ?1",
        [today.as_str()],
        |r| r.get::<_, i64>(0),
    )
    .or_else(|e| match e {
        rusqlite::Error::QueryReturnedNoRows => Ok(0),
        other => Err(AppError::Database(format!("minutes today: {other}"))),
    })
}

pub fn read_lifetime_stats(conn: &Connection) -> AppResult<LifetimeStats> {
    let (total_minutes, active_days, first, last): (i64, i64, Option<String>, Option<String>) = conn
        .query_row(
            "SELECT COALESCE(SUM(minutes_studied), 0),
                    COUNT(*),
                    MIN(session_date),
                    MAX(session_date)
               FROM daily_sessions
              WHERE minutes_studied > 0 OR activities_completed > 0",
            [],
            |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?)),
        )
        .map_err(|e| AppError::Database(format!("lifetime aggregate: {e}")))?;

    let total_reviews: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM activity_log WHERE activity_type LIKE '%_review'",
            [],
            |r| r.get(0),
        )
        .map_err(|e| AppError::Database(format!("total reviews: {e}")))?;

    let total_kanji_mastered = count_known_srs(conn, "kanji")?;
    let total_vocab_mastered = count_known_srs(conn, "vocabulary")?;

    let total_journal_entries: i64 = conn
        .query_row("SELECT COUNT(*) FROM journal_entries", [], |r| r.get(0))
        .map_err(|e| AppError::Database(format!("count journal: {e}")))?;

    Ok(LifetimeStats {
        total_minutes,
        total_hours: (total_minutes as f64) / 60.0,
        active_days,
        total_reviews,
        total_kanji_mastered,
        total_vocab_mastered,
        total_journal_entries,
        first_active_at: first,
        last_active_at: last,
    })
}

#[tauri::command]
pub fn get_lifetime_stats(db: State<'_, DbState>) -> AppResult<LifetimeStats> {
    db.with(|c| read_lifetime_stats(c))
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DayActivity {
    pub date: String,
    pub minutes: i64,
    pub activities: i64,
}

#[tauri::command]
pub fn get_activity_heatmap(
    db: State<'_, DbState>,
    days: Option<i64>,
) -> AppResult<Vec<DayActivity>> {
    let days = days.unwrap_or(120).clamp(7, 365);
    db.with(|c| {
        let mut stmt = c.prepare(
            "SELECT session_date,
                    COALESCE(minutes_studied, 0),
                    COALESCE(activities_completed, 0)
               FROM daily_sessions
              WHERE session_date >= date('now', ?1)
              ORDER BY session_date",
        )?;
        let offset = format!("-{} day", days);
        let rows = stmt.query_map([offset.as_str()], |r| {
            Ok(DayActivity {
                date: r.get(0)?,
                minutes: r.get(1)?,
                activities: r.get(2)?,
            })
        })?;
        let mut out = Vec::new();
        for r in rows {
            out.push(r?);
        }
        Ok(out)
    })
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UnlockedAchievement {
    pub id: i64,
    pub key: String,
    pub title: String,
    pub description: Option<String>,
    pub tier: Option<String>,
    pub icon: Option<String>,
    pub unlocked: bool,
    pub progress: i64,
    pub target: i64,
}

#[tauri::command]
pub fn get_achievements(db: State<'_, DbState>) -> AppResult<Vec<UnlockedAchievement>> {
    db.with(|c| {
        let level: i64 = c.query_row("SELECT level FROM player_state WHERE id = 1", [], |r| r.get(0))?;
        let stars_earned: i64 = c
            .query_row(
                "SELECT COALESCE(SUM(star_amount), 0) FROM xp_events",
                [],
                |r| r.get(0),
            )?;
        let kanji_mastered: i64 = c
            .query_row(
                "SELECT COUNT(*) FROM srs_items WHERE item_type = 'kanji' AND repetitions >= 3",
                [],
                |r| r.get(0),
            )?;
        let vocab_mastered: i64 = c
            .query_row(
                "SELECT COUNT(*) FROM srs_items WHERE item_type = 'vocabulary' AND repetitions >= 3",
                [],
                |r| r.get(0),
            )?;
        let journal_count: i64 = c
            .query_row("SELECT COUNT(*) FROM journal_entries", [], |r| r.get(0))?;
        let minutes_total: i64 = c
            .query_row(
                "SELECT COALESCE(SUM(minutes_studied), 0) FROM daily_sessions",
                [],
                |r| r.get(0),
            )?;
        let missions_completed: i64 = c
            .query_row(
                "SELECT COUNT(*) FROM daily_missions WHERE completed = 1",
                [],
                |r| r.get(0),
            )?;
        let weekly_completed: i64 = c
            .query_row(
                "SELECT COUNT(*) FROM weekly_missions WHERE completed = 1",
                [],
                |r| r.get(0),
            )?;
        let grammar_n5_complete: i64 = c
            .query_row(
                "SELECT CASE WHEN
                    (SELECT COUNT(*) FROM grammar_lessons WHERE jlpt_level = 'N5')
                  = (SELECT COUNT(*) FROM grammar_progress p JOIN grammar_lessons l
                       ON l.id = p.lesson_id WHERE l.jlpt_level = 'N5' AND p.status = 'mastered')
                  AND (SELECT COUNT(*) FROM grammar_lessons WHERE jlpt_level = 'N5') > 0
                 THEN 1 ELSE 0 END",
                [],
                |r| r.get(0),
            )?;

        let mut stmt = c.prepare(
            "SELECT a.id, a.key, a.title, a.description, a.tier, a.icon, a.target, a.metric,
                    CASE WHEN u.unlocked_at IS NOT NULL THEN 1 ELSE 0 END
               FROM achievements a
               LEFT JOIN achievement_unlocks u ON u.achievement_id = a.id
              ORDER BY a.id",
        )?;
        let rows = stmt.query_map([], |r| {
            let metric: String = r.get(7)?;
            let target: i64 = r.get(6)?;
            let progress = match metric.as_str() {
                "level" => level,
                "stars_earned" => stars_earned,
                "kanji_mastered" => kanji_mastered,
                "vocab_mastered" => vocab_mastered,
                "journal_count" => journal_count,
                "minutes" => minutes_total,
                "missions_completed" => missions_completed,
                "weekly_completed" => weekly_completed,
                "grammar_n5_complete" => grammar_n5_complete,
                _ => 0,
            };
            Ok(UnlockedAchievement {
                id: r.get(0)?,
                key: r.get(1)?,
                title: r.get(2)?,
                description: r.get(3)?,
                tier: r.get(4)?,
                icon: r.get(5)?,
                unlocked: r.get::<_, i64>(8)? != 0 || progress >= target,
                progress,
                target,
            })
        })?;
        let mut out = Vec::new();
        for r in rows {
            out.push(r?);
        }

        // Auto-unlock based on progress
        for a in &out {
            if a.unlocked && a.progress >= a.target {
                let _ = c.execute(
                    "INSERT INTO achievement_unlocks (achievement_id, unlocked_at)
                     VALUES (?1, datetime('now'))
                     ON CONFLICT(achievement_id) DO NOTHING",
                    [a.id],
                );
            }
        }

        Ok(out)
    })
}

#[tauri::command]
pub fn get_dashboard_stats(db: State<'_, DbState>) -> AppResult<DashboardStats> {
    db.with(|c| {
        let now = Utc::now();
        ensure_daily(c, now)?;
        ensure_weekly(c, now)?;

        let player = read_player_state(c)?;
        let daily_missions = read_daily(c, now)?;
        let weekly_missions = read_weekly(c, now)?;
        let lifetime = read_lifetime_stats(c)?;
        let kanji_known = count_known_srs(c, "kanji")?;
        let kanji_due_today = count_due_srs(c, "kanji")?;
        let vocab_known = count_known_srs(c, "vocabulary")?;
        let vocab_due_today = count_due_srs(c, "vocabulary")?;
        let minutes_today = minutes_today(c)?;
        let (current_level, minutes_goal): (String, i64) = c
            .query_row(
                "SELECT current_level, daily_minutes_goal FROM user_profile WHERE id = 1",
                [],
                |r| Ok((r.get(0)?, r.get(1)?)),
            )
            .map_err(|e| AppError::Database(format!("read profile for stats: {e}")))?;

        Ok(DashboardStats {
            player,
            daily_missions,
            weekly_missions,
            lifetime,
            kanji_known,
            kanji_due_today,
            vocab_known,
            vocab_due_today,
            minutes_today,
            minutes_goal,
            current_level,
        })
    })
}

// ---------------------------------------------------------------------------
// Adaptive learning insights — personalizes by tracking accuracy per skill.
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillInsight {
    pub key: String,
    pub label: String,
    pub jp: String,
    pub module_path: String,
    pub attempts: i64,
    pub accuracy_pct: i64,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LearningInsights {
    pub skills: Vec<SkillInsight>,
    pub total_attempts: i64,
    pub focus_key: Option<String>,
    pub focus_label: Option<String>,
    pub focus_path: Option<String>,
    pub headline: String,
    pub jp_headline: String,
}

/// Compute per-skill accuracy from the activity log so the dashboard can adapt
/// to how *this* user is doing and point them at their weakest area. This is
/// the foundation of the adaptive engine: it reflects real performance, not a
/// fixed path.
#[tauri::command]
pub fn get_skill_insights(db: State<'_, DbState>) -> AppResult<LearningInsights> {
    // skill key, label, jp, module path, and the activity_log types it maps to.
    let defs: &[(&str, &str, &str, &str, &[&str])] = &[
        ("kanji", "Kanji", "漢字", "/kanji/review", &["kanji_review"]),
        ("grammar", "Gramática", "文法", "/grammar", &["grammar_quiz"]),
        ("listening", "Listening", "聴解", "/listening", &["listening"]),
        ("reading", "Lectura", "読解", "/reading", &["reading_quiz"]),
        ("speaking", "Speaking", "会話", "/speaking", &["speaking"]),
        ("lessons", "Lecciones", "授業", "/learn", &["lesson", "unit_exam"]),
    ];

    db.with(|c| {
        let mut skills = Vec::new();
        let mut total_attempts = 0i64;
        for (key, label, jp, path, types) in defs {
            let placeholders = types
                .iter()
                .map(|_| "?")
                .collect::<Vec<_>>()
                .join(", ");
            let sql = format!(
                "SELECT COUNT(*), COALESCE(SUM(correct), 0)
                   FROM activity_log
                  WHERE activity_type IN ({placeholders})"
            );
            let params: Vec<&dyn rusqlite::ToSql> =
                types.iter().map(|t| t as &dyn rusqlite::ToSql).collect();
            let (attempts, correct): (i64, i64) = c
                .query_row(&sql, params.as_slice(), |r| Ok((r.get(0)?, r.get(1)?)))
                .unwrap_or((0, 0));
            total_attempts += attempts;
            let accuracy_pct = if attempts > 0 {
                ((correct as f64 / attempts as f64) * 100.0).round() as i64
            } else {
                0
            };
            skills.push(SkillInsight {
                key: key.to_string(),
                label: label.to_string(),
                jp: jp.to_string(),
                module_path: path.to_string(),
                attempts,
                accuracy_pct,
            });
        }

        // Pick the focus: weakest skill with enough data (>=3 attempts).
        let focus = skills
            .iter()
            .filter(|s| s.attempts >= 3)
            .min_by_key(|s| s.accuracy_pct);

        let (focus_key, focus_label, focus_path, headline, jp_headline) = if total_attempts == 0 {
            (
                None,
                None,
                None,
                "Empieza una lección y aprenderé tu estilo para personalizar tu plan.".to_string(),
                "あなたに合わせて".to_string(),
            )
        } else if let Some(f) = focus {
            (
                Some(f.key.clone()),
                Some(f.label.clone()),
                Some(f.module_path.clone()),
                format!(
                    "Tu punto a reforzar hoy es {} ({}% de aciertos). Le dedicamos un momento y subimos esa cifra.",
                    f.label, f.accuracy_pct
                ),
                "今日の重点".to_string(),
            )
        } else {
            (
                None,
                None,
                None,
                "Sigue practicando un poco más y personalizaré tu plan según tus aciertos.".to_string(),
                "もう少し".to_string(),
            )
        };

        Ok(LearningInsights {
            skills,
            total_attempts,
            focus_key,
            focus_label,
            focus_path,
            headline,
            jp_headline,
        })
    })
}

// Helper used by other modules to recompute minutes for missions.
pub fn minutes_today_and_week(conn: &Connection) -> AppResult<(i64, i64)> {
    let now = Utc::now();
    let today = now.format("%Y-%m-%d").to_string();
    let weekday = now.weekday();
    let days_from_mon: i64 = match weekday {
        Weekday::Mon => 0,
        Weekday::Tue => 1,
        Weekday::Wed => 2,
        Weekday::Thu => 3,
        Weekday::Fri => 4,
        Weekday::Sat => 5,
        Weekday::Sun => 6,
    };
    let week_start = (now - Duration::days(days_from_mon))
        .format("%Y-%m-%d")
        .to_string();

    let today_minutes: i64 = conn
        .query_row(
            "SELECT COALESCE(minutes_studied, 0) FROM daily_sessions WHERE session_date = ?1",
            [today.as_str()],
            |r| r.get(0),
        )
        .or_else(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => Ok(0),
            other => Err(AppError::Database(format!("today minutes: {other}"))),
        })?;

    let week_minutes: i64 = conn
        .query_row(
            "SELECT COALESCE(SUM(minutes_studied), 0) FROM daily_sessions
              WHERE session_date >= ?1",
            [week_start.as_str()],
            |r| r.get(0),
        )
        .map_err(|e| AppError::Database(format!("week minutes: {e}")))?;

    Ok((today_minutes, week_minutes))
}
