import type { Project } from "@/domain/models";

export const createProject = (name: string): Project => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    orderIndex: nowAsOrderIndex(now),
    createdAt: now,
    updatedAt: now,
    isInbox: false
  };
};

const nowAsOrderIndex = (iso: string): number => {
  return new Date(iso).getTime();
};
