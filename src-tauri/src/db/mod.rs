use rusqlite::{Connection, Result};
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
    
    // Check if initial migration has been applied
    let migration_exists: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM _migrations WHERE name = '001_initial')",
        [],
        |row| row.get(0),
    )?;
    
    if !migration_exists {
        // Run initial migration
        let migration_sql = include_str!("../../migrations/001_initial.sql");
        conn.execute_batch(migration_sql)?;
        
        // Record migration
        conn.execute(
            "INSERT INTO _migrations (name) VALUES ('001_initial')",
            [],
        )?;
    }
    
    Ok(())
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
