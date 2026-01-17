use serde::{Deserialize, Serialize};

/// Task category enum
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TaskCategory {
    #[serde(rename = "To Do")]
    ToDo,
    #[serde(rename = "Event")]
    Event,
    #[serde(rename = "Reminder")]
    Reminder,
}

impl TaskCategory {
    pub fn as_str(&self) -> &'static str {
        match self {
            TaskCategory::ToDo => "To Do",
            TaskCategory::Event => "Event",
            TaskCategory::Reminder => "Reminder",
        }
    }
    
    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "To Do" => Some(TaskCategory::ToDo),
            "Event" => Some(TaskCategory::Event),
            "Reminder" => Some(TaskCategory::Reminder),
            _ => None,
        }
    }
}

/// Task model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub user_id: String,
    pub title: String,
    pub category: TaskCategory,
    pub date: String,         // YYYY-MM-DD format
    pub start_time: String,   // HH:MM format
    pub end_time: String,     // HH:MM format
    pub completed: bool,
    pub created_at: String,
}

/// Create task request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTaskRequest {
    pub user_id: String,
    pub title: String,
    pub category: TaskCategory,
    pub date: String,
    pub start_time: String,
    pub end_time: String,
}

/// Update task request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateTaskRequest {
    pub title: Option<String>,
    pub category: Option<TaskCategory>,
    pub date: Option<String>,
    pub start_time: Option<String>,
    pub end_time: Option<String>,
    pub completed: Option<bool>,
}
