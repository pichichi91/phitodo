# Security

## Token storage

GitHub and Toggl API tokens are stored in **plaintext** in app storage:

- **Web (browser):** `localStorage` under keys `phitodo_github_token` and `phitodo_toggl_token`.
- **Desktop (Tauri):** The same keys are used in the app’s storage (backed by the webview’s storage for the app origin).

The app does not send your data to any third party except:

- **GitHub:** When you configure a personal access token, the app uses it to fetch your assigned issues and PRs (and only when you open the GitHub or Inbox views).
- **Toggl:** When you configure a Toggl API token, the app uses it to fetch your time entries (and only when you use Toggl-related features).

## Recommendations

- **Minimal scope:** Use GitHub and Toggl tokens with the smallest scope you need (e.g. for GitHub: `repo` and `read:user`, or `public_repo` if you only use public repos).
- **Same origin:** Do not run untrusted scripts or extensions in the same origin as the app (e.g. avoid loading the app in a context where other code can access its storage).
- **Device access:** Anyone with physical or malware access to your machine can read stored tokens; use normal device security (lock screen, full-disk encryption, etc.) if that is a concern.

## Reporting vulnerabilities

If you find a security vulnerability, please report it responsibly:

- **Preferred:** Open a [GitHub Security Advisory](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/creating-a-repository-security-advisory) (Security → Advisories in this repo) or contact the maintainers privately (e.g. via the contact method listed in the repo).
- **Do not** open a public issue for unfixed security vulnerabilities.

We will acknowledge reports and work on a fix; we may coordinate disclosure after a patch is available.
