//! Local login: a single username + PIN that gates the app.
//!
//! Fully offline. The PIN is never stored in clear text — we keep a SHA-256
//! hash of `salt || pin` plus the random per-install salt. There is no network
//! and no account server; this just protects the local profile from casual
//! access. The "unlocked" session lives in the frontend (resets each launch).

use rand::RngCore;
use rusqlite::{params, OptionalExtension};
use sha2::{Digest, Sha256};
use tauri::State;

use crate::db::DbState;
use crate::error::{AppError, AppResult};

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthStatus {
    /// Whether a credential has been created yet.
    pub has_credential: bool,
    /// The username, if a credential exists.
    pub username: Option<String>,
}

fn hash_pin(pin: &str, salt_hex: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(salt_hex.as_bytes());
    hasher.update(pin.as_bytes());
    let digest = hasher.finalize();
    hex_encode(&digest)
}

fn hex_encode(bytes: &[u8]) -> String {
    let mut s = String::with_capacity(bytes.len() * 2);
    for b in bytes {
        s.push_str(&format!("{:02x}", b));
    }
    s
}

#[tauri::command]
pub fn auth_status(db: State<'_, DbState>) -> AppResult<AuthStatus> {
    db.with(|c| {
        let row = c
            .query_row(
                "SELECT username FROM app_auth WHERE id = 1",
                [],
                |r| r.get::<_, String>(0),
            )
            .optional()
            .map_err(|e| AppError::Database(format!("auth_status: {e}")))?;
        Ok(AuthStatus {
            has_credential: row.is_some(),
            username: row,
        })
    })
}

#[tauri::command]
pub fn set_credentials(
    db: State<'_, DbState>,
    username: String,
    pin: String,
) -> AppResult<AuthStatus> {
    let username = username.trim().to_string();
    if username.is_empty() {
        return Err(AppError::InvalidInput("el nombre de usuario está vacío".into()));
    }
    if pin.len() < 4 {
        return Err(AppError::InvalidInput("el PIN debe tener al menos 4 dígitos".into()));
    }

    // Random 16-byte salt, stored as hex.
    let mut salt_bytes = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut salt_bytes);
    let salt_hex = hex_encode(&salt_bytes);
    let pin_hash = hash_pin(&pin, &salt_hex);

    db.with(|c| {
        c.execute(
            "INSERT INTO app_auth (id, username, pin_hash, pin_salt)
             VALUES (1, ?1, ?2, ?3)
             ON CONFLICT(id) DO UPDATE SET
                 username = ?1,
                 pin_hash = ?2,
                 pin_salt = ?3,
                 updated_at = datetime('now')",
            params![username, pin_hash, salt_hex],
        )?;
        Ok(())
    })?;

    Ok(AuthStatus {
        has_credential: true,
        username: Some(username),
    })
}

#[tauri::command]
pub fn verify_pin(db: State<'_, DbState>, pin: String) -> AppResult<bool> {
    db.with(|c| {
        let row = c
            .query_row(
                "SELECT pin_hash, pin_salt FROM app_auth WHERE id = 1",
                [],
                |r| Ok((r.get::<_, String>(0)?, r.get::<_, String>(1)?)),
            )
            .optional()
            .map_err(|e| AppError::Database(format!("verify_pin: {e}")))?;

        let Some((stored_hash, salt_hex)) = row else {
            return Ok(false);
        };
        Ok(hash_pin(&pin, &salt_hex) == stored_hash)
    })
}
