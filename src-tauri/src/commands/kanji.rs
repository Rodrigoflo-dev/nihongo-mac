use chrono::{DateTime, Utc};
use rusqlite::{params, Connection};
use tauri::State;

use crate::commands::dashboard::minutes_today_and_week;
use crate::commands::missions::{apply_event, MissionEvent};
use crate::commands::player::award_xp_internal;
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{
    Kanji, KanjiExample, KanjiListItem, KanjiSrs, ReviewQueue, ReviewResult, XpAward,
};
use crate::srs::{self, ReviewGrade, SrsState};

// Introducing a kanji just adds it to your study pool — it is NOT practice, so
// it grants no XP (otherwise XP could be farmed by spamming "Introducir").
// XP is earned by actually reviewing (recall + grade + stroke practice).
const XP_INTRODUCE_KANJI: i64 = 0;

fn xp_for_review(grade: ReviewGrade) -> i64 {
    match grade {
        ReviewGrade::Again => 5,
        ReviewGrade::Hard => 8,
        ReviewGrade::Good => 12,
        ReviewGrade::Easy => 18,
    }
}

fn parse_string_array(raw: Option<String>) -> Vec<String> {
    raw.and_then(|s| serde_json::from_str::<Vec<String>>(&s).ok())
        .unwrap_or_default()
}

fn parse_examples(raw: Option<String>) -> Vec<KanjiExample> {
    raw.and_then(|s| serde_json::from_str::<Vec<KanjiExample>>(&s).ok())
        .unwrap_or_default()
}

fn status_for(repetitions: i64, is_leech: bool) -> &'static str {
    if is_leech {
        "leech"
    } else if repetitions == 0 {
        "new"
    } else if repetitions < 3 {
        "learning"
    } else {
        "mastered"
    }
}

fn read_kanji(conn: &Connection, id: i64) -> AppResult<Kanji> {
    conn.query_row(
        "SELECT id, character, meaning_es, meaning_en, onyomi, kunyomi,
                jlpt_level, grade, stroke_count, examples, mnemonic
           FROM kanji WHERE id = ?1",
        [id],
        |r| {
            Ok(Kanji {
                id: r.get(0)?,
                character: r.get(1)?,
                meaning_es: r.get(2)?,
                meaning_en: r.get(3)?,
                onyomi: parse_string_array(r.get(4)?),
                kunyomi: parse_string_array(r.get(5)?),
                jlpt_level: r.get(6)?,
                grade: r.get(7)?,
                stroke_count: r.get(8)?,
                examples: parse_examples(r.get(9)?),
                mnemonic: r.get(10)?,
            })
        },
    )
    .map_err(|e| AppError::Database(format!("read kanji {id}: {e}")))
}

#[tauri::command]
pub fn list_kanji(db: State<'_, DbState>, level: String) -> AppResult<Vec<KanjiListItem>> {
    db.with(|c| {
        let mut stmt = c.prepare(
            "SELECT k.id, k.character, k.meaning_es, k.meaning_en, k.onyomi, k.kunyomi,
                    k.jlpt_level, k.grade, k.stroke_count, k.examples, k.mnemonic,
                    s.repetitions, s.next_review_at, s.is_leech
               FROM kanji k
               LEFT JOIN srs_items s
                 ON s.item_type = 'kanji' AND s.item_id = k.id
              WHERE k.jlpt_level = ?1
              ORDER BY k.frequency IS NULL, k.frequency, k.id",
        )?;
        let rows = stmt.query_map([level.as_str()], |r| {
            let repetitions: Option<i64> = r.get(11)?;
            let next_review_at: Option<String> = r.get(12)?;
            let is_leech: Option<i64> = r.get(13)?;
            let repetitions = repetitions.unwrap_or(0);
            let leech = is_leech.unwrap_or(0) != 0;
            Ok(KanjiListItem {
                kanji: Kanji {
                    id: r.get(0)?,
                    character: r.get(1)?,
                    meaning_es: r.get(2)?,
                    meaning_en: r.get(3)?,
                    onyomi: parse_string_array(r.get(4)?),
                    kunyomi: parse_string_array(r.get(5)?),
                    jlpt_level: r.get(6)?,
                    grade: r.get(7)?,
                    stroke_count: r.get(8)?,
                    examples: parse_examples(r.get(9)?),
                    mnemonic: r.get(10)?,
                },
                status: status_for(repetitions, leech).to_string(),
                repetitions,
                next_review_at,
            })
        })?;

        let mut out = Vec::new();
        for row in rows {
            out.push(row?);
        }
        Ok(out)
    })
}

#[tauri::command]
pub fn get_review_queue(db: State<'_, DbState>, level: String) -> AppResult<ReviewQueue> {
    db.with(|c| {
        let mut due = Vec::new();
        {
            let mut stmt = c.prepare(
                "SELECT k.id, s.repetitions, s.interval_days, s.ease_factor,
                        s.next_review_at, s.last_reviewed_at, s.consecutive_failures,
                        s.is_leech, s.total_reviews, s.total_correct
                   FROM srs_items s
                   JOIN kanji k ON k.id = s.item_id
                  WHERE s.item_type = 'kanji'
                    AND k.jlpt_level = ?1
                    AND s.next_review_at <= datetime('now')
                  ORDER BY s.next_review_at ASC
                  LIMIT 50",
            )?;
            let rows = stmt.query_map([level.as_str()], |r| {
                let id: i64 = r.get(0)?;
                Ok((
                    id,
                    KanjiSrsRow {
                        repetitions: r.get(1)?,
                        interval_days: r.get(2)?,
                        ease_factor: r.get(3)?,
                        next_review_at: r.get(4)?,
                        last_reviewed_at: r.get(5)?,
                        consecutive_failures: r.get(6)?,
                        is_leech: r.get::<_, i64>(7)? != 0,
                        total_reviews: r.get(8)?,
                        total_correct: r.get(9)?,
                    },
                ))
            })?;
            for row in rows {
                let (id, srs_row) = row?;
                let kanji = read_kanji(c, id)?;
                let status = status_for(srs_row.repetitions, srs_row.is_leech).to_string();
                due.push(KanjiSrs {
                    kanji,
                    repetitions: srs_row.repetitions,
                    interval_days: srs_row.interval_days,
                    ease_factor: srs_row.ease_factor,
                    next_review_at: srs_row.next_review_at,
                    last_reviewed_at: srs_row.last_reviewed_at,
                    consecutive_failures: srs_row.consecutive_failures,
                    is_leech: srs_row.is_leech,
                    total_reviews: srs_row.total_reviews,
                    total_correct: srs_row.total_correct,
                    status,
                });
            }
        }

        let new_available: i64 = c.query_row(
            "SELECT COUNT(*) FROM kanji k
               WHERE k.jlpt_level = ?1
                 AND NOT EXISTS (
                   SELECT 1 FROM srs_items s
                    WHERE s.item_type = 'kanji' AND s.item_id = k.id
                 )",
            [level.as_str()],
            |r| r.get(0),
        )?;

        Ok(ReviewQueue {
            due,
            new_available,
        })
    })
}

#[tauri::command]
pub fn introduce_kanji(db: State<'_, DbState>, kanji_id: i64) -> AppResult<ReviewResult> {
    db.with(|c| {
        let now = Utc::now();
        let initial = SrsState::new_card(now);
        c.execute(
            "INSERT INTO srs_items (
                item_type, item_id, ease_factor, interval_days, repetitions,
                next_review_at, consecutive_failures, total_reviews, total_correct, is_leech
            ) VALUES ('kanji', ?1, ?2, ?3, 0, ?4, 0, 0, 0, 0)
             ON CONFLICT(item_type, item_id) DO NOTHING",
            params![
                kanji_id,
                initial.ease_factor,
                initial.interval_days,
                now.to_rfc3339(),
            ],
        )?;

        let (xp, change) = award_xp_internal(
            c,
            XP_INTRODUCE_KANJI,
            "kanji_introduced",
            Some(&kanji_id.to_string()),
            now,
        )?;

        let outcome = apply_event(c, MissionEvent::KanjiIntroduced, now)?;

        let srs = load_kanji_srs(c, kanji_id)?;
        let award = XpAward {
            xp_amount: xp + outcome.xp_awarded,
            star_amount: outcome.stars_awarded,
            leveled_up: change.leveled_up || outcome.level_change.as_ref().map(|c| c.leveled_up).unwrap_or(false),
            new_level: outcome
                .level_change
                .as_ref()
                .map(|c| c.new_level)
                .unwrap_or(change.new_level),
            previous_level: change.previous_level,
            completed_daily: outcome.completed_daily,
            completed_weekly: outcome.completed_weekly,
        };
        Ok(ReviewResult { srs, award })
    })
}

#[tauri::command]
pub fn review_kanji(
    db: State<'_, DbState>,
    kanji_id: i64,
    grade: ReviewGrade,
    duration_seconds: Option<i64>,
) -> AppResult<ReviewResult> {
    db.with(|c| {
        let now = Utc::now();
        let current = load_srs_state(c, kanji_id)?;
        let next = srs::next(&current, grade, now);
        let correct = !matches!(grade, ReviewGrade::Again);

        c.execute(
            "UPDATE srs_items
                SET ease_factor = ?1,
                    interval_days = ?2,
                    repetitions = ?3,
                    next_review_at = ?4,
                    last_reviewed_at = ?5,
                    consecutive_failures = ?6,
                    is_leech = ?7,
                    total_reviews = total_reviews + 1,
                    total_correct = total_correct + ?8
              WHERE item_type = 'kanji' AND item_id = ?9",
            params![
                next.ease_factor,
                next.interval_days,
                next.repetitions,
                next.next_review_at.to_rfc3339(),
                now.to_rfc3339(),
                next.consecutive_failures,
                if next.is_leech { 1 } else { 0 },
                if correct { 1 } else { 0 },
                kanji_id,
            ],
        )?;

        c.execute(
            "INSERT INTO activity_log (
                activity_type, item_id, item_ref, correct, duration_seconds, metadata
            ) VALUES ('kanji_review', ?1, NULL, ?2, ?3, NULL)",
            params![kanji_id, if correct { 1 } else { 0 }, duration_seconds.unwrap_or(0)],
        )?;

        crate::commands::bump_daily_session(c, now, "kanji", duration_seconds.unwrap_or(0))?;

        let (xp_review, change_review) =
            award_xp_internal(c, xp_for_review(grade), "kanji_review", None, now)?;

        let outcome_review = apply_event(c, MissionEvent::KanjiReviewed, now)?;
        let (today_min, week_min) = minutes_today_and_week(c)?;
        let outcome_minutes = apply_event(
            c,
            MissionEvent::MinutesUpdated {
                total_today: today_min,
                total_week: week_min,
            },
            now,
        )?;

        let combined_xp = xp_review + outcome_review.xp_awarded + outcome_minutes.xp_awarded;
        let combined_stars = outcome_review.stars_awarded + outcome_minutes.stars_awarded;

        let level_change = outcome_minutes
            .level_change
            .or(outcome_review.level_change)
            .unwrap_or(crate::commands::player::LevelChange {
                leveled_up: change_review.leveled_up,
                new_level: change_review.new_level,
                previous_level: change_review.previous_level,
            });

        let mut completed_daily = outcome_review.completed_daily;
        completed_daily.extend(outcome_minutes.completed_daily);
        let mut completed_weekly = outcome_review.completed_weekly;
        completed_weekly.extend(outcome_minutes.completed_weekly);

        let srs = load_kanji_srs(c, kanji_id)?;
        let award = XpAward {
            xp_amount: combined_xp,
            star_amount: combined_stars,
            leveled_up: level_change.leveled_up,
            new_level: level_change.new_level,
            previous_level: level_change.previous_level,
            completed_daily,
            completed_weekly,
        };
        Ok(ReviewResult { srs, award })
    })
}

// ---------------------------------------------------------------------------
// Helpers (private)
// ---------------------------------------------------------------------------

struct KanjiSrsRow {
    repetitions: i64,
    interval_days: f64,
    ease_factor: f64,
    next_review_at: String,
    last_reviewed_at: Option<String>,
    consecutive_failures: i64,
    is_leech: bool,
    total_reviews: i64,
    total_correct: i64,
}

fn load_srs_state(conn: &Connection, kanji_id: i64) -> AppResult<SrsState> {
    conn.query_row(
        "SELECT ease_factor, interval_days, repetitions, consecutive_failures,
                next_review_at, is_leech
           FROM srs_items WHERE item_type = 'kanji' AND item_id = ?1",
        [kanji_id],
        |r| {
            let next_review_at: String = r.get(4)?;
            let next_review_at = DateTime::parse_from_rfc3339(&next_review_at)
                .map(|d| d.with_timezone(&Utc))
                .unwrap_or_else(|_| Utc::now());
            Ok(SrsState {
                ease_factor: r.get(0)?,
                interval_days: r.get(1)?,
                repetitions: r.get(2)?,
                consecutive_failures: r.get(3)?,
                next_review_at,
                is_leech: r.get::<_, i64>(5)? != 0,
            })
        },
    )
    .map_err(|e| AppError::Database(format!("load srs {kanji_id}: {e}")))
}

fn load_kanji_srs(conn: &Connection, kanji_id: i64) -> AppResult<KanjiSrs> {
    let kanji = read_kanji(conn, kanji_id)?;
    let row: KanjiSrsRow = conn
        .query_row(
            "SELECT repetitions, interval_days, ease_factor, next_review_at,
                    last_reviewed_at, consecutive_failures, is_leech,
                    total_reviews, total_correct
               FROM srs_items WHERE item_type = 'kanji' AND item_id = ?1",
            [kanji_id],
            |r| {
                Ok(KanjiSrsRow {
                    repetitions: r.get(0)?,
                    interval_days: r.get(1)?,
                    ease_factor: r.get(2)?,
                    next_review_at: r.get(3)?,
                    last_reviewed_at: r.get(4)?,
                    consecutive_failures: r.get(5)?,
                    is_leech: r.get::<_, i64>(6)? != 0,
                    total_reviews: r.get(7)?,
                    total_correct: r.get(8)?,
                })
            },
        )
        .map_err(|e| AppError::Database(format!("load kanji srs {kanji_id}: {e}")))?;

    let status = status_for(row.repetitions, row.is_leech).to_string();
    Ok(KanjiSrs {
        kanji,
        repetitions: row.repetitions,
        interval_days: row.interval_days,
        ease_factor: row.ease_factor,
        next_review_at: row.next_review_at,
        last_reviewed_at: row.last_reviewed_at,
        consecutive_failures: row.consecutive_failures,
        is_leech: row.is_leech,
        total_reviews: row.total_reviews,
        total_correct: row.total_correct,
        status,
    })
}

