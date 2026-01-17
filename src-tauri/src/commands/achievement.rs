use crate::db::Database;
use crate::models::{Achievement, AchievementInfo, AchievementType};
use rusqlite::params;
use tauri::State;
use uuid::Uuid;

/// Get all achievements for a user (including locked ones)
#[tauri::command]
pub fn get_achievements(db: State<Database>, user_id: String) -> Result<Vec<AchievementInfo>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    // Get unlocked achievements
    let mut stmt = conn
        .prepare(
            "SELECT achievement_type, unlocked_at FROM achievements WHERE user_id = ?1",
        )
        .map_err(|e| e.to_string())?;

    let unlocked: std::collections::HashMap<String, String> = stmt
        .query_map(params![user_id], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    // Build full achievement list
    let all_types = vec![
        AchievementType::FirstSession,
        AchievementType::HourMaster,
        AchievementType::StreakWeek,
        AchievementType::StreakMonth,
        AchievementType::TotalHours10,
        AchievementType::TotalHours50,
        AchievementType::TotalHours100,
        AchievementType::EarlyBird,
        AchievementType::NightOwl,
        AchievementType::TaskMaster,
    ];

    let achievements: Vec<AchievementInfo> = all_types
        .into_iter()
        .map(|t| {
            let type_str = t.as_str().to_string();
            let unlocked_at = unlocked.get(&type_str).cloned();
            AchievementInfo {
                achievement_type: t.clone(),
                name: t.display_name().to_string(),
                description: t.description().to_string(),
                unlocked: unlocked_at.is_some(),
                unlocked_at,
            }
        })
        .collect();

    Ok(achievements)
}

/// Unlock a specific achievement
#[tauri::command]
pub fn unlock_achievement(
    db: State<Database>,
    user_id: String,
    achievement_type: AchievementType,
) -> Result<Achievement, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;

    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let type_str = achievement_type.as_str();

    // Check if already unlocked
    let exists: bool = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = ?1 AND achievement_type = ?2)",
            params![user_id, type_str],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if exists {
        return Err("Achievement already unlocked".to_string());
    }

    conn.execute(
        "INSERT INTO achievements (id, user_id, achievement_type, unlocked_at) VALUES (?1, ?2, ?3, ?4)",
        params![id, user_id, type_str, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Achievement {
        id,
        user_id,
        achievement_type,
        unlocked_at: now,
        metadata: None,
    })
}

/// Check and unlock achievements based on current user stats
#[tauri::command]
pub fn check_and_unlock_achievements(
    db: State<Database>,
    user_id: String,
) -> Result<Vec<Achievement>, String> {
    let conn = db.conn.lock().map_err(|e| e.to_string())?;
    let mut newly_unlocked = Vec::new();

    // Get user stats
    let (total_focus_time, total_sessions): (i64, i64) = conn
        .query_row(
            "SELECT COALESCE(SUM(duration_seconds), 0), COUNT(*) FROM focus_sessions WHERE user_id = ?1",
            params![user_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .unwrap_or((0, 0));

    let tasks_completed: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM tasks WHERE user_id = ?1 AND completed = 1",
            params![user_id],
            |row| row.get(0),
        )
        .unwrap_or(0);

    // Get current streak
    let current_streak = calculate_current_streak(&conn, &user_id).unwrap_or(0);

    // Get max session duration
    let max_session_duration: i64 = conn
        .query_row(
            "SELECT COALESCE(MAX(duration_seconds), 0) FROM focus_sessions WHERE user_id = ?1",
            params![user_id],
            |row| row.get(0),
        )
        .unwrap_or(0);

    // Check each achievement
    let checks: Vec<(AchievementType, bool)> = vec![
        (AchievementType::FirstSession, total_sessions >= 1),
        (AchievementType::HourMaster, max_session_duration >= 3600),
        (AchievementType::StreakWeek, current_streak >= 7),
        (AchievementType::StreakMonth, current_streak >= 30),
        (AchievementType::TotalHours10, total_focus_time >= 36000),
        (AchievementType::TotalHours50, total_focus_time >= 180000),
        (AchievementType::TotalHours100, total_focus_time >= 360000),
        (AchievementType::TaskMaster, tasks_completed >= 50),
    ];

    for (achievement_type, condition) in checks {
        if condition && !is_achievement_unlocked(&conn, &user_id, &achievement_type)? {
            if let Ok(achievement) = unlock_achievement_internal(&conn, &user_id, achievement_type) {
                newly_unlocked.push(achievement);
            }
        }
    }

    Ok(newly_unlocked)
}

/// Check if an achievement is already unlocked
fn is_achievement_unlocked(
    conn: &rusqlite::Connection,
    user_id: &str,
    achievement_type: &AchievementType,
) -> Result<bool, String> {
    let type_str = achievement_type.as_str();
    conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM achievements WHERE user_id = ?1 AND achievement_type = ?2)",
        params![user_id, type_str],
        |row| row.get(0),
    )
    .map_err(|e| e.to_string())
}

/// Internal function to unlock an achievement
fn unlock_achievement_internal(
    conn: &rusqlite::Connection,
    user_id: &str,
    achievement_type: AchievementType,
) -> Result<Achievement, String> {
    let id = Uuid::new_v4().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S").to_string();
    let type_str = achievement_type.as_str();

    conn.execute(
        "INSERT INTO achievements (id, user_id, achievement_type, unlocked_at) VALUES (?1, ?2, ?3, ?4)",
        params![id, user_id, type_str, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Achievement {
        id,
        user_id: user_id.to_string(),
        achievement_type,
        unlocked_at: now,
        metadata: None,
    })
}

/// Calculate current streak (reused logic from session.rs)
fn calculate_current_streak(conn: &rusqlite::Connection, user_id: &str) -> Result<i64, String> {
    let dates: Vec<String> = {
        let mut stmt = conn
            .prepare(
                "SELECT DISTINCT date FROM daily_stats 
                 WHERE user_id = ?1 AND total_focus_seconds > 0 
                 ORDER BY date DESC",
            )
            .map_err(|e| e.to_string())?;

        let rows = stmt.query_map(params![user_id], |row| row.get(0))
            .map_err(|e| e.to_string())?;
        
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|e| e.to_string())?
    };

    if dates.is_empty() {
        return Ok(0);
    }

    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();
    let yesterday = (chrono::Utc::now() - chrono::Duration::days(1))
        .format("%Y-%m-%d")
        .to_string();

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
