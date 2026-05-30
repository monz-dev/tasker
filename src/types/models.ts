export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  deleted_at?: string; // Soft delete implementation
}

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'delayed' | 'archived';
  progress: number;
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  project_id: string;
  assignee_id?: string;
  sprint_id?: string;
  story_points?: number;
  due_date?: string;
}

export interface Sprint extends BaseEntity {
  name: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'completed';
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'member' | 'viewer';
}
