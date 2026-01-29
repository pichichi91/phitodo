use serde::Deserialize;

#[allow(dead_code)]
#[derive(Debug, Deserialize)]
pub struct ReminderPayload {
    pub id: String,
    pub task_id: String,
    pub at: String,
    pub title: String,
}

// Placeholder: this will use macOS notification APIs via Tauri.
#[allow(dead_code)]
pub fn schedule_notification(_payload: ReminderPayload) -> tauri::Result<()> {
    Ok(())
}

#[allow(dead_code)]
pub fn cancel_notification(_id: String) -> tauri::Result<()> {
    Ok(())
}
