#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod notifications;
mod sync;

use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri::State;
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

#[derive(Default)]
struct DbState {
    path: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct StateSnapshot {
    tasks: serde_json::Value,
    projects: serde_json::Value,
    tags: serde_json::Value,
    sections: serde_json::Value,
    reminders: serde_json::Value,
    version: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct ChangeSet {
    tasks: serde_json::Value,
    projects: serde_json::Value,
    tags: serde_json::Value,
    sections: serde_json::Value,
    reminders: serde_json::Value,
    new_version: i64,
}

fn open_connection(state: &DbState) -> rusqlite::Result<Connection> {
    let path = if state.path.is_empty() {
        "phitodo.db".to_string()
    } else {
        state.path.clone()
    };
    db::get_db_connection(&path)
}

#[tauri::command]
fn get_state_snapshot(state: State<DbState>, _since: Option<i64>) -> Result<StateSnapshot, String> {
    let conn = open_connection(&state).map_err(|e| e.to_string())?;
    let version = db::get_current_version(&conn).map_err(|e| e.to_string())?;
    let snapshot_json = db::get_snapshot_json(&conn).map_err(|e| e.to_string())?;
    if let Some(json) = snapshot_json {
        let mut snapshot: StateSnapshot = serde_json::from_str(&json).map_err(|e| e.to_string())?;
        snapshot.version = version;
        Ok(snapshot)
    } else {
        Ok(StateSnapshot {
            tasks: serde_json::json!([]),
            projects: serde_json::json!([]),
            tags: serde_json::json!([]),
            sections: serde_json::json!([]),
            reminders: serde_json::json!([]),
            version,
        })
    }
}

#[tauri::command]
fn apply_changes(state: State<DbState>, change_set: ChangeSet) -> Result<(), String> {
    let conn = open_connection(&state).map_err(|e| e.to_string())?;
    let snapshot = StateSnapshot {
        tasks: change_set.tasks,
        projects: change_set.projects,
        tags: change_set.tags,
        sections: change_set.sections,
        reminders: change_set.reminders,
        version: change_set.new_version,
    };
    let json = serde_json::to_string(&snapshot).map_err(|e| e.to_string())?;
    db::set_snapshot_json(&conn, &json).map_err(|e| e.to_string())?;
    db::set_version(&conn, change_set.new_version).map_err(|e| e.to_string())
}

#[tauri::command]
fn export_backup() -> Result<Vec<u8>, String> {
    // Placeholder: dump SQLite DB or snapshot JSON
    let json = serde_json::json!({ "version": 0 });
    serde_json::to_vec(&json).map_err(|e| e.to_string())
}

#[tauri::command]
fn import_backup(_data: Vec<u8>) -> Result<(), String> {
    // Placeholder: restore SQLite DB or snapshot JSON
    Ok(())
}

#[tauri::command]
fn icloud_sync_pull() -> Result<sync::StateSnapshot, String> {
    sync::read_snapshot_from_icloud().map_err(|e| e.to_string())?
        .ok_or_else(|| "No snapshot".to_string())
}

#[tauri::command]
fn icloud_sync_push(snapshot: sync::StateSnapshot) -> Result<(), String> {
    sync::write_snapshot_to_icloud(&snapshot).map_err(|e| e.to_string())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "macos")]
            if let Some(window) = app.get_webview_window("main") {
                apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, Some(12.0))
                    .expect("Failed to apply window vibrancy / corner radius");
            }
            Ok(())
        })
        .manage(DbState {
            path: "phitodo.db".to_string(),
        })
        .invoke_handler(tauri::generate_handler![
            get_state_snapshot,
            apply_changes,
            export_backup,
            import_backup,
            icloud_sync_pull,
            icloud_sync_push
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
