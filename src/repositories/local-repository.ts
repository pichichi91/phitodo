import type { Task, Project, Tag, Section, Reminder } from "@/domain/models";

export interface StateSnapshot {
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  sections: Section[];
  reminders: Reminder[];
  version: number;
}

export interface ChangeSet {
  tasks: Task[];
  projects: Project[];
  tags: Tag[];
  sections: Section[];
  reminders: Reminder[];
  newVersion: number;
}

export interface LocalRepository {
  getStateSnapshot(sinceVersion?: number): Promise<StateSnapshot>;
  applyChanges(changeSet: ChangeSet): Promise<void>;
  exportBackup(): Promise<Blob>;
  importBackup(file: Blob): Promise<void>;
}
