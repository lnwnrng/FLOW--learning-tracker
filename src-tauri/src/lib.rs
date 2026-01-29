mod commands;
mod db;
mod models;

use db::Database;
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize logging in debug mode
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Initialize database
            let db_path = db::get_db_path(app.handle());
            log::info!("Database path: {:?}", db_path);
            
            let database = Database::new(&db_path)
                .expect("Failed to initialize database");
            
            log::info!("Database initialized successfully");
            
            // Store database in app state
            app.manage(database);

            // Create splashscreen window
            let splash_url = WebviewUrl::App("splash.html".into());
            let _ = WebviewWindowBuilder::new(app.handle(), "splashscreen", splash_url)
                .title("FLOW")
                .decorations(false)
                .transparent(true)
                .resizable(false)
                .always_on_top(true)
                .center()
                .inner_size(520.0, 360.0)
                .build();

            if let Some(main_window) = app.get_webview_window("main") {
                let _ = main_window.hide();
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // User commands
            commands::get_user,
            commands::get_users,
            commands::set_current_user,
            commands::clear_current_user,
            commands::create_user,
            commands::update_user,
            commands::delete_user,
            // Session commands
            commands::create_focus_session,
            commands::get_focus_sessions,
            commands::get_daily_stats,
            commands::get_heatmap_data,
            commands::get_user_stats,
            // Task commands
            commands::create_task,
            commands::get_tasks,
            commands::update_task,
            commands::delete_task,
            commands::toggle_task_completion,
            // Achievement commands
            commands::get_achievements,
            commands::get_unseen_achievements_count,
            commands::mark_achievements_seen,
            commands::unlock_achievement,
            commands::check_and_unlock_achievements,
            // Settings commands
            commands::get_setting,
            commands::set_setting,
            commands::get_all_settings,
            commands::delete_setting,
            // Data export commands
            commands::export_all_data,
            commands::import_data,
            // App lifecycle commands
            commands::close_splashscreen,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
