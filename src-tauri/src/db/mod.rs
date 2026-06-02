use std::path::PathBuf;

use parking_lot::Mutex;
use rusqlite::Connection;
use tauri::{AppHandle, Manager};

use crate::error::{AppError, AppResult};

pub mod migrations;

/// Application database state — wraps a single SQLite connection behind a mutex.
///
/// SQLite supports concurrent reads but serializes writes, so for a local
/// single-user desktop app one pooled connection is the right balance of
/// simplicity and performance. WAL mode is enabled for better concurrency
/// with the recommender background tasks.
pub struct DbState {
    pub conn: Mutex<Connection>,
}

impl DbState {
    pub fn new(conn: Connection) -> Self {
        Self {
            conn: Mutex::new(conn),
        }
    }

    /// Convenience: run a closure with a locked connection.
    pub fn with<F, R>(&self, f: F) -> AppResult<R>
    where
        F: FnOnce(&Connection) -> AppResult<R>,
    {
        let conn = self.conn.lock();
        f(&conn)
    }

    /// Convenience: run a closure with a mutably-borrowed locked connection
    /// (needed for transactions).
    pub fn with_mut<F, R>(&self, f: F) -> AppResult<R>
    where
        F: FnOnce(&mut Connection) -> AppResult<R>,
    {
        let mut conn = self.conn.lock();
        f(&mut conn)
    }
}

fn database_path(app: &AppHandle) -> AppResult<PathBuf> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| AppError::Other(format!("could not resolve app data dir: {e}")))?;
    std::fs::create_dir_all(&dir)?;
    Ok(dir.join("nihongo.db"))
}

/// Initialize the database: open the connection, configure pragmas, run
/// migrations, and return a DbState ready to be `manage`d by Tauri.
pub fn init(app: &AppHandle) -> AppResult<DbState> {
    let path = database_path(app)?;
    log::info!("opening database at {}", path.display());

    let conn = Connection::open(&path)
        .map_err(|e| AppError::Database(format!("open {}: {e}", path.display())))?;

    // Pragmas for a responsive, durable desktop database.
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;
         PRAGMA foreign_keys = ON;
         PRAGMA temp_store = MEMORY;
         PRAGMA cache_size = -20000;",
    )
    .map_err(|e| AppError::Database(format!("pragmas: {e}")))?;

    migrations::run(&conn)?;
    log::info!("database ready");

    Ok(DbState::new(conn))
}
