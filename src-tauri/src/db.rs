use rusqlite::OptionalExtension;
use rusqlite::{Connection, Result};

pub fn init_db(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        r#"
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            notes TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            due_date TEXT,
            start_date TEXT,
            completed_at TEXT,
            project_id TEXT,
            section_id TEXT,
            parent_task_id TEXT,
            priority TEXT NOT NULL,
            status TEXT NOT NULL,
            repeat_rule TEXT,
            order_index REAL NOT NULL,
            deleted INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            color TEXT,
            icon TEXT,
            order_index REAL NOT NULL,
            is_inbox INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            deleted INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS sections (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            order_index REAL NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            deleted INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS tags (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            color TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            deleted INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS task_tags (
            task_id TEXT NOT NULL,
            tag_id TEXT NOT NULL,
            PRIMARY KEY (task_id, tag_id)
        );

        CREATE TABLE IF NOT EXISTS reminders (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL,
            at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            cancelled_at TEXT,
            deleted INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS metadata (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        "#,
    )?;
    Ok(())
}

pub fn get_db_connection(path: &str) -> Result<Connection> {
    let conn = Connection::open(path)?;
    init_db(&conn)?;
    Ok(conn)
}

pub fn get_current_version(conn: &Connection) -> Result<i64> {
    let mut stmt = conn.prepare("SELECT value FROM metadata WHERE key = 'version'")?;
    let version: Option<String> = stmt.query_row([], |row| row.get(0)).optional()?;
    Ok(version.and_then(|v| v.parse::<i64>().ok()).unwrap_or(0))
}

pub fn set_version(conn: &Connection, version: i64) -> Result<()> {
    conn.execute(
        "INSERT INTO metadata(key, value) VALUES('version', ?1)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [version.to_string()],
    )?;
    Ok(())
}

pub fn get_snapshot_json(conn: &Connection) -> Result<Option<String>> {
    let mut stmt = conn.prepare("SELECT value FROM metadata WHERE key = 'snapshot'")?;
    let snapshot: Option<String> = stmt.query_row([], |row| row.get(0)).optional()?;
    Ok(snapshot)
}

pub fn set_snapshot_json(conn: &Connection, json: &str) -> Result<()> {
    conn.execute(
        "INSERT INTO metadata(key, value) VALUES('snapshot', ?1)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [json.to_string()],
    )?;
    Ok(())
}
