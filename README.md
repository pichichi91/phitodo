## phitodo – implementation roadmap

### Phase 1 – Core Vue app (web only)

- **Goal**: Validate UX, data model, and flows in the browser using simple local storage.
- **Deliverables**:
  - Vue 3 app with sidebar, toolbar, and 3‑pane layout.
  - Screens: `Inbox`, `Today`, `Upcoming`, `Anytime`, `Someday`, `Completed`, `Project`, `Tag`, `Review`, `Settings` (even if some are placeholder lists).
  - Domain models and services wired into Pinia stores.
  - Temporary persistence via `localStorage` or IndexedDB (no Tauri involvement yet).

### Phase 2 – Tauri macOS app (local storage)

- **Goal**: Turn the Vue app into a real macOS desktop app with robust local persistence.
- **Deliverables**:
  - Tauri project compiling on macOS with the Vue UI bundled.
  - SQLite schema (tasks, projects, sections, tags, task_tags, reminders, metadata) created via `db.rs`.
  - Tauri commands implemented for:
    - `get_state_snapshot`
    - `apply_changes`
    - `export_backup`
    - `import_backup`
  - Vue `TauriRepository` replacing the temporary web storage and used by Pinia stores.

### Phase 3 – iCloud‑backed sync

- **Goal**: Keep data synced across Macs using an iCloud Drive snapshot file.
- **Deliverables**:
  - Snapshot format defined (mirroring `StateSnapshot` in `sync.rs`).
  - Rust helpers to read/write the snapshot file under an iCloud Drive path.
  - Tauri commands:
    - `icloud_sync_pull`
    - `icloud_sync_push`
  - JS `SyncService` that:
    - Performs pull on startup and periodically.
    - Pushes local changes after applying a ChangeSet.
    - Resolves conflicts with `updatedAt` + `deleted` flags.
  - Basic sync status indicator in the toolbar and a manual “Sync now” button.

### Phase 4 – Notifications & desktop polish

- **Goal**: Add reminders and make the app feel deeply macOS‑native.
- **Deliverables**:
  - macOS notifications wired to reminders through `notifications.rs` and Tauri commands:
    - `schedule_notification`
    - `cancel_notification`
  - Reminder scheduling integrated into the task detail view.
  - Keyboard shortcuts for quick add, navigation, and completing tasks.
  - Optional extras:
    - Dock badge for today/overdue count.
    - Quick add window or menubar item.
    - JSON export/import UX in `Settings`.
