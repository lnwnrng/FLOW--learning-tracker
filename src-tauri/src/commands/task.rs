use crate::db::Database;
use crate::models::{CreateTaskRequest, Task, TaskCategory, UpdateTaskRequest};
use rusqlite::params;
use tauri::State;
use uuid::Uuid;

/// Create a new task
#[tauri::command]
pub fn create_task(db: State<Database>, request: CreateTaskRequest) -> Result<Task, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO tasks (id, user_id, title, category, date, start_time, end_time, completed, created_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 0, ?8)",
        params![
            id,
            request.user_id,
            request.title,
            request.category.as_str(),
            request.date,
            request.start_time,
            request.end_time,
            now
        ],
    )
    .map_err(|e| e.to_string())?;

    let task = Task {
        id,
        user_id: request.user_id,
        title: request.title,
        category: request.category,
        date: request.date,
        start_time: request.start_time,
        end_time: request.end_time,
        completed: false,
        created_at: now,
    };

    Ok(task)
}

/// Get tasks for a user, optionally filtered by date
#[tauri::command]
pub fn get_tasks(
    db: State<Database>,
    user_id: String,
    date: Option<String>,
) -> Result<Vec<Task>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let tasks: Vec<Task> = if let Some(ref filter_date) = date {
        let mut stmt = conn
            .prepare(
                "SELECT id, user_id, title, category, date, start_time, end_time, completed, created_at 
                 FROM tasks 
                 WHERE user_id = ?1 AND date = ?2 
                 ORDER BY start_time ASC",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt.query_map(params![user_id, filter_date], |row| {
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
        .map_err(|e| e.to_string())?;
        
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?
    } else {
        let mut stmt = conn
            .prepare(
                "SELECT id, user_id, title, category, date, start_time, end_time, completed, created_at 
                 FROM tasks 
                 WHERE user_id = ?1 
                 ORDER BY date DESC, start_time ASC",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt.query_map(params![user_id], |row| {
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
        .map_err(|e| e.to_string())?;
        
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?
    };

    Ok(tasks)
}

/// Update a task
#[tauri::command]
pub fn update_task(
    db: State<Database>,
    task_id: String,
    request: UpdateTaskRequest,
) -> Result<Task, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Build dynamic update query
    let mut updates = Vec::new();
    let mut param_idx = 1;

    if request.title.is_some() {
        updates.push(format!("title = ?{}", param_idx));
        param_idx += 1;
    }
    if request.category.is_some() {
        updates.push(format!("category = ?{}", param_idx));
        param_idx += 1;
    }
    if request.date.is_some() {
        updates.push(format!("date = ?{}", param_idx));
        param_idx += 1;
    }
    if request.start_time.is_some() {
        updates.push(format!("start_time = ?{}", param_idx));
        param_idx += 1;
    }
    if request.end_time.is_some() {
        updates.push(format!("end_time = ?{}", param_idx));
        param_idx += 1;
    }
    if request.completed.is_some() {
        updates.push(format!("completed = ?{}", param_idx));
        param_idx += 1;
    }

    if updates.is_empty() {
        return get_task_by_id(&conn, &task_id);
    }

    let query = format!(
        "UPDATE tasks SET {} WHERE id = ?{}",
        updates.join(", "),
        param_idx
    );

    // Build params vector
    let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(ref title) = request.title {
        params_vec.push(Box::new(title.clone()));
    }
    if let Some(ref category) = request.category {
        params_vec.push(Box::new(category.as_str().to_string()));
    }
    if let Some(ref date) = request.date {
        params_vec.push(Box::new(date.clone()));
    }
    if let Some(ref start_time) = request.start_time {
        params_vec.push(Box::new(start_time.clone()));
    }
    if let Some(ref end_time) = request.end_time {
        params_vec.push(Box::new(end_time.clone()));
    }
    if let Some(completed) = request.completed {
        params_vec.push(Box::new(if completed { 1 } else { 0 }));
    }
    params_vec.push(Box::new(task_id.clone()));

    let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

    conn.execute(&query, params_refs.as_slice())
        .map_err(|e| e.to_string())?;

    get_task_by_id(&conn, &task_id)
}

/// Delete a task
#[tauri::command]
pub fn delete_task(db: State<Database>, task_id: String) -> Result<(), String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM tasks WHERE id = ?1", params![task_id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Toggle task completion status
#[tauri::command]
pub fn toggle_task_completion(db: State<Database>, task_id: String) -> Result<Task, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Get current completion status
    let current_completed: i32 = conn
        .query_row(
            "SELECT completed FROM tasks WHERE id = ?1",
            params![task_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // Toggle the status
    let new_completed = if current_completed == 1 { 0 } else { 1 };

    conn.execute(
        "UPDATE tasks SET completed = ?1 WHERE id = ?2",
        params![new_completed, task_id],
    )
    .map_err(|e| e.to_string())?;

    get_task_by_id(&conn, &task_id)
}

/// Helper function to get a task by ID
fn get_task_by_id(conn: &rusqlite::Connection, task_id: &str) -> Result<Task, String> {
    conn.query_row(
        "SELECT id, user_id, title, category, date, start_time, end_time, completed, created_at 
         FROM tasks WHERE id = ?1",
        params![task_id],
        |row| {
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
        },
    )
    .map_err(|e| e.to_string())
}
