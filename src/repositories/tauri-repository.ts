import type { LocalRepository, StateSnapshot, ChangeSet } from "./local-repository";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Tauri types may not be present until Tauri is fully initialized
import { invoke } from "@tauri-apps/api/core";

export class TauriRepository implements LocalRepository {
  async getStateSnapshot(sinceVersion?: number): Promise<StateSnapshot> {
    const payload = sinceVersion != null ? { since: sinceVersion } : {};
    return invoke<StateSnapshot>("get_state_snapshot", payload);
  }

  async applyChanges(changeSet: ChangeSet): Promise<void> {
    await invoke("apply_changes", { changeSet });
  }

  async exportBackup(): Promise<Blob> {
    const data = await invoke<Uint8Array>("export_backup");
    return new Blob([new Uint8Array(data)], { type: "application/json" });
  }

  async importBackup(file: Blob): Promise<void> {
    const buffer = await file.arrayBuffer();
    await invoke("import_backup", { data: Array.from(new Uint8Array(buffer)) });
  }
}
