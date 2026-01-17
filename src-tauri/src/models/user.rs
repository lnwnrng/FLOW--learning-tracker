use serde::{Deserialize, Serialize};

/// User model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: Option<String>,
    pub avatar_path: Option<String>,
    pub join_date: String,
    pub is_premium: bool,
    pub created_at: String,
    pub updated_at: String,
}

/// Create user request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUserRequest {
    pub name: String,
    pub email: Option<String>,
}

/// Update user request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateUserRequest {
    pub name: Option<String>,
    pub email: Option<String>,
    pub avatar_path: Option<String>,
    pub is_premium: Option<bool>,
}
