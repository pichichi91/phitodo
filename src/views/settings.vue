<template>
  <div class="view-root">
    <header class="view-header">
      <h1>Settings</h1>
      <p>Personalize how phitodo behaves.</p>
    </header>
    <main class="view-main">
      <section class="group">
        <h2>Appearance</h2>
        <div class="row">
          <label class="settings-label">
            <span class="settings-label-text">Shortcut modifier</span>
            <CustomSelect
              v-model="shortcutModifier"
              :options="shortcutModifierOptions"
              aria-label="Choose shortcut modifier"
            />
          </label>
        </div>
      </section>
      <section class="group">
        <h2>GitHub</h2>
        <p class="hint">
          View your assigned issues and PRs awaiting review. Create a token with <code>repo</code> and <code>read:user</code> scopes.
          <a
            href="https://github.com/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            @click="openExternalLink($event, 'https://github.com/settings/tokens')"
          >Create token</a>
          <button type="button" class="link-button" @click="showTokenHelp = true">Get help</button>
        </p>
        <div class="row">
          <label class="settings-label">
            <span class="settings-label-text">Token</span>
            <input
              v-model="tokenInput"
              type="password"
              class="token-input"
              placeholder="ghp_…"
              aria-label="GitHub Personal Access Token"
            />
          </label>
        </div>
        <div class="row row-actions">
          <button type="button" class="btn btn-primary" @click="saveToken">Save</button>
          <button type="button" class="btn btn-secondary" @click="clearToken">Clear</button>
        </div>
        <div class="row">
          <label class="settings-label settings-label-block">
            <span class="settings-label-text">Repos to show</span>
            <textarea
              v-model="reposInput"
              class="repos-textarea"
              placeholder="owner/repo (one per line)"
              rows="4"
              aria-label="GitHub repos to show items from"
            />
          </label>
          <p class="hint">Leave empty to show all. One repo per line: <code>owner/repo</code> or just <code>owner</code> to include all repos under that org.</p>
        </div>
        <div class="row row-actions">
          <button type="button" class="btn btn-primary" @click="saveRepos">Save repos</button>
        </div>
        <p v-if="github.error" class="hint hint-error">{{ github.error }}</p>
      </section>
      <section class="group">
        <h2>Toggl</h2>
        <p class="hint">
          Show time entries from Toggl Track. Get your API token from your
          <a
            href="https://track.toggl.com/profile"
            target="_blank"
            rel="noopener noreferrer"
            @click="openExternalLink($event, 'https://track.toggl.com/profile')"
          >Toggl profile</a>.
        </p>
        <div class="row">
          <label class="settings-label">
            <span class="settings-label-text">Token</span>
            <input
              v-model="togglTokenInput"
              type="password"
              class="token-input"
              placeholder="API token"
              aria-label="Toggl API Token"
            />
          </label>
        </div>
        <div class="row row-actions">
          <button type="button" class="btn btn-primary" @click="saveTogglToken">Save</button>
          <button type="button" class="btn btn-secondary" @click="clearTogglToken">Clear</button>
        </div>
        <div class="row">
          <label class="settings-label settings-label-block">
            <span class="settings-label-text">Hide Toggl projects</span>
            <textarea
              v-model="togglHiddenProjectsInput"
              class="repos-textarea"
              placeholder="project name (one per line)"
              rows="3"
              aria-label="Toggl project names to hide"
            />
          </label>
          <p class="hint">These projects won’t appear in Toggl views (Inbox, Toggl page, standup report). One project name per line; matching is case-insensitive.</p>
        </div>
        <div class="row row-actions">
          <button type="button" class="btn btn-primary" @click="saveTogglHiddenProjects">Save</button>
        </div>
        <p v-if="toggl.error" class="hint hint-error">{{ toggl.error }}</p>
      </section>
    </main>

    <AppModal v-if="showTokenHelp" @close="showTokenHelp = false">
      <template #title>How to create a GitHub token</template>
      <div class="token-help">
        <ol class="token-help-steps">
          <li>
            <strong>Open token settings</strong><br />
            Go to <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noopener noreferrer"
              @click="openExternalLink($event, 'https://github.com/settings/tokens')"
            >github.com/settings/tokens</a>
            (or GitHub → Settings → Developer settings → Personal access tokens).
          </li>
          <li>
            <strong>Create a token</strong><br />
            Click “Generate new token” (or “Tokens (classic)” then “Generate new token (classic)”).
          </li>
          <li>
            <strong>Name and expiry</strong><br />
            Give it a note (e.g. <em>phitodo</em>) and choose an expiration (e.g. 90 days or No expiration).
          </li>
          <li>
            <strong>Choose scopes</strong><br />
            Enable at least:
            <ul>
              <li><code>repo</code> — full control of private repositories (needed for private repos and listing your issues/PRs)</li>
              <li><code>read:user</code> — read your user profile (needed for your assigned issues)</li>
            </ul>
            For public repos only, <code>public_repo</code> is enough instead of <code>repo</code>.
          </li>
          <li>
            <strong>Generate and copy</strong><br />
            Click “Generate token”, then copy the token right away (it looks like <code>ghp_…</code>). GitHub won’t show it again.
          </li>
          <li>
            <strong>Add it here</strong><br />
            Paste the token in the Token field above and click Save.
          </li>
        </ol>
      </div>
      <template #footer>
        <button type="button" class="btn btn-primary" @click="showTokenHelp = false">Done</button>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AppModal from "@/components/common/app-modal.vue";
import CustomSelect from "@/components/common/custom-select.vue";
import { useUIStore } from "@/stores/uiStore";
import type { ShortcutModifier } from "@/stores/uiStore";
import { useGitHubStore } from "@/stores/githubStore";
import { useTogglStore } from "@/stores/togglStore";

const ui = useUIStore();
const github = useGitHubStore();
const toggl = useTogglStore();

const showTokenHelp = ref(false);

const isTauri =
  typeof window !== "undefined" && !!(window as Window & { __TAURI__?: unknown }).__TAURI__;

const shortcutModifier = computed({
  get: () => ui.shortcutModifier,
  set: (value: ShortcutModifier) => ui.setShortcutModifier(value)
});

const shortcutModifierOptions = computed(() => {
  const options: { value: ShortcutModifier; label: string }[] = [
    { value: "alt", label: "Alt" },
    { value: "ctrl", label: "Ctrl" },
    { value: "ctrlAlt", label: "Ctrl+Alt" },
    { value: "meta", label: "Command" }
  ];
  return isTauri ? options : options.filter((o) => o.value !== "meta");
});

const tokenInput = ref(github.token ?? "");
watch(
  () => github.token,
  (t) => {
    tokenInput.value = t ?? "";
  }
);

const reposInput = ref(github.allowedRepos.join("\n"));
watch(
  () => github.allowedRepos,
  (repos) => {
    reposInput.value = repos.join("\n");
  },
  { deep: true }
);

function saveToken() {
  const value = tokenInput.value.trim() || null;
  github.setToken(value);
}

function clearToken() {
  tokenInput.value = "";
  github.clearToken();
}

function saveRepos() {
  const lines = reposInput.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  github.setAllowedRepos(lines);
}

const togglTokenInput = ref(toggl.token ?? "");
watch(
  () => toggl.token,
  (t) => {
    togglTokenInput.value = t ?? "";
  }
);

function saveTogglToken() {
  const value = togglTokenInput.value.trim() || null;
  toggl.setToken(value);
}

function clearTogglToken() {
  togglTokenInput.value = "";
  toggl.clearToken();
}

const togglHiddenProjectsInput = ref(toggl.inboxHiddenProjectNames.join("\n"));
watch(
  () => toggl.inboxHiddenProjectNames,
  (names) => {
    togglHiddenProjectsInput.value = names.join("\n");
  },
  { deep: true }
);

function saveTogglHiddenProjects() {
  const lines = togglHiddenProjectsInput.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  toggl.setInboxHiddenProjectNames(lines);
}

async function openExternalLink(e: MouseEvent, url: string) {
  if (typeof window !== "undefined" && (window as Window & { __TAURI__?: unknown }).__TAURI__) {
    e.preventDefault();
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  }
}
</script>

<style scoped>
.view-root {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  max-width: 50%;
  padding: 12px 16px 0;
}

.view-header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.view-header p {
  margin: 2px 0 0;
  font-size: 12px;
  color: #9ca3af;
}

.view-main {
  margin-top: 12px;
  padding-bottom: 24px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.group {
  margin-bottom: 16px;
}

.group h2 {
  font-size: 14px;
  margin: 0 0 6px;
}

.row {
  margin-bottom: 8px;
}

.settings-label {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.settings-label-text {
  min-width: 60px;
  font-size: 13px;
  color: #e5e7eb;
}

.settings-label .custom-select {
  min-width: 140px;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
}

.hint code {
  font-size: 11px;
  padding: 0 4px;
  background: rgba(55, 65, 81, 0.6);
  border-radius: 4px;
}

.hint a {
  color: #60a5fa;
  margin-left: 4px;
}

.link-button {
  margin-left: 8px;
  padding: 0;
  border: none;
  background: none;
  color: #60a5fa;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}

.link-button:hover {
  color: #93c5fd;
}

.token-help {
  color: #e5e7eb;
  line-height: 1.5;
}

.token-help-steps {
  margin: 0;
  padding-left: 20px;
}

.token-help-steps li {
  margin-bottom: 12px;
}

.token-help-steps li:last-child {
  margin-bottom: 0;
}

.token-help-steps ul {
  margin: 6px 0 0;
  padding-left: 18px;
}

.token-help a {
  color: #60a5fa;
}

.token-help code {
  font-size: 12px;
  padding: 1px 5px;
  background: rgba(55, 65, 81, 0.8);
  border-radius: 4px;
}

.hint-error {
  color: #f87171;
  margin-top: 6px;
}

.settings-label-block {
  flex-direction: column;
  align-items: stretch;
}

.settings-label-block .settings-label-text {
  min-width: 0;
  margin-bottom: 4px;
}

.token-input {
  min-width: 200px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
}

.repos-textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 80px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid rgba(55, 65, 81, 0.9);
  background: rgba(15, 23, 42, 0.98);
  color: #e5e7eb;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
}

.row-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: rgba(59, 130, 246, 0.3);
  color: #e5e7eb;
  border-color: rgba(59, 130, 246, 0.5);
}

.btn-primary:hover {
  background: rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #9ca3af;
  border-color: rgba(55, 65, 81, 0.9);
}

.btn-secondary:hover {
  color: #e5e7eb;
}
</style>
