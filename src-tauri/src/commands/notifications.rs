//! Reminder logic + macOS mic-settings helper.
//!
//! Native notifications themselves are sent from the frontend via
//! `@tauri-apps/plugin-notification` (cross-platform Mac + Windows, with proper
//! permission handling). This module only decides *whether* a reminder is due
//! (`check_reminder_due`) and provides a macOS shortcut to the mic settings.

use std::process::Command;

use crate::error::{AppError, AppResult};

#[tauri::command]
pub async fn open_mic_settings() -> AppResult<()> {
    tokio::task::spawn_blocking(|| {
        #[cfg(target_os = "macos")]
        {
            Command::new("open")
                .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone")
                .status()
                .map_err(|e| AppError::Other(format!("could not open settings: {e}")))?;
        }
        #[cfg(target_os = "windows")]
        {
            // `explorer` resolves the ms-settings: URI and is a GUI process, so
            // it never flashes a console window (unlike `cmd /C start`).
            Command::new("explorer")
                .arg("ms-settings:privacy-microphone")
                .status()
                .map_err(|e| AppError::Other(format!("could not open settings: {e}")))?;
        }
        Ok::<(), AppError>(())
    })
    .await
    .map_err(|e| AppError::Other(format!("settings join: {e}")))??;
    Ok(())
}

#[tauri::command]
pub fn check_reminder_due(
    db: tauri::State<'_, crate::db::DbState>,
) -> AppResult<Option<String>> {
    db.with(|c| {
        let reminder_time: Option<String> = c
            .query_row(
                "SELECT reminder_time FROM user_profile WHERE id = 1",
                [],
                |r| r.get(0),
            )
            .unwrap_or(None);

        let Some(time) = reminder_time else {
            return Ok(None);
        };

        // Has the user been active today?
        let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
        let active_today: i64 = c
            .query_row(
                "SELECT COUNT(*) FROM activity_log WHERE date(created_at) = ?1",
                [today.as_str()],
                |r| r.get(0),
            )
            .unwrap_or(0);

        if active_today > 0 {
            return Ok(None);
        }

        // Time format: HH:MM
        let now = chrono::Local::now();
        let now_str = now.format("%H:%M").to_string();
        if now_str >= time {
            Ok(Some(format!(
                "Tienes misiones pendientes. Estaba esperándote — {time}."
            )))
        } else {
            Ok(None)
        }
    })
}
