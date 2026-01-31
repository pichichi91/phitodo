# Contributing to phitodo

Thanks for your interest in contributing. Here’s how to get started.

## Development setup

1. **Prerequisites:** Node.js (v18+), npm, Rust ([rustup](https://rustup.rs/)), and macOS (for Tauri/desktop).
2. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd phitodo
   npm install
   ```
3. **Run the app:**
   - Web only: `npm run dev`
   - Desktop (Tauri): `npm run tauri:dev`

See [README.md](README.md) for full setup, building, and project structure.

## How to contribute

- **Bug reports and feature requests:** Open a GitHub issue in this repository. Describe the problem or idea and steps to reproduce if applicable.
- **Code changes:** Open a pull request. Keep changes focused; link any related issues. We’ll review and may ask for adjustments.

## Code and PRs

- Follow the existing style and patterns in the codebase (Vue 3, TypeScript, Rust in `src-tauri/`).
- Ensure the app still runs and builds (`npm run build`, `npm run tauri:build`).
- By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

## Questions

Open a GitHub Discussion or an issue in this repository if you’re unsure.

For security issues, see [SECURITY.md](SECURITY.md).
