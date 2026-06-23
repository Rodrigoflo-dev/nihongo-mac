use chrono::Utc;
use rusqlite::{params, Connection};
use tauri::State;

use crate::commands::player::award_xp_internal;
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{
    ListeningDialogue, ListeningListItem, QuizQuestion, ReadingQuestionSet, XpAward,
};

const XP_LISTEN: i64 = 25;
const XP_LISTEN_QUIZ_PASS: i64 = 45;

fn parse_questions(raw: Option<String>) -> Vec<QuizQuestion> {
    raw.and_then(|s| serde_json::from_str::<ReadingQuestionSet>(&s).ok())
        .map(|d| d.questions)
        .unwrap_or_default()
}

#[tauri::command]
pub fn list_listening(
    db: State<'_, DbState>,
    level: String,
) -> AppResult<Vec<ListeningListItem>> {
    db.with(|c| {
        let mut stmt = c.prepare(
            "SELECT d.id, d.title, d.jlpt_level, d.description,
                    COALESCE(p.completed, 0), p.last_score
               FROM listening_dialogues d
               LEFT JOIN listening_progress p ON p.dialogue_id = d.id
              WHERE d.jlpt_level = ?1
              ORDER BY d.ordering, d.id",
        )?;
        let rows = stmt.query_map([level.as_str()], |r| {
            Ok(ListeningListItem {
                id: r.get(0)?,
                title: r.get(1)?,
                jlpt_level: r.get(2)?,
                description: r.get(3)?,
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
pub fn get_listening_dialogue(
    db: State<'_, DbState>,
    dialogue_id: i64,
) -> AppResult<ListeningDialogue> {
    db.with(|c| read_dialogue(c, dialogue_id))
}

fn read_dialogue(conn: &Connection, id: i64) -> AppResult<ListeningDialogue> {
    conn.query_row(
        "SELECT d.id, d.title, d.jlpt_level, d.description, d.transcript_jp,
                d.transcript_translation, d.voice, d.questions,
                CASE WHEN COALESCE(p.completed, 0) = 1 THEN 'completed' ELSE 'new' END,
                p.last_score
           FROM listening_dialogues d
           LEFT JOIN listening_progress p ON p.dialogue_id = d.id
          WHERE d.id = ?1",
        [id],
        |r| {
            let raw: Option<String> = r.get(7)?;
            Ok(ListeningDialogue {
                id: r.get(0)?,
                title: r.get(1)?,
                jlpt_level: r.get(2)?,
                description: r.get(3)?,
                transcript_jp: r.get(4)?,
                transcript_translation: r.get(5)?,
                voice: r.get(6)?,
                questions: parse_questions(raw),
                status: r.get(8)?,
                last_score: r.get(9)?,
            })
        },
    )
    .map_err(|e| AppError::Database(format!("read dialogue {id}: {e}")))
}

// Japanese text-to-speech is now handled entirely in the frontend via the
// WebView's Web Speech API (see src/lib/tts.ts). The previous macOS `say`
// implementation did not work on Windows (no audio + a stray console window).

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListeningQuizSubmission {
    pub answers: Vec<ListeningQuizAnswer>,
    pub duration_seconds: Option<i64>,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListeningQuizAnswer {
    pub question_id: String,
    pub option_index: usize,
}

#[tauri::command]
pub fn complete_listening_dialogue(
    db: State<'_, DbState>,
    dialogue_id: i64,
    submission: ListeningQuizSubmission,
) -> AppResult<XpAward> {
    db.with(|c| {
        let dialogue = read_dialogue(c, dialogue_id)?;
        let total = dialogue.questions.len() as i64;
        let mut correct = 0i64;
        for q in &dialogue.questions {
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
            "INSERT INTO listening_progress (dialogue_id, times_played, last_score, last_played_at, completed)
             VALUES (?1, 1, ?2, datetime('now'), ?3)
             ON CONFLICT(dialogue_id) DO UPDATE SET
                 times_played = times_played + 1,
                 last_score = ?2,
                 last_played_at = datetime('now'),
                 completed = MAX(completed, ?3)",
            params![dialogue_id, score, if passed { 1 } else { 0 }],
        )?;
        c.execute(
            "INSERT INTO activity_log (activity_type, item_id, correct, duration_seconds, metadata)
             VALUES ('listening', ?1, ?2, ?3, NULL)",
            params![
                dialogue_id,
                if passed { 1 } else { 0 },
                submission.duration_seconds.unwrap_or(0)
            ],
        )?;

        let now = Utc::now();
        crate::commands::bump_daily_session(
            c,
            now,
            "listening",
            submission.duration_seconds.unwrap_or(0),
        )?;
        let xp = XP_LISTEN + if passed { XP_LISTEN_QUIZ_PASS } else { 10 };
        let (effective, change) = award_xp_internal(
            c,
            xp,
            "listening_quiz",
            Some(&dialogue_id.to_string()),
            now,
        )?;

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
