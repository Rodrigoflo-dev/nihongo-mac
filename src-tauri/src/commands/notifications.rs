//! Native macOS notifications via `osascript`.
//!
//! Uses the system Notification Center. The first notification triggers a
//! macOS permission prompt the user has to accept; from then on it's silent.

use std::process::Command;

use crate::error::{AppError, AppResult};

#[tauri::command]
pub async fn open_mic_settings() -> AppResult<()> {
    tokio::task::spawn_blocking(|| {
        Command::new("open")
            .arg("x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone")
            .status()
            .map_err(|e| AppError::Other(format!("could not open settings: {e}")))?;
        Ok::<(), AppError>(())
    })
    .await
    .map_err(|e| AppError::Other(format!("settings join: {e}")))??;
    Ok(())
}

fn escape_double(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"")
}

#[tauri::command]
pub async fn send_notification(title: String, body: String) -> AppResult<()> {
    let title = escape_double(&title);
    let body = escape_double(&body);
    let script = format!(
        "display notification \"{body}\" with title \"Nihongo\" subtitle \"{title}\""
    );

    tokio::task::spawn_blocking(move || {
        let status = Command::new("osascript")
            .arg("-e")
            .arg(&script)
            .status()
            .map_err(|e| AppError::Other(format!("could not spawn osascript: {e}")))?;
        if !status.success() {
            return Err(AppError::Other(format!("osascript exited with {}", status)));
        }
        Ok(())
    })
    .await
    .map_err(|e| AppError::Other(format!("notification join: {e}")))?
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
