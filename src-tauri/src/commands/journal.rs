//! Journal — write in Japanese and get encouraging, offline feedback.
//!
//! The journal used to call an external AI (Claude API / local Ollama) to
//! correct the text. That dependency was removed (no budget, must work fully
//! offline). Feedback is now generated locally with safe, mechanical heuristics
//! (length, politeness, kanji usage, punctuation, leftover romaji). We never
//! fabricate grammar "corrections" we can't verify — only mechanical, safe
//! suggestions are returned so we don't teach wrong Japanese.

use chrono::Utc;
use rusqlite::{params, Connection};
use tauri::State;

use crate::commands::player::award_xp_internal;
use crate::db::DbState;
use crate::error::{AppError, AppResult};
use crate::models::{JournalCorrection, JournalCorrectionResponse, JournalEntry, XpAward};

const XP_JOURNAL_ENTRY: i64 = 80;

// ---------------------------------------------------------------------------
// Journal CRUD
// ---------------------------------------------------------------------------

fn parse_corrections(raw: Option<String>) -> Vec<JournalCorrection> {
    raw.and_then(|s| serde_json::from_str::<Vec<JournalCorrection>>(&s).ok())
        .unwrap_or_default()
}

/// Count "words" — for Japanese (no spaces) we count non-whitespace characters,
/// which is a more meaningful effort signal than whitespace-delimited tokens.
fn count_words(text: &str) -> i64 {
    text.chars().filter(|c| !c.is_whitespace()).count() as i64
}

fn is_hiragana(c: char) -> bool {
    ('\u{3040}'..='\u{309F}').contains(&c)
}
fn is_katakana(c: char) -> bool {
    ('\u{30A0}'..='\u{30FF}').contains(&c)
}
fn is_kanji(c: char) -> bool {
    ('\u{4E00}'..='\u{9FFF}').contains(&c)
}
fn is_japanese(c: char) -> bool {
    is_hiragana(c) || is_katakana(c) || is_kanji(c)
}

/// Generate warm, safe, offline feedback + mechanical-only corrections.
fn analyze_entry(text: &str) -> (Option<String>, Vec<JournalCorrection>) {
    let jp_count = text.chars().filter(|c| is_japanese(*c)).count();
    let has_kanji = text.chars().any(is_kanji);
    let polite = text.contains("です") || text.contains("ます");

    let mut fb = String::new();
    if jp_count >= 40 {
        fb.push_str("¡Excelente! Escribiste bastante en japonés. ");
    } else if jp_count >= 15 {
        fb.push_str("¡Buen trabajo manteniendo el hábito de escribir! ");
    } else {
        fb.push_str("Bien por practicar. La próxima intenta extenderte un poco más. ");
    }
    if polite {
        fb.push_str("Usaste formas corteses (です/ます). ");
    }
    if has_kanji {
        fb.push_str("Incluiste kanji, ¡sigue así!");
    } else {
        fb.push_str("Para subir de nivel, intenta incorporar algún kanji que ya conozcas.");
    }

    let mut corrections = Vec::new();

    // Mechanical check 1: leftover romaji (latin letters) in a Japanese journal.
    let romaji: String = text
        .chars()
        .skip_while(|c| !c.is_ascii_alphabetic())
        .take_while(|c| c.is_ascii_alphabetic())
        .collect();
    if !romaji.is_empty() && romaji.len() >= 2 {
        corrections.push(JournalCorrection {
            original: romaji,
            corrected: "（escríbelo en hiragana / katakana / kanji）".into(),
            explanation: "Encontré letras latinas; en japonés se escribe con kana o kanji.".into(),
            category: Some("style".into()),
        });
    }

    // Mechanical check 2: missing sentence-final punctuation.
    let last = text.trim_end().chars().last();
    if let Some(c) = last {
        if is_japanese(c) && !matches!(c, '。' | '！' | '？') {
            corrections.push(JournalCorrection {
                original: c.to_string(),
                corrected: format!("{c}。"),
                explanation: "Recuerda terminar la oración con 。".into(),
                category: Some("style".into()),
            });
        }
    }

    (Some(fb), corrections)
}

fn read_entry(conn: &Connection, id: i64) -> AppResult<JournalEntry> {
    conn.query_row(
        "SELECT id, entry_date, text_jp, text_translation, ai_feedback,
                corrections_json, word_count, created_at
           FROM journal_entries WHERE id = ?1",
        [id],
        |r| {
            let raw: Option<String> = r.get(5)?;
            Ok(JournalEntry {
                id: r.get(0)?,
                entry_date: r.get(1)?,
                text_jp: r.get(2)?,
                text_translation: r.get(3)?,
                ai_feedback: r.get(4)?,
                corrections: parse_corrections(raw),
                word_count: r.get(6)?,
                created_at: r.get(7)?,
            })
        },
    )
    .map_err(|e| AppError::Database(format!("read entry {id}: {e}")))
}

#[tauri::command]
pub fn list_journal(db: State<'_, DbState>, limit: Option<i64>) -> AppResult<Vec<JournalEntry>> {
    let limit = limit.unwrap_or(50).clamp(1, 200);
    db.with(|c| {
        let mut stmt = c.prepare(
            "SELECT id, entry_date, text_jp, text_translation, ai_feedback,
                    corrections_json, word_count, created_at
               FROM journal_entries
              ORDER BY created_at DESC
              LIMIT ?1",
        )?;
        let rows = stmt.query_map([limit], |r| {
            let raw: Option<String> = r.get(5)?;
            Ok(JournalEntry {
                id: r.get(0)?,
                entry_date: r.get(1)?,
                text_jp: r.get(2)?,
                text_translation: r.get(3)?,
                ai_feedback: r.get(4)?,
                corrections: parse_corrections(raw),
                word_count: r.get(6)?,
                created_at: r.get(7)?,
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
pub fn create_journal_entry(
    db: State<'_, DbState>,
    text_jp: String,
) -> AppResult<JournalCorrectionResponse> {
    let trimmed = text_jp.trim().to_string();
    if trimmed.is_empty() {
        return Err(AppError::InvalidInput("la entrada está vacía".into()));
    }

    let (feedback, corrections) = analyze_entry(&trimmed);
    let translation: Option<String> = None;

    let now = Utc::now();
    let today = now.format("%Y-%m-%d").to_string();
    let word_count = count_words(&trimmed);
    let corrections_json = serde_json::to_string(&corrections)?;

    db.with(|c| {
        c.execute(
            "INSERT INTO journal_entries (entry_date, text_jp, text_translation,
                                         ai_feedback, corrections_json, word_count)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                today,
                trimmed,
                translation,
                feedback,
                corrections_json,
                word_count
            ],
        )?;

        let id: i64 = c.last_insert_rowid();

        c.execute(
            "INSERT INTO activity_log (activity_type, item_id, correct, duration_seconds, metadata)
             VALUES ('journal', ?1, 1, 0, NULL)",
            [id],
        )?;

        // Update error patterns aggregate
        for corr in &corrections {
            if let Some(category) = &corr.category {
                c.execute(
                    "INSERT INTO error_patterns (pattern_key, label, description, category, occurrences, last_seen_at)
                     VALUES (?1, ?2, ?3, ?4, 1, datetime('now'))
                     ON CONFLICT(pattern_key) DO UPDATE SET
                         occurrences = occurrences + 1,
                         last_seen_at = datetime('now')",
                    params![
                        format!("{}-{}", category, corr.original),
                        corr.original,
                        corr.explanation,
                        category
                    ],
                )?;
            }
        }

        let (xp_effective, change) =
            award_xp_internal(c, XP_JOURNAL_ENTRY, "journal_entry", Some(&id.to_string()), now)?;

        Ok(JournalCorrectionResponse {
            entry: read_entry(c, id)?,
            award: XpAward {
                xp_amount: xp_effective,
                star_amount: 0,
                leveled_up: change.leveled_up,
                new_level: change.new_level,
                previous_level: change.previous_level,
                completed_daily: vec![],
                completed_weekly: vec![],
            },
        })
    })
}

#[tauri::command]
pub fn delete_journal_entry(db: State<'_, DbState>, entry_id: i64) -> AppResult<()> {
    db.with(|c| {
        c.execute("DELETE FROM journal_entries WHERE id = ?1", [entry_id])?;
        Ok(())
    })
}
