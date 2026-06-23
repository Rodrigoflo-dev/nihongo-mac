use chrono::Utc;
use rusqlite::{params, Connection};
use tauri::State;

use crate::commands::player::award_xp_internal;
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{
    QuizQuestion, ReadingListItem, ReadingPassage, ReadingQuestionSet, XpAward,
};

const XP_READ_PASSAGE: i64 = 30;
const XP_READ_QUIZ_PASS: i64 = 50;

fn parse_questions(raw: Option<String>) -> Vec<QuizQuestion> {
    raw.and_then(|s| serde_json::from_str::<ReadingQuestionSet>(&s).ok())
        .map(|d| d.questions)
        .unwrap_or_default()
}

#[tauri::command]
pub fn list_reading(db: State<'_, DbState>, level: String) -> AppResult<Vec<ReadingListItem>> {
    db.with(|c| {
        let mut stmt = c.prepare(
            "SELECT r.id, r.title, r.jlpt_level, r.summary,
                    COALESCE(p.completed, 0) AS completed,
                    p.last_score
               FROM reading_passages r
               LEFT JOIN reading_progress p ON p.passage_id = r.id
              WHERE r.jlpt_level = ?1
              ORDER BY r.ordering, r.id",
        )?;
        let rows = stmt.query_map([level.as_str()], |r| {
            Ok(ReadingListItem {
                id: r.get(0)?,
                title: r.get(1)?,
                jlpt_level: r.get(2)?,
                summary: r.get(3)?,
                completed: r.get::<_, i64>(4)? != 0,
                last_score: r.get(5)?,
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
pub fn get_reading_passage(
    db: State<'_, DbState>,
    passage_id: i64,
) -> AppResult<ReadingPassage> {
    db.with(|c| read_passage(c, passage_id))
}

fn read_passage(conn: &Connection, id: i64) -> AppResult<ReadingPassage> {
    conn.query_row(
        "SELECT r.id, r.title, r.jlpt_level, r.summary, r.text_jp, r.text_translation,
                r.questions,
                CASE WHEN COALESCE(p.completed, 0) = 1 THEN 'completed' ELSE 'new' END,
                p.last_score
           FROM reading_passages r
           LEFT JOIN reading_progress p ON p.passage_id = r.id
          WHERE r.id = ?1",
        [id],
        |r| {
            let raw: Option<String> = r.get(6)?;
            Ok(ReadingPassage {
                id: r.get(0)?,
                title: r.get(1)?,
                jlpt_level: r.get(2)?,
                summary: r.get(3)?,
                text_jp: r.get(4)?,
                text_translation: r.get(5)?,
                questions: parse_questions(raw),
                status: r.get(7)?,
                last_score: r.get(8)?,
            })
        },
    )
    .map_err(|e| AppError::Database(format!("read passage {id}: {e}")))
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadingQuizSubmission {
    pub answers: Vec<ReadingQuizAnswer>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReadingQuizAnswer {
    pub question_id: String,
    pub option_index: usize,
}

#[tauri::command]
pub fn complete_reading_passage(
    db: State<'_, DbState>,
    passage_id: i64,
    submission: ReadingQuizSubmission,
) -> AppResult<XpAward> {
    db.with(|c| {
        let passage = read_passage(c, passage_id)?;
        let total = passage.questions.len() as i64;
        let mut correct = 0i64;
        for q in &passage.questions {
            if let Some(a) = submission.answers.iter().find(|x| x.question_id == q.id) {
                if let Some(opt) = q.options.get(a.option_index) {
                    if opt.correct {
                        correct += 1;
                    }
                }
            }
        }
        let score = if total > 0 {
            (correct as f64 / total as f64) * 100.0
        } else {
            100.0
        };
        let passed = score >= 70.0;

        c.execute(
            "INSERT INTO reading_progress (passage_id, times_read, last_score, last_read_at, completed)
             VALUES (?1, 1, ?2, datetime('now'), ?3)
             ON CONFLICT(passage_id) DO UPDATE SET
                 times_read = times_read + 1,
                 last_score = ?2,
                 last_read_at = datetime('now'),
                 completed = MAX(completed, ?3)",
            params![passage_id, score, if passed { 1 } else { 0 }],
        )?;
        c.execute(
            "INSERT INTO activity_log (activity_type, item_id, correct, duration_seconds, metadata)
             VALUES ('reading_quiz', ?1, ?2, 0, NULL)",
            params![passage_id, if passed { 1 } else { 0 }],
        )?;

        let now = Utc::now();
        // Reading time isn't tracked client-side; estimate from passage length
        // (reading + answering) so study time and active days still count.
        let est_seconds = 60 + total * 30;
        crate::commands::bump_daily_session(c, now, "reading", est_seconds)?;
        let xp = XP_READ_PASSAGE + if passed { XP_READ_QUIZ_PASS } else { 10 };
        let (effective, change) =
            award_xp_internal(c, xp, "reading_quiz", Some(&passage_id.to_string()), now)?;

        Ok(XpAward {
            xp_amount: effective,
            star_amount: 0,
            leveled_up: change.leveled_up,
            new_level: change.new_level,
            previous_level: change.previous_level,
            completed_daily: vec![],
            completed_weekly: vec![],
        })
    })
}
