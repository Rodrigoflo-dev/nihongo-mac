use rusqlite::{params, Connection};

use crate::error::{AppError, AppResult};

/// Embedded migration files. Order matters — applied lowest version first.
const MIGRATIONS: &[(u32, &str, &str)] = &[
    (
        1,
        "001_initial",
        include_str!("../../migrations/001_initial.sql"),
    ),
    (
        2,
        "002_achievements_seed",
        include_str!("../../migrations/002_achievements_seed.sql"),
    ),
    (
        3,
        "003_player_and_missions",
        include_str!("../../migrations/003_player_and_missions.sql"),
    ),
    (
        4,
        "004_grammar_seed",
        include_str!("../../migrations/004_grammar_seed.sql"),
    ),
    (
        5,
        "005_reading_listening",
        include_str!("../../migrations/005_reading_listening.sql"),
    ),
    (
        6,
        "006_lessons",
        include_str!("../../migrations/006_lessons.sql"),
    ),
    (
        7,
        "007_lessons_v2",
        include_str!("../../migrations/007_lessons_v2.sql"),
    ),
    (
        8,
        "008_exams_and_minigames",
        include_str!("../../migrations/008_exams_and_minigames.sql"),
    ),
    (
        9,
        "009_beta_reset",
        include_str!("../../migrations/009_beta_reset.sql"),
    ),
    (
        10,
        "010_auth",
        include_str!("../../migrations/010_auth.sql"),
    ),
    (
        11,
        "011_reseed_kanji",
        include_str!("../../migrations/011_reseed_kanji.sql"),
    ),
];

/// Run all pending migrations against the connection.
pub fn run(conn: &Connection) -> AppResult<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS schema_version (
            version INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );",
    )
    .map_err(|e| AppError::Database(format!("create schema_version: {e}")))?;

    let current: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM schema_version",
            [],
            |r| r.get(0),
        )
        .map_err(|e| AppError::Database(format!("read current version: {e}")))?;

    for (version, name, sql) in MIGRATIONS {
        if (*version as i64) <= current {
            continue;
        }
        log::info!("applying migration {version} {name}");
        // Wrap each migration in an explicit transaction so partial failures
        // don't leave the database in a broken state.
        let wrapped = format!("BEGIN;\n{sql}\nCOMMIT;");
        if let Err(e) = conn.execute_batch(&wrapped) {
            // Try to rollback to be safe — ignore failure since the tx may
            // have already been aborted.
            let _ = conn.execute_batch("ROLLBACK;");
            return Err(AppError::Database(format!("migration {name}: {e}")));
        }
        conn.execute(
            "INSERT INTO schema_version (version, name) VALUES (?1, ?2)",
            params![version, name],
        )
        .map_err(|e| AppError::Database(format!("record migration {name}: {e}")))?;
    }

    Ok(())
}
