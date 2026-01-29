// Task
export type TaskStatus = "inbox" | "active" | "scheduled" | "completed" | "cancelled";
export type TaskPriority = "none" | "low" | "medium" | "high";

export interface Reminder {
  id: string;
  taskId: string;
  at: string; // ISO timestamp
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  deleted?: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  startDate?: string;
  completedAt?: string;
  projectId?: string;
  sectionId?: string;
  parentTaskId?: string;
  priority: TaskPriority;
  tags: string[];
  status: TaskStatus;
  repeatRule?: string;
  reminders: Reminder[];
  orderIndex: number;
  deleted?: boolean;
}

// Project
export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  orderIndex: number;
  isInbox?: boolean;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

// Tag
export interface Tag {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

// Section
export interface Section {
  id: string;
  projectId: string;
  name: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  deleted?: boolean;
}

// View preset
export interface ViewCriteria {
  status?: string[];
  projectIds?: string[];
  tagIds?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
  priorities?: string[];
}

export interface ViewPreset {
  id: string;
  name: string;
  criteria: ViewCriteria;
  createdAt: string;
  updatedAt: string;
}
