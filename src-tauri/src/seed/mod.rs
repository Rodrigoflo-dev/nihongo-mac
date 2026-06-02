use rusqlite::{params, Connection};
use serde::Deserialize;

use crate::error::{AppError, AppResult};

const KANJI_N5_JSON: &str = include_str!("kanji_n5.json");

#[derive(Debug, Deserialize, serde::Serialize)]
struct SeedKanjiExample {
    jp: String,
    reading: String,
    meaning: String,
}

#[derive(Debug, Deserialize)]
struct SeedKanji {
    id: i64,
    character: String,
    meaning_es: String,
    meaning_en: Option<String>,
    onyomi: Vec<String>,
    kunyomi: Vec<String>,
    stroke_count: i64,
    grade: Option<i64>,
    frequency: Option<i64>,
    examples: Vec<SeedKanjiExample>,
    mnemonic: Option<String>,
}

pub fn run_if_empty(conn: &Connection) -> AppResult<()> {
    let count: i64 = conn
        .query_row("SELECT COUNT(*) FROM kanji", [], |r| r.get(0))
        .map_err(|e| AppError::Database(format!("count kanji: {e}")))?;
    if count > 0 {
        return Ok(());
    }

    let kanji: Vec<SeedKanji> = serde_json::from_str(KANJI_N5_JSON)
        .map_err(|e| AppError::Other(format!("parse kanji seed: {e}")))?;

    let tx = conn
        .unchecked_transaction()
        .map_err(|e| AppError::Database(format!("begin tx: {e}")))?;

    let mut stmt = tx
        .prepare(
            "INSERT OR REPLACE INTO kanji (
                id, character, meaning_es, meaning_en, onyomi, kunyomi,
                jlpt_level, grade, stroke_count, radical, examples, mnemonic, frequency
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, NULL, ?10, ?11, ?12)",
        )
        .map_err(|e| AppError::Database(format!("prepare seed insert: {e}")))?;

    for k in &kanji {
        let onyomi_json = serde_json::to_string(&k.onyomi)?;
        let kunyomi_json = serde_json::to_string(&k.kunyomi)?;
        let examples_json = serde_json::to_string(&k.examples)?;

        stmt.execute(params![
            k.id,
            k.character,
            k.meaning_es,
            k.meaning_en,
            onyomi_json,
            kunyomi_json,
            "N5",
            k.grade,
            k.stroke_count,
            examples_json,
            k.mnemonic,
            k.frequency,
        ])
        .map_err(|e| AppError::Database(format!("insert kanji {}: {e}", k.character)))?;
    }
    drop(stmt);

    tx.commit()
        .map_err(|e| AppError::Database(format!("commit seed tx: {e}")))?;

    log::info!("seeded {} kanji", kanji.len());
    Ok(())
}
