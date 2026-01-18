use rusqlite::{params, Connection, OptionalExtension, Result};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

/// Get the path to the database file
pub fn get_db_path(app_handle: &AppHandle) -> PathBuf {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    
    // Create the directory if it doesn't exist
    fs::create_dir_all(&app_dir).expect("Failed to create app data directory");
    
    app_dir.join("flow.db")
}

/// Initialize the database with schema
pub fn init_database(db_path: &PathBuf) -> Result<Connection> {
    let conn = Connection::open(db_path)?;
    
    // Enable foreign keys
    conn.execute_batch("PRAGMA foreign_keys = ON;")?;
    
    // Run migrations
    run_migrations(&conn)?;
    
    Ok(conn)
}

/// Run database migrations
fn run_migrations(conn: &Connection) -> Result<()> {
    // Create migration tracking table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
        [],
    )?;
    
    let migrations: Vec<(&str, &str)> = vec![
        ("001_initial", include_str!("../../migrations/001_initial.sql")),
        ("002_add_avatar_path", include_str!("../../migrations/002_add_avatar_path.sql")),
        ("003_add_achievement_seen_at", include_str!("../../migrations/003_add_achievement_seen_at.sql")),
    ];

    for (name, sql) in migrations {
        let migration_exists: bool = conn.query_row(
            "SELECT EXISTS(SELECT 1 FROM _migrations WHERE name = ?1)",
            params![name],
            |row| row.get(0),
        )?;

        if migration_exists {
            continue;
        }

        if name == "002_add_avatar_path" && has_column(conn, "users", "avatar_path")? {
            conn.execute(
                "INSERT INTO _migrations (name) VALUES (?1)",
                params![name],
            )?;
            continue;
        }

        if name == "003_add_achievement_seen_at" && has_column(conn, "achievements", "seen_at")? {
            conn.execute(
                "INSERT INTO _migrations (name) VALUES (?1)",
                params![name],
            )?;
            continue;
        }

        conn.execute_batch(sql)?;
        conn.execute(
            "INSERT INTO _migrations (name) VALUES (?1)",
            params![name],
        )?;
    }
    
    Ok(())
}

fn has_column(conn: &Connection, table: &str, column: &str) -> Result<bool> {
    let query = format!(
        "SELECT 1 FROM pragma_table_info('{}') WHERE name = ?1 LIMIT 1",
        table.replace('\'', "''")
    );
    let exists: Option<i32> = conn
        .query_row(&query, params![column], |row| row.get(0))
        .optional()?;
    Ok(exists.is_some())
}

/// Database connection wrapper for thread-safe access
use std::sync::Mutex;

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: &PathBuf) -> Result<Self> {
        let conn = init_database(db_path)?;
        Ok(Self {
            conn: Mutex::new(conn),
        })
    }
}
