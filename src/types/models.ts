// Supabase types — manually maintained for the dashboard feature set.
// Generate full types with: npx supabase gen types typescript --project-id <id>

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string;
  deleted_at?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  role: 'admin' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
}

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'delayed' | 'archived';
  progress: number;
  client?: string;
  target_date?: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
}

export interface ProjectWithMembers extends Project {
  members: Array<{
    user_id: string;
    full_name: string;
    avatar_url: string | null;
  }>;
}

export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project_id: string;
  assignee_id?: string;
  sprint_id?: string;
  story_points?: number;
  due_date?: string;
  position: number;
}

export interface PendingTask {
  id: string;
  title: string;
  due_date: string | null;
  priority: Task['priority'];
  status: Task['status'];
  project_id: string;
  project_name: string;
  urgency: 'overdue' | 'today' | 'tomorrow' | 'upcoming';
}

export interface Sprint extends BaseEntity {
  name: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'completed';
  project_id: string;
}

export interface ActivityLog {
  id: string;
  action: 'commented' | 'completed_task' | 'created_task' | 'updated_task' | 'uploaded' | 'created_project' | 'updated_project';
  target_type: 'task' | 'project' | 'file';
  target_name: string;
  metadata: Record<string, unknown>;
  created_at: string;
  user_name: string;
  user_avatar: string | null;
  project_name: string;
}

export interface WeeklyStats {
  total_completed: number;
  daily: Array<{
    day: number;
    count: number;
  }>;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'member' | 'viewer';
}
