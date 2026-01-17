use crate::db::Database;
use crate::models::{CreateUserRequest, UpdateUserRequest, User};
use rusqlite::{params, OptionalExtension};
use tauri::State;
use uuid::Uuid;

/// Get the current user (singleton for this offline app)
#[tauri::command]
pub fn get_user(db: State<Database>) -> Result<Option<User>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare("SELECT id, name, email, avatar_path, join_date, is_premium, created_at, updated_at FROM users LIMIT 1")
        .map_err(|e| e.to_string())?;
    
    let user = stmt
        .query_row([], |row| {
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
        })
        .optional()
        .map_err(|e| e.to_string())?;
    
    Ok(user)
}

/// Create a new user
#[tauri::command]
pub fn create_user(db: State<Database>, request: CreateUserRequest) -> Result<User, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let join_date = chrono::Utc::now().format("%Y-%m-%d").to_string();
    
    conn.execute(
        "INSERT INTO users (id, name, email, join_date, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![id, request.name, request.email, join_date, now, now],
    )
    .map_err(|e| e.to_string())?;
    
    let user = User {
        id,
        name: request.name,
        email: request.email,
        avatar_path: None,
        join_date,
        is_premium: false,
        created_at: now.clone(),
        updated_at: now,
    };
    
    Ok(user)
}

/// Update user
#[tauri::command]
pub fn update_user(db: State<Database>, user_id: String, request: UpdateUserRequest) -> Result<User, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    
    // Build dynamic update query
    let mut updates = vec!["updated_at = ?1".to_string()];
    let mut param_idx = 2;
    
    if request.name.is_some() {
        updates.push(format!("name = ?{}", param_idx));
        param_idx += 1;
    }
    if request.email.is_some() {
        updates.push(format!("email = ?{}", param_idx));
        param_idx += 1;
    }
    if request.avatar_path.is_some() {
        updates.push(format!("avatar_path = ?{}", param_idx));
        param_idx += 1;
    }
    if request.is_premium.is_some() {
        updates.push(format!("is_premium = ?{}", param_idx));
    }
    
    let query = format!(
        "UPDATE users SET {} WHERE id = ?{}",
        updates.join(", "),
        param_idx
    );
    
    // Execute with dynamic params
    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(now.clone())];
    
    if let Some(ref name) = request.name {
        params_vec.push(Box::new(name.clone()));
    }
    if let Some(ref email) = request.email {
        params_vec.push(Box::new(email.clone()));
    }
    if let Some(ref avatar_path) = request.avatar_path {
        params_vec.push(Box::new(avatar_path.clone()));
    }
    if let Some(is_premium) = request.is_premium {
        params_vec.push(Box::new(if is_premium { 1 } else { 0 }));
    }
    params_vec.push(Box::new(user_id.clone()));
    
    let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();
    
    conn.execute(&query, params_refs.as_slice())
        .map_err(|e| e.to_string())?;
    
    // Return updated user
    get_user_by_id(&conn, &user_id)
}

fn get_user_by_id(conn: &rusqlite::Connection, user_id: &str) -> Result<User, String> {
    conn.query_row(
        "SELECT id, name, email, avatar_path, join_date, is_premium, created_at, updated_at FROM users WHERE id = ?1",
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
    .map_err(|e| e.to_string())
}

/// Delete user and all associated data (for logout/reset)
#[tauri::command]
pub fn delete_user(db: State<Database>, user_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    
    // Delete all associated data first (foreign key constraints)
    conn.execute("DELETE FROM focus_sessions WHERE user_id = ?1", params![user_id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks WHERE user_id = ?1", params![user_id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM user_achievements WHERE user_id = ?1", params![user_id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM user_settings WHERE user_id = ?1", params![user_id])
        .map_err(|e| e.to_string())?;
    
    // Delete the user
    conn.execute("DELETE FROM users WHERE id = ?1", params![user_id])
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
