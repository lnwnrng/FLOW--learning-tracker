use crate::db::Database;
use crate::models::{Achievement, AchievementType, FocusSession, Task, TaskCategory, User};
use rusqlite::params;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::State;

/// Export data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExportData {
    pub version: String,
    pub exported_at: String,
    pub user: User,
    pub focus_sessions: Vec<FocusSession>,
    pub tasks: Vec<Task>,
    pub achievements: Vec<Achievement>,
    pub settings: HashMap<String, String>,
}

/// Import result
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImportResult {
    pub success: bool,
    pub sessions_imported: i64,
    pub tasks_imported: i64,
    pub achievements_imported: i64,
    pub settings_imported: i64,
    pub message: String,
}

/// Export all user data as JSON
#[tauri::command]
pub fn export_all_data(db: State<Database>, user_id: String) -> Result<ExportData, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    // Get user
    let user: User = conn
        .query_row(
            "SELECT id, name, email, avatar_path, join_date, is_premium, created_at, updated_at 
             FROM users WHERE id = ?1",
            params![user_id],
            |row| {
                Ok(User {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    email: row.get(2)?,
                    avatar_path: row.get(3)?,
                    join_date: row.get(4)?,
                    is_premium: row.get::<_, i32>(5)? == 1,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        )
        .map_err(|e| format!("User not found: {}", e))?;

    // Get focus sessions
    let mut stmt = conn
        .prepare(
            "SELECT id, user_id, duration_seconds, started_at, ended_at, category, notes, created_at 
             FROM focus_sessions WHERE user_id = ?1 ORDER BY started_at",
        )
        .map_err(|e| e.to_string())?;

    let focus_sessions: Vec<FocusSession> = stmt
        .query_map(params![user_id], |row| {
            Ok(FocusSession {
                id: row.get(0)?,
                user_id: row.get(1)?,
                duration_seconds: row.get(2)?,
                started_at: row.get(3)?,
                ended_at: row.get(4)?,
                category: row.get(5)?,
                notes: row.get(6)?,
                created_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    // Get tasks
    let mut stmt = conn
        .prepare(
            "SELECT id, user_id, title, category, date, start_time, end_time, completed, created_at 
             FROM tasks WHERE user_id = ?1 ORDER BY date, start_time",
        )
        .map_err(|e| e.to_string())?;

    let tasks: Vec<Task> = stmt
        .query_map(params![user_id], |row| {
            let category_str: String = row.get(3)?;
            Ok(Task {
                id: row.get(0)?,
                user_id: row.get(1)?,
                title: row.get(2)?,
                category: TaskCategory::from_str(&category_str).unwrap_or(TaskCategory::ToDo),
                date: row.get(4)?,
                start_time: row.get(5)?,
                end_time: row.get(6)?,
                completed: row.get::<_, i32>(7)? == 1,
                created_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    // Get achievements
    let mut stmt = conn
        .prepare(
            "SELECT id, user_id, achievement_type, unlocked_at, metadata 
             FROM achievements WHERE user_id = ?1",
        )
        .map_err(|e| e.to_string())?;

    let achievements: Vec<Achievement> = stmt
        .query_map(params![user_id], |row| {
            let type_str: String = row.get(2)?;
            Ok(Achievement {
                id: row.get(0)?,
                user_id: row.get(1)?,
                achievement_type: AchievementType::from_str(&type_str)
                    .unwrap_or(AchievementType::FirstSession),
                unlocked_at: row.get(3)?,
                metadata: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    // Get settings
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

    Ok(ExportData {
        version: "1.0".to_string(),
        exported_at: now,
        user,
        focus_sessions,
        tasks,
        achievements,
        settings,
    })
}

/// Import data from JSON
#[tauri::command]
pub fn import_data(db: State<Database>, data: ExportData) -> Result<ImportResult, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let mut sessions_imported = 0i64;
    let mut tasks_imported = 0i64;
    let mut achievements_imported = 0i64;
    let mut settings_imported = 0i64;

    let user_id = &data.user.id;

    // Check if user exists, create if not
    let user_exists: bool = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM users WHERE id = ?1)",
            params![user_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if !user_exists {
        let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
        conn.execute(
            "INSERT INTO users (id, name, email, avatar_path, join_date, is_premium, created_at, updated_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                user_id,
                data.user.name,
                data.user.email,
                data.user.avatar_path,
                data.user.join_date,
                if data.user.is_premium { 1 } else { 0 },
                now,
                now
            ],
        )
        .map_err(|e| e.to_string())?;
    }

    // Import focus sessions
    for session in &data.focus_sessions {
        let result = conn.execute(
            "INSERT OR IGNORE INTO focus_sessions (id, user_id, duration_seconds, started_at, ended_at, category, notes, created_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                session.id,
                user_id,
                session.duration_seconds,
                session.started_at,
                session.ended_at,
                session.category,
                session.notes,
                session.created_at
            ],
        );
        if result.is_ok() {
            sessions_imported += 1;
        }
    }

    // Import tasks
    for task in &data.tasks {
        let result = conn.execute(
            "INSERT OR IGNORE INTO tasks (id, user_id, title, category, date, start_time, end_time, completed, created_at) 
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                task.id,
                user_id,
                task.title,
                task.category.as_str(),
                task.date,
                task.start_time,
                task.end_time,
                if task.completed { 1 } else { 0 },
                task.created_at
            ],
        );
        if result.is_ok() {
            tasks_imported += 1;
        }
    }

    // Import achievements
    for achievement in &data.achievements {
        let result = conn.execute(
            "INSERT OR IGNORE INTO achievements (id, user_id, achievement_type, unlocked_at, metadata) 
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                achievement.id,
                user_id,
                achievement.achievement_type.as_str(),
                achievement.unlocked_at,
                achievement.metadata
            ],
        );
        if result.is_ok() {
            achievements_imported += 1;
        }
    }

    // Import settings
    for (key, value) in &data.settings {
        let id = uuid::Uuid::new_v4().to_string();
        let result = conn.execute(
            "INSERT INTO user_settings (id, user_id, key, value) VALUES (?1, ?2, ?3, ?4)
             ON CONFLICT(user_id, key) DO UPDATE SET value = ?4",
            params![id, user_id, key, value],
        );
        if result.is_ok() {
            settings_imported += 1;
        }
    }

    Ok(ImportResult {
        success: true,
        sessions_imported,
        tasks_imported,
        achievements_imported,
        settings_imported,
        message: format!(
            "Imported {} sessions, {} tasks, {} achievements, {} settings",
            sessions_imported, tasks_imported, achievements_imported, settings_imported
        ),
    })
}
