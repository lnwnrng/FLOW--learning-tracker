use crate::db::Database;
use crate::models::{CreateFocusSessionRequest, DailyStats, FocusSession, HeatmapData, UserStats};
use rusqlite::params;
use tauri::State;
use uuid::Uuid;

/// Create a new focus session
#[tauri::command]
pub fn create_focus_session(
    db: State<Database>,
    request: CreateFocusSessionRequest,
) -> Result<FocusSession, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO focus_sessions (id, user_id, duration_seconds, started_at, ended_at, category, notes, created_at) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            id,
            request.user_id,
            request.duration_seconds,
            request.started_at,
            request.ended_at,
            request.category,
            request.notes,
            now
        ],
    )
    .map_err(|e| e.to_string())?;

    // Update daily stats
    let session_date = &request.started_at[..10]; // Extract YYYY-MM-DD
    update_daily_stats(&conn, &request.user_id, session_date, request.duration_seconds)?;

    let session = FocusSession {
        id,
        user_id: request.user_id,
        duration_seconds: request.duration_seconds,
        started_at: request.started_at,
        ended_at: request.ended_at,
        category: request.category,
        notes: request.notes,
        created_at: now,
    };

    Ok(session)
}

/// Update daily stats when a session is created
fn update_daily_stats(
    conn: &rusqlite::Connection,
    user_id: &str,
    date: &str,
    duration_seconds: i64,
) -> Result<(), String> {
    let stats_id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();

    conn.execute(
        "INSERT INTO daily_stats (id, user_id, date, total_focus_seconds, session_count, created_at) 
         VALUES (?1, ?2, ?3, ?4, 1, ?5)
         ON CONFLICT(user_id, date) DO UPDATE SET 
         total_focus_seconds = total_focus_seconds + ?4,
         session_count = session_count + 1",
        params![stats_id, user_id, date, duration_seconds, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Get focus sessions for a user
#[tauri::command]
pub fn get_focus_sessions(
    db: State<Database>,
    user_id: String,
    limit: Option<i64>,
) -> Result<Vec<FocusSession>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(100);

    let mut stmt = conn
        .prepare(
            "SELECT id, user_id, duration_seconds, started_at, ended_at, category, notes, created_at 
             FROM focus_sessions 
             WHERE user_id = ?1 
             ORDER BY started_at DESC 
             LIMIT ?2",
        )
        .map_err(|e| e.to_string())?;

    let sessions = stmt
        .query_map(params![user_id, limit], |row| {
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

    Ok(sessions)
}

/// Get daily stats for a date range
#[tauri::command]
pub fn get_daily_stats(
    db: State<Database>,
    user_id: String,
    start_date: String,
    end_date: String,
) -> Result<Vec<DailyStats>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT date, total_focus_seconds, session_count 
             FROM daily_stats 
             WHERE user_id = ?1 AND date >= ?2 AND date <= ?3 
             ORDER BY date ASC",
        )
        .map_err(|e| e.to_string())?;

    let stats = stmt
        .query_map(params![user_id, start_date, end_date], |row| {
            Ok(DailyStats {
                date: row.get(0)?,
                total_focus_seconds: row.get(1)?,
                session_count: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(stats)
}

/// Get heatmap data for the past year
#[tauri::command]
pub fn get_heatmap_data(db: State<Database>, user_id: String) -> Result<Vec<HeatmapData>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Get data for the past 365 days
    let mut stmt = conn
        .prepare(
            "SELECT date, total_focus_seconds / 60 as minutes 
             FROM daily_stats 
             WHERE user_id = ?1 AND date >= date('now', '-365 days') 
             ORDER BY date ASC",
        )
        .map_err(|e| e.to_string())?;

    let data = stmt
        .query_map(params![user_id], |row| {
            Ok(HeatmapData {
                date: row.get(0)?,
                value: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(data)
}

/// Get user statistics summary
#[tauri::command]
pub fn get_user_stats(db: State<Database>, user_id: String) -> Result<UserStats, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Total focus time and sessions
    let (total_focus_time, total_sessions): (i64, i64) = conn
        .query_row(
            "SELECT COALESCE(SUM(duration_seconds), 0), COUNT(*) FROM focus_sessions WHERE user_id = ?1",
            params![user_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| e.to_string())?;

    // Tasks completed
    let tasks_completed: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM tasks WHERE user_id = ?1 AND completed = 1",
            params![user_id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // Current streak calculation
    let current_streak = calculate_current_streak(&conn, &user_id)?;
    let longest_streak = calculate_longest_streak(&conn, &user_id)?;

    Ok(UserStats {
        total_focus_time,
        total_sessions,
        current_streak,
        longest_streak,
        tasks_completed,
    })
}

/// Calculate current streak (consecutive days with sessions)
fn calculate_current_streak(conn: &rusqlite::Connection, user_id: &str) -> Result<i64, String> {
    let dates: Vec<String> = {
        let mut stmt = conn
            .prepare(
                "SELECT DISTINCT date FROM daily_stats 
                 WHERE user_id = ?1 AND total_focus_seconds > 0 
                 ORDER BY date DESC",
            )
            .map_err(|e| e.to_string())?;

        let result = stmt.query_map(params![user_id], |row| row.get(0))
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;
        result
    };

    if dates.is_empty() {
        return Ok(0);
    }

    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let yesterday = (chrono::Utc::now() - chrono::Duration::days(1))
        .format("%Y-%m-%d")
        .to_string();

    // Streak must include today or yesterday
    if dates[0] != today && dates[0] != yesterday {
        return Ok(0);
    }

    let mut streak = 1i64;
    for i in 1..dates.len() {
        let prev_date =
            chrono::NaiveDate::parse_from_str(&dates[i - 1], "%Y-%m-%d").map_err(|e| e.to_string())?;
        let curr_date =
            chrono::NaiveDate::parse_from_str(&dates[i], "%Y-%m-%d").map_err(|e| e.to_string())?;

        if prev_date - curr_date == chrono::Duration::days(1) {
            streak += 1;
        } else {
            break;
        }
    }

    Ok(streak)
}

/// Calculate longest streak
fn calculate_longest_streak(conn: &rusqlite::Connection, user_id: &str) -> Result<i64, String> {
    let dates: Vec<String> = {
        let mut stmt = conn
            .prepare(
                "SELECT DISTINCT date FROM daily_stats 
                 WHERE user_id = ?1 AND total_focus_seconds > 0 
                 ORDER BY date ASC",
            )
            .map_err(|e| e.to_string())?;

        let result = stmt.query_map(params![user_id], |row| row.get(0))
            .map_err(|e| e.to_string())?
            .collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?;
        result
    };

    if dates.is_empty() {
        return Ok(0);
    }

    let mut longest = 1i64;
    let mut current = 1i64;

    for i in 1..dates.len() {
        let prev_date =
            chrono::NaiveDate::parse_from_str(&dates[i - 1], "%Y-%m-%d").map_err(|e| e.to_string())?;
        let curr_date =
            chrono::NaiveDate::parse_from_str(&dates[i], "%Y-%m-%d").map_err(|e| e.to_string())?;

        if curr_date - prev_date == chrono::Duration::days(1) {
            current += 1;
            if current > longest {
                longest = current;
            }
        } else {
            current = 1;
        }
    }

    Ok(longest)
}
