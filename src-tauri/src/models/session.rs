use serde::{Deserialize, Serialize};

/// Focus session model
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FocusSession {
    pub id: String,
    pub user_id: String,
    pub duration_seconds: i64,
    pub started_at: String,
    pub ended_at: String,
    pub category: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
}

/// Create focus session request
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateFocusSessionRequest {
    pub user_id: String,
    pub duration_seconds: i64,
    pub started_at: String,
    pub ended_at: String,
    pub category: Option<String>,
    pub notes: Option<String>,
}

/// Daily stats model
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyStats {
    pub date: String,
    pub total_focus_seconds: i64,
    pub session_count: i64,
}

/// User statistics summary
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserStats {
    pub total_focus_time: i64,    // in seconds
    pub total_sessions: i64,
    pub current_streak: i64,
    pub longest_streak: i64,
    pub tasks_completed: i64,
}

/// Heatmap data point
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct HeatmapData {
    pub date: String,
    pub value: i64,  // focus time in minutes
}
