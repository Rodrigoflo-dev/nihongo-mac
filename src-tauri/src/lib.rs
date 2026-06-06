mod commands;
mod db;
mod error;
mod models;
mod seed;
mod srs;

use tauri::Manager;

use crate::db::DbState;
use crate::error::AppResult;

#[tauri::command]
fn app_version(app: tauri::AppHandle) -> String {
    app.package_info().version.to_string()
}

#[tauri::command]
fn db_health(db: tauri::State<'_, DbState>) -> AppResult<i64> {
    db.with(|c| {
        let v: i64 = c.query_row("SELECT COUNT(*) FROM schema_version", [], |r| r.get(0))?;
        Ok(v)
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let db_state = db::init(app.handle())?;
            db_state.with(|c| seed::run_if_empty(c))?;
            app.manage(db_state);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            app_version,
            db_health,
            // auth (local login)
            commands::auth::auth_status,
            commands::auth::set_credentials,
            commands::auth::verify_pin,
            // user
            commands::user::get_user_profile,
            commands::user::update_user_profile,
            commands::user::complete_onboarding,
            // dashboard
            commands::dashboard::get_dashboard_stats,
            commands::dashboard::get_lifetime_stats,
            commands::dashboard::get_activity_heatmap,
            commands::dashboard::get_achievements,
            // guidance
            commands::guidance::get_next_action,
            // player + missions
            commands::player::get_player_state,
            commands::missions::get_daily_missions,
            commands::missions::get_weekly_missions,
            // rewards
            commands::rewards::list_rewards,
            commands::rewards::purchase_reward,
            commands::rewards::activate_double_xp,
            commands::rewards::claim_rest_day,
            // kanji
            commands::kanji::list_kanji,
            commands::kanji::get_review_queue,
            commands::kanji::introduce_kanji,
            commands::kanji::review_kanji,
            // grammar
            commands::grammar::list_grammar,
            commands::grammar::get_grammar_lesson,
            commands::grammar::start_grammar_lesson,
            commands::grammar::submit_grammar_quiz,
            // lessons (guided e-learning)
            commands::lessons::list_courses,
            commands::lessons::get_lesson,
            commands::lessons::start_lesson,
            commands::lessons::complete_lesson,
            commands::lessons::get_next_lesson,
            // unit exams
            commands::exams::get_unit_exam,
            commands::exams::complete_unit_exam,
            // mini-games
            commands::minigames::record_minigame_score,
            commands::minigames::get_minigame_best,
            // reading
            commands::reading::list_reading,
            commands::reading::get_reading_passage,
            commands::reading::complete_reading_passage,
            // listening
            commands::listening::list_listening,
            commands::listening::get_listening_dialogue,
            commands::listening::complete_listening_dialogue,
            // journal
            commands::journal::list_journal,
            commands::journal::create_journal_entry,
            commands::journal::delete_journal_entry,
            // notifications
            commands::notifications::check_reminder_due,
            commands::notifications::open_mic_settings,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
