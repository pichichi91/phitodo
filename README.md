# phitodo

This repository contains the source code for **phitodo**, a personal task manager built with **Vue 3** and **Tauri 2**, designed as a native-feeling macOS app. It combines a clean task list with project and tag organization, optional Toggl time tracking, GitHub integration, and local SQLite storage (with future iCloud sync).

## Features

- **Views**: Inbox, Today, Upcoming, Anytime, Completed, plus Project and Tag views
- **Tasks**: Rich text descriptions, due dates, reminders, and project/tag assignment
- **Projects & tags**: Organize tasks with projects and multiple tags
- **Toggl**: Optional time tracking via Toggl integration and charts
- **GitHub**: Link tasks to GitHub issues and PRs
- **Review**: Dedicated review flow for triaging and planning
- **Desktop**: Native window (vibrancy, custom title bar), SQLite backend, and macOS notifications

---

## Prerequisites

- **Node.js** (v18 or later) and **npm**
- **Rust** (for Tauri) — install via [rustup](https://rustup.rs/)
- **macOS** — the app uses macOS-specific APIs (vibrancy, private APIs for window styling)

For Tauri development you may also need Xcode Command Line Tools:

```bash
xcode-select --install
```

---

## Setup

Clone the repo and install dependencies:

```bash
npm install
```

---

## Running the app

### Web only (browser)

Runs the Vue frontend with Vite; uses in-memory/local storage only:

```bash
npm run dev
```

Then open the URL shown in the terminal (usually `http://localhost:5173`).

### Desktop (Tauri)

Runs the full app as a native window with SQLite and Tauri APIs:

```bash
npm run tauri:dev
```

This starts the Vite dev server and opens the Tauri window. Use this for normal day-to-day development of the desktop app.

---

## Building

### Web

Build the frontend for production:

```bash
npm run build
```

Output is in `dist/`. You can preview it with:

```bash
npm run preview
```

### Desktop (Tauri)

Build the macOS app (`.app` and `.dmg`):

```bash
npm run tauri:build
```

Artifacts are generated in `src-tauri/target/release/` (and `bundle/` for the `.dmg`).

---

## Other scripts

| Command           | Description                                      |
|-------------------|--------------------------------------------------|
| `npm run icon`    | Regenerate app icons from the script/icon source |

---

## Security

GitHub and Toggl tokens are stored in app storage (plaintext). The app does not send your data to third parties except when you configure those integrations. For details, minimal-scope recommendations, and how to report vulnerabilities, see [SECURITY.md](SECURITY.md).

---

## Project structure

- **`src/`** — Vue 3 app: views, components, Pinia stores, domain services, router
- **`src-tauri/`** — Tauri 2 (Rust): main process, SQLite via `db.rs`, sync and notifications
- **`public/`** — Static assets and icons used by the frontend
