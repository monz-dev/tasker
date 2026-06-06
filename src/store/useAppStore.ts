'use client';

import { create } from 'zustand';
import { Task, Project, Sprint } from '@/types/models';

interface AppState {
  tasks: Task[];
  projects: Project[];
  sprints: Sprint[];

  // Actions matching server-actions pattern
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;

  // Agile Sprint actions
  setSprints: (sprints: Sprint[]) => void;
  setTasks: (tasks: Task[]) => void;
  updateTaskSprint: (taskId: string, sprintId: string | undefined) => void;
  addSprint: (sprint: Omit<Sprint, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  tasks: [],
  projects: [],
  sprints: [],

  addTask: (newTask) =>
    set((state) => ({
      tasks: [
        ...state.tasks,
        {
          ...newTask,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'current-user-id',
        },
      ],
    })),

  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status, updated_at: new Date().toISOString() } : t
      ),
    })),

  setSprints: (sprints) => set({ sprints }),

  setTasks: (tasks) => set({ tasks }),

  updateTaskSprint: (taskId, sprintId) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? { ...t, sprint_id: sprintId, updated_at: new Date().toISOString() }
          : t
      ),
    })),

  addSprint: (newSprint) =>
    set((state) => ({
      sprints: [
        ...state.sprints,
        {
          ...newSprint,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'current-user-id',
        },
      ],
    })),
}));
