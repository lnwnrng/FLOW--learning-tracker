use crate::db::Database;
use rusqlite::params;
use std::collections::HashMap;
use tauri::State;
use uuid::Uuid;

/// Get a single setting value
#[tauri::command]
pub fn get_setting(
    db: State<Database>,
    user_id: String,
    key: String,
) -> Result<Option<String>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let value: Option<String> = conn
        .query_row(
            "SELECT value FROM user_settings WHERE user_id = ?1 AND key = ?2",
            params![user_id, key],
            |row| row.get(0),
        )
        .ok();

    Ok(value)
}

/// Set a setting value
#[tauri::command]
pub fn set_setting(
    db: State<Database>,
    user_id: String,
    key: String,
    value: String,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();

    conn.execute(
        "INSERT INTO user_settings (id, user_id, key, value) VALUES (?1, ?2, ?3, ?4)
         ON CONFLICT(user_id, key) DO UPDATE SET value = ?4",
        params![id, user_id, key, value],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Get all settings for a user
#[tauri::command]
pub fn get_all_settings(
    db: State<Database>,
    user_id: String,
) -> Result<HashMap<String, String>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT key, value FROM user_settings WHERE user_id = ?1")
        .map_err(|e| e.to_string())?;

    let settings: HashMap<String, String> = stmt
        .query_map(params![user_id], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(settings)
}

/// Delete a setting
#[tauri::command]
pub fn delete_setting(
    db: State<Database>,
    user_id: String,
    key: String,
) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM user_settings WHERE user_id = ?1 AND key = ?2",
        params![user_id, key],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
