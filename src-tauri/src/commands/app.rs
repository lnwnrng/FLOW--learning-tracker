use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn close_splashscreen(app: AppHandle) -> Result<(), String> {
    if let Some(main_window) = app.get_webview_window("main") {
        let _ = main_window.show();
        let _ = main_window.set_focus();
    }

    if let Some(splash) = app.get_webview_window("splashscreen") {
        let _ = splash.close();
    }

    Ok(())
}
