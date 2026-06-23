//! Guided lesson commands: list curriculum, get a single lesson, complete it.

use chrono::Utc;
use rusqlite::{params, Connection};
use tauri::State;

use crate::commands::missions::{apply_event, MissionEvent};
use crate::commands::player::award_xp_internal;
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{
    Activity, Course, Lesson, LessonActivities, LessonCompletionResponse, LessonResult,
    LessonSummary, NextLessonInfo, Unit, XpAward,
};

const XP_LESSON_COMPLETE_BASE: i64 = 120;
const XP_LESSON_PER_CORRECT: i64 = 8;
const XP_LESSON_PERFECT_BONUS: i64 = 40;
const STAR_LESSON_PASS: i64 = 4;
const STAR_LESSON_PERFECT_BONUS: i64 = 2;

fn parse_activities(raw: &str) -> Vec<Activity> {
    serde_json::from_str::<LessonActivities>(raw)
        .map(|a| a.activities)
        .unwrap_or_default()
}

#[tauri::command]
pub fn list_courses(db: State<'_, DbState>) -> AppResult<Vec<Course>> {
    db.with(|c| {
        let mut courses_stmt = c.prepare(
            "SELECT id, title, description, jlpt_level, jp_title
               FROM courses ORDER BY ordering, id",
        )?;
        let course_rows: Vec<(i64, String, Option<String>, String, Option<String>)> =
            courses_stmt
                .query_map([], |r| {
                    Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?))
                })?
                .filter_map(|r| r.ok())
                .collect();

        let mut courses = Vec::new();
        for (cid, title, description, jlpt_level, jp_title) in course_rows {
            let units = list_units_for_course(c, cid)?;
            courses.push(Course {
                id: cid,
                title,
                description,
                jlpt_level,
                jp_title,
                units,
            });
        }
        Ok(courses)
    })
}

fn list_units_for_course(c: &Connection, course_id: i64) -> AppResult<Vec<Unit>> {
    let mut stmt = c.prepare(
        "SELECT id, title, description, jp_title, ordering
           FROM units WHERE course_id = ?1 ORDER BY ordering, id",
    )?;
    let unit_rows: Vec<(i64, String, Option<String>, Option<String>, i64)> = stmt
        .query_map([course_id], |r| {
            Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?, r.get(4)?))
        })?
        .filter_map(|r| r.ok())
        .collect();

    let mut units = Vec::new();
    for (uid, title, description, jp_title, ordering) in unit_rows {
        let lessons = list_lessons_for_unit(c, uid)?;
        units.push(Unit {
            id: uid,
            title,
            description,
            jp_title,
            ordering,
            lessons,
        });
    }
    Ok(units)
}

fn list_lessons_for_unit(c: &Connection, unit_id: i64) -> AppResult<Vec<LessonSummary>> {
    let mut stmt = c.prepare(
        "SELECT l.id, l.unit_id, l.title, l.jp_title, l.summary, l.duration_minutes,
                l.ordering, l.activities_json,
                COALESCE(p.status, 'available'),
                p.score, p.best_score, COALESCE(p.completions, 0)
           FROM lessons l
           LEFT JOIN lesson_progress p ON p.lesson_id = l.id
          WHERE l.unit_id = ?1
          ORDER BY l.ordering, l.id",
    )?;
    let rows = stmt.query_map([unit_id], |r| {
        let activities_raw: String = r.get(7)?;
        let activity_count = parse_activities(&activities_raw).len() as i64;
        Ok(LessonSummary {
            id: r.get(0)?,
            unit_id: r.get(1)?,
            title: r.get(2)?,
            jp_title: r.get(3)?,
            summary: r.get(4)?,
            duration_minutes: r.get(5)?,
            ordering: r.get(6)?,
            status: r.get(8)?,
            score: r.get(9)?,
            best_score: r.get(10)?,
            completions: r.get(11)?,
            activity_count,
        })
    })?;
    let mut out = Vec::new();
    for r in rows {
        out.push(r?);
    }
    Ok(out)
}

#[tauri::command]
pub fn get_lesson(db: State<'_, DbState>, lesson_id: i64) -> AppResult<Lesson> {
    db.with(|c| read_lesson(c, lesson_id))
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KanjiLessonRef {
    pub lesson_id: i64,
    pub title: String,
}

/// Find the lesson that teaches a given kanji or word, so the practice screen
/// can offer "go learn this". Matches an intro_kanji's kanjiChar first, then an
/// intro_vocab's word. Returns None if nothing teaches it yet.
#[tauri::command]
pub fn find_lesson_for_kanji(
    db: State<'_, DbState>,
    query: String,
) -> AppResult<Option<KanjiLessonRef>> {
    use rusqlite::OptionalExtension;
    db.with(|c| {
        // The query value is bound as a parameter (no SQL injection); only the
        // LIKE wildcards are literal.
        for key in ["kanjiChar", "word"] {
            let pattern = format!("%\"{key}\":\"{query}\"%");
            let found = c
                .query_row(
                    "SELECT id, title FROM lessons
                      WHERE activities_json LIKE ?1
                      ORDER BY ordering, id LIMIT 1",
                    [pattern],
                    |r| {
                        Ok(KanjiLessonRef {
                            lesson_id: r.get(0)?,
                            title: r.get(1)?,
                        })
                    },
                )
                .optional()?;
            if found.is_some() {
                return Ok(found);
            }
        }
        Ok(None)
    })
}

fn read_lesson(c: &Connection, id: i64) -> AppResult<Lesson> {
    c.query_row(
        "SELECT l.id, l.unit_id, l.title, l.jp_title, l.summary, l.duration_minutes,
                l.ordering, l.activities_json,
                COALESCE(p.status, 'available')
           FROM lessons l
           LEFT JOIN lesson_progress p ON p.lesson_id = l.id
          WHERE l.id = ?1",
        [id],
        |r| {
            let raw: String = r.get(7)?;
            let activities = parse_activities(&raw);
            Ok(Lesson {
                id: r.get(0)?,
                unit_id: r.get(1)?,
                title: r.get(2)?,
                jp_title: r.get(3)?,
                summary: r.get(4)?,
                duration_minutes: r.get(5)?,
                ordering: r.get(6)?,
                status: r.get(8)?,
                activities,
            })
        },
    )
    .map_err(|e| AppError::Database(format!("read lesson {id}: {e}")))
}

#[tauri::command]
pub fn start_lesson(db: State<'_, DbState>, lesson_id: i64) -> AppResult<Lesson> {
    db.with(|c| {
        c.execute(
            "INSERT INTO lesson_progress (lesson_id, status)
             VALUES (?1, 'in_progress')
             ON CONFLICT(lesson_id) DO UPDATE SET
                 status = CASE WHEN status = 'completed' THEN 'completed' ELSE 'in_progress' END,
                 last_attempt_at = datetime('now')",
            [lesson_id],
        )?;
        read_lesson(c, lesson_id)
    })
}

#[tauri::command]
pub fn complete_lesson(
    db: State<'_, DbState>,
    result: LessonResult,
) -> AppResult<LessonCompletionResponse> {
    db.with(|c| {
        let score = if result.total_quizzes > 0 {
            ((result.correct_count as f64 / result.total_quizzes as f64) * 100.0) as i64
        } else {
            100
        };
        let passed = score >= 60;
        let perfect = result.total_quizzes > 0 && result.correct_count == result.total_quizzes;

        let already_completed: i64 = c
            .query_row(
                "SELECT COUNT(*) FROM lesson_progress WHERE lesson_id = ?1 AND status = 'completed'",
                [result.lesson_id],
                |r| r.get(0),
            )
            .unwrap_or(0);
        let already = already_completed > 0;

        let new_status = if passed { "completed" } else { "in_progress" };
        c.execute(
            "INSERT INTO lesson_progress (lesson_id, status, score, best_score, completions, last_attempt_at, completed_at)
             VALUES (?1, ?2, ?3, ?3, 1, datetime('now'), CASE WHEN ?4 = 1 THEN datetime('now') ELSE NULL END)
             ON CONFLICT(lesson_id) DO UPDATE SET
                 status = ?2,
                 score = ?3,
                 best_score = MAX(COALESCE(best_score, 0), ?3),
                 completions = completions + 1,
                 last_attempt_at = datetime('now'),
                 completed_at = CASE WHEN ?4 = 1 THEN datetime('now') ELSE completed_at END",
            params![result.lesson_id, new_status, score, if passed { 1 } else { 0 }],
        )?;

        c.execute(
            "INSERT INTO activity_log (activity_type, item_id, correct, duration_seconds, metadata)
             VALUES ('lesson', ?1, ?2, ?3, NULL)",
            params![
                result.lesson_id,
                if passed { 1 } else { 0 },
                result.seconds_spent
            ],
        )?;

        let now = Utc::now();
        crate::commands::bump_daily_session(c, now, "lesson", result.seconds_spent)?;
        let xp = XP_LESSON_COMPLETE_BASE
            + result.correct_count * XP_LESSON_PER_CORRECT
            + if perfect { XP_LESSON_PERFECT_BONUS } else { 0 };
        let (xp_awarded, level_change) = award_xp_internal(
            c,
            xp,
            "lesson_complete",
            Some(&result.lesson_id.to_string()),
            now,
        )?;

        let stars = if passed {
            STAR_LESSON_PASS + if perfect { STAR_LESSON_PERFECT_BONUS } else { 0 }
        } else {
            0
        };
        let star_awarded = if stars > 0 {
            crate::commands::player::award_stars_internal(
                c,
                stars,
                "lesson_complete",
                Some(&result.lesson_id.to_string()),
            )?
        } else {
            0
        };

        // Update kanji-reviewed and minutes via the mission engine.
        let outcome = apply_event(c, MissionEvent::KanjiReviewed, now)?;
        let (today_min, week_min) = crate::commands::dashboard::minutes_today_and_week(c)?;
        let _ = apply_event(
            c,
            MissionEvent::MinutesUpdated {
                total_today: today_min,
                total_week: week_min,
            },
            now,
        )?;

        let next_lesson_id = next_lesson_after(c, result.lesson_id)?;

        Ok(LessonCompletionResponse {
            score,
            passed,
            already_completed: already,
            next_lesson_id,
            award: XpAward {
                xp_amount: xp_awarded + outcome.xp_awarded,
                star_amount: star_awarded + outcome.stars_awarded,
                leveled_up: level_change.leveled_up
                    || outcome.level_change.as_ref().map(|c| c.leveled_up).unwrap_or(false),
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

fn next_lesson_after(c: &Connection, lesson_id: i64) -> AppResult<Option<i64>> {
    let next: Option<i64> = c
        .query_row(
            "SELECT l2.id FROM lessons l1
              JOIN lessons l2 ON l2.id > l1.id
              WHERE l1.id = ?1
              ORDER BY l2.unit_id, l2.ordering, l2.id
              LIMIT 1",
            [lesson_id],
            |r| r.get(0),
        )
        .ok();
    Ok(next)
}

/// Find the next pending lesson — first lesson that is not completed.
#[tauri::command]
pub fn get_next_lesson(db: State<'_, DbState>) -> AppResult<Option<NextLessonInfo>> {
    db.with(|c| {
        let row = c.query_row(
            "SELECT l.id, l.title, l.jp_title, l.summary, l.duration_minutes,
                    u.title, u.jp_title,
                    COALESCE(p.status, 'available'),
                    COALESCE(p.completions, 0)
               FROM lessons l
               JOIN units u ON u.id = l.unit_id
               LEFT JOIN lesson_progress p ON p.lesson_id = l.id
              WHERE COALESCE(p.status, 'available') != 'completed'
              ORDER BY u.ordering, l.ordering, l.id
              LIMIT 1",
            [],
            |r| {
                let completions: i64 = r.get(8)?;
                let status: String = r.get(7)?;
                Ok(NextLessonInfo {
                    lesson_id: r.get(0)?,
                    title: r.get(1)?,
                    jp_title: r.get(2)?,
                    summary: r.get(3)?,
                    duration_minutes: r.get(4)?,
                    unit_title: r.get(5)?,
                    unit_jp_title: r.get(6)?,
                    is_first: completions == 0 && status == "available",
                })
            },
        );

        match row {
            Ok(info) => Ok(Some(info)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(AppError::Database(format!("next lesson: {e}"))),
        }
    })
}

#[cfg(test)]
mod tests {
    use crate::models::{GrammarLessonData, LessonActivities, ReadingQuestionSet};
    use rusqlite::Connection;

    /// Build a fresh in-memory DB with all migrations + seed applied.
    fn fresh_db() -> Connection {
        let conn = Connection::open_in_memory().expect("open in-memory db");
        conn.execute_batch("PRAGMA foreign_keys = ON;").unwrap();
        crate::db::migrations::run(&conn).expect("migrations run clean");
        crate::seed::run_if_empty(&conn).expect("seed runs clean");
        conn
    }

    /// Store cosmetics (avatars/backgrounds) + extra themes must be seeded and
    /// buyable (have a positive cost) so the profile customization works.
    #[test]
    fn store_cosmetics_and_themes_seeded() {
        let conn = fresh_db();
        let count = |kind: &str| -> i64 {
            conn.query_row(
                "SELECT COUNT(*) FROM rewards WHERE kind = ?1 AND cost > 0",
                [kind],
                |r| r.get(0),
            )
            .unwrap()
        };
        assert!(count("avatar") >= 9, "avatars should be buyable in the store");
        assert!(count("background") >= 4, "backgrounds should be buyable");
        // Every theme except the base Aether is buyable: sakura, sumi, koi,
        // matcha, sunset = 5.
        assert!(count("theme") >= 5, "all non-base themes should be buyable");
    }

    /// Study time + active days must be recorded for EVERY activity type, not
    /// just kanji review (regression: "Tiempo aprendido" / "Días activos" stuck
    /// at 0 because only kanji called bump_daily_session). Verifies the shared
    /// helper accumulates minutes, counts the day once, and tracks per-skill.
    #[test]
    fn bump_daily_session_accumulates_minutes_and_one_day() {
        use chrono::TimeZone;
        let conn = fresh_db();
        let now = chrono::Utc.with_ymd_and_hms(2026, 6, 23, 10, 0, 0).unwrap();

        // Two activities the same day: a 5-min lesson and a 3-min listening.
        crate::commands::bump_daily_session(&conn, now, "lesson", 300).unwrap();
        crate::commands::bump_daily_session(&conn, now, "listening", 180).unwrap();

        let (days, minutes, activities, listening): (i64, i64, i64, i64) = conn
            .query_row(
                "SELECT COUNT(*), COALESCE(SUM(minutes_studied),0),
                        COALESCE(SUM(activities_completed),0),
                        COALESCE(SUM(listening_minutes),0)
                   FROM daily_sessions",
                [],
                |r| Ok((r.get(0)?, r.get(1)?, r.get(2)?, r.get(3)?)),
            )
            .unwrap();

        assert_eq!(days, 1, "same day must be a single row");
        assert_eq!(minutes, 8, "5 min + 3 min should accumulate to 8");
        assert_eq!(activities, 2, "both activities counted");
        assert_eq!(listening, 3, "listening minutes tracked separately");
    }

    /// Every lesson's activities_json must parse into LessonActivities and have
    /// at least one activity. This guards against the bare-array vs
    /// {"activities":[...]} mistake that silently empties a lesson and freezes
    /// the lesson player on the loading screen.
    #[test]
    fn all_lessons_parse_with_activities() {
        let conn = fresh_db();
        let mut stmt = conn
            .prepare("SELECT id, title, activities_json FROM lessons ORDER BY id")
            .unwrap();
        let rows = stmt
            .query_map([], |r| {
                Ok((
                    r.get::<_, i64>(0)?,
                    r.get::<_, String>(1)?,
                    r.get::<_, String>(2)?,
                ))
            })
            .unwrap();

        let mut failures: Vec<String> = Vec::new();
        let mut total = 0;
        for row in rows {
            let (id, title, json) = row.unwrap();
            total += 1;
            match serde_json::from_str::<LessonActivities>(&json) {
                Ok(parsed) if !parsed.activities.is_empty() => {}
                Ok(_) => failures.push(format!("lesson {id} '{title}': parsed but ZERO activities")),
                Err(e) => failures.push(format!("lesson {id} '{title}': parse error: {e}")),
            }
        }

        assert!(total > 0, "no lessons seeded — migrations/seed broken");
        assert!(
            failures.is_empty(),
            "{} of {} lessons invalid:\n{}",
            failures.len(),
            total,
            failures.join("\n")
        );
    }

    /// Unit exams remix lesson activities, so the same activity shapes must hold
    /// across every course/unit. Also sanity-check the catalog seeded.
    #[test]
    fn courses_units_and_kanji_seeded() {
        let conn = fresh_db();
        let courses: i64 = conn
            .query_row("SELECT COUNT(*) FROM courses", [], |r| r.get(0))
            .unwrap();
        let units: i64 = conn
            .query_row("SELECT COUNT(*) FROM units", [], |r| r.get(0))
            .unwrap();
        let kanji: i64 = conn
            .query_row("SELECT COUNT(*) FROM kanji", [], |r| r.get(0))
            .unwrap();
        assert!(courses >= 2, "expected the N5 + situations courses, got {courses}");
        assert!(units >= 1, "no units seeded");
        assert!(kanji > 1000, "kanji catalog not fully seeded, got {kanji}");
    }

    /// Grammar lessons, reading passages and listening dialogues all store their
    /// quiz/content as JSON. Every one must parse into its Rust type with a
    /// non-empty question/quiz set — same guard as lessons, across all content.
    #[test]
    fn all_grammar_reading_listening_content_parses() {
        let conn = fresh_db();
        let mut failures: Vec<String> = Vec::new();

        // Grammar: `examples` column holds {"examples":[...],"quiz":[...]}.
        let mut g = conn
            .prepare("SELECT id, title, examples FROM grammar_lessons ORDER BY id")
            .unwrap();
        let mut g_total = 0;
        for row in g
            .query_map([], |r| {
                Ok((
                    r.get::<_, i64>(0)?,
                    r.get::<_, String>(1)?,
                    r.get::<_, Option<String>>(2)?,
                ))
            })
            .unwrap()
        {
            let (id, title, json) = row.unwrap();
            g_total += 1;
            match json.as_deref().map(serde_json::from_str::<GrammarLessonData>) {
                Some(Ok(d)) if !d.quiz.is_empty() => {}
                Some(Ok(_)) => failures.push(format!("grammar {id} '{title}': parsed but empty quiz")),
                Some(Err(e)) => failures.push(format!("grammar {id} '{title}': {e}")),
                None => failures.push(format!("grammar {id} '{title}': null content")),
            }
        }

        // Reading + listening: `questions` column holds {"questions":[...]}.
        for table in ["reading_passages", "listening_dialogues"] {
            let mut stmt = conn
                .prepare(&format!("SELECT id, title, questions FROM {table} ORDER BY id"))
                .unwrap();
            for row in stmt
                .query_map([], |r| {
                    Ok((
                        r.get::<_, i64>(0)?,
                        r.get::<_, String>(1)?,
                        r.get::<_, Option<String>>(2)?,
                    ))
                })
                .unwrap()
            {
                let (id, title, json) = row.unwrap();
                match json.as_deref().map(serde_json::from_str::<ReadingQuestionSet>) {
                    Some(Ok(q)) if !q.questions.is_empty() => {}
                    Some(Ok(_)) => failures.push(format!("{table} {id} '{title}': empty questions")),
                    Some(Err(e)) => failures.push(format!("{table} {id} '{title}': {e}")),
                    None => failures.push(format!("{table} {id} '{title}': null questions")),
                }
            }
        }

        assert!(g_total > 0, "no grammar lessons seeded");
        assert!(failures.is_empty(), "content parse failures:\n{}", failures.join("\n"));
    }
}
