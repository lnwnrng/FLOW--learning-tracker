use serde::{Deserialize, Serialize};

/// Achievement type enum
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum AchievementType {
    #[serde(rename = "first_session")]
    FirstSession,
    #[serde(rename = "hour_master")]
    HourMaster,
    #[serde(rename = "streak_week")]
    StreakWeek,
    #[serde(rename = "streak_month")]
    StreakMonth,
    #[serde(rename = "total_hours_10")]
    TotalHours10,
    #[serde(rename = "total_hours_50")]
    TotalHours50,
    #[serde(rename = "total_hours_100")]
    TotalHours100,
    #[serde(rename = "early_bird")]
    EarlyBird,
    #[serde(rename = "night_owl")]
    NightOwl,
    #[serde(rename = "task_master")]
    TaskMaster,
}

impl AchievementType {
    pub fn as_str(&self) -> &'static str {
        match self {
            AchievementType::FirstSession => "first_session",
            AchievementType::HourMaster => "hour_master",
            AchievementType::StreakWeek => "streak_week",
            AchievementType::StreakMonth => "streak_month",
            AchievementType::TotalHours10 => "total_hours_10",
            AchievementType::TotalHours50 => "total_hours_50",
            AchievementType::TotalHours100 => "total_hours_100",
            AchievementType::EarlyBird => "early_bird",
            AchievementType::NightOwl => "night_owl",
            AchievementType::TaskMaster => "task_master",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "first_session" => Some(AchievementType::FirstSession),
            "hour_master" => Some(AchievementType::HourMaster),
            "streak_week" => Some(AchievementType::StreakWeek),
            "streak_month" => Some(AchievementType::StreakMonth),
            "total_hours_10" => Some(AchievementType::TotalHours10),
            "total_hours_50" => Some(AchievementType::TotalHours50),
            "total_hours_100" => Some(AchievementType::TotalHours100),
            "early_bird" => Some(AchievementType::EarlyBird),
            "night_owl" => Some(AchievementType::NightOwl),
            "task_master" => Some(AchievementType::TaskMaster),
            _ => None,
        }
    }

    pub fn display_name(&self) -> &'static str {
        match self {
            AchievementType::FirstSession => "First Focus",
            AchievementType::HourMaster => "Hour Master",
            AchievementType::StreakWeek => "Week Warrior",
            AchievementType::StreakMonth => "Monthly Champion",
            AchievementType::TotalHours10 => "10 Hours Club",
            AchievementType::TotalHours50 => "50 Hours Legend",
            AchievementType::TotalHours100 => "Century Master",
            AchievementType::EarlyBird => "Early Bird",
            AchievementType::NightOwl => "Night Owl",
            AchievementType::TaskMaster => "Task Master",
        }
    }

    pub fn description(&self) -> &'static str {
        match self {
            AchievementType::FirstSession => "Complete your first focus session",
            AchievementType::HourMaster => "Complete a single session over 1 hour",
            AchievementType::StreakWeek => "Maintain a 7-day streak",
            AchievementType::StreakMonth => "Maintain a 30-day streak",
            AchievementType::TotalHours10 => "Accumulate 10 hours of focus time",
            AchievementType::TotalHours50 => "Accumulate 50 hours of focus time",
            AchievementType::TotalHours100 => "Accumulate 100 hours of focus time",
            AchievementType::EarlyBird => "Start a session before 6 AM",
            AchievementType::NightOwl => "Complete a session after 11 PM",
            AchievementType::TaskMaster => "Complete 50 tasks",
        }
    }
}

/// Achievement model
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Achievement {
    pub id: String,
    pub user_id: String,
    pub achievement_type: AchievementType,
    pub unlocked_at: String,
    pub metadata: Option<String>,
}

/// Achievement info for display
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AchievementInfo {
    pub achievement_type: AchievementType,
    pub name: String,
    pub description: String,
    pub unlocked: bool,
    pub unlocked_at: Option<String>,
}
