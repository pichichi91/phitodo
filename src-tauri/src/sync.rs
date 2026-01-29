use serde::{Deserialize, Serialize};

#[allow(dead_code)]
#[derive(Debug, Serialize, Deserialize)]
pub struct ChangeSet {
    pub tasks: serde_json::Value,
    pub projects: serde_json::Value,
    pub tags: serde_json::Value,
    pub sections: serde_json::Value,
    pub reminders: serde_json::Value,
    pub new_version: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StateSnapshot {
    pub tasks: serde_json::Value,
    pub projects: serde_json::Value,
    pub tags: serde_json::Value,
    pub sections: serde_json::Value,
    pub reminders: serde_json::Value,
    pub version: i64,
}

// Placeholder: later this will read/write a versioned snapshot under an iCloud Drive path.
pub fn write_snapshot_to_icloud(_snapshot: &StateSnapshot) -> tauri::Result<()> {
    Ok(())
}

pub fn read_snapshot_from_icloud() -> tauri::Result<Option<StateSnapshot>> {
    Ok(None)
}
