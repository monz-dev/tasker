import { supabase } from '@/lib/supabase/client';
import type { Task, PendingTask } from '@/types/models';

export async function getPendingTasks(limit = 10): Promise<PendingTask[]> {
  const { data, error } = await supabase.rpc('get_pending_tasks', { p_limit: limit });

  if (error) {
    console.error('Error fetching pending tasks:', error);
    return [];
  }

  return (data as PendingTask[]) ?? [];
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching tasks by project:', error);
    return [];
  }

  return (data as Task[]) ?? [];
}

export async function createTask(task: {
  title: string;
  description?: string;
  project_id: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'todo' | 'in_progress' | 'review' | 'done';
  due_date?: string;
  story_points?: number;
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: task.title,
      description: task.description,
      project_id: task.project_id,
      priority: task.priority ?? 'medium',
      status: task.status ?? 'todo',
      assignee_id: user.id,
      created_by: user.id,
      due_date: task.due_date,
      story_points: task.story_points,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function addQuickTask(task: {
  title: string;
  project_id: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}) {
  return createTask({
    title: task.title,
    project_id: task.project_id,
    priority: task.priority ?? 'medium',
    status: 'todo',
    due_date: task.due_date,
  });
}

export async function updateTaskStatus(
  taskId: string,
  status: 'todo' | 'in_progress' | 'review' | 'done'
) {
  const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId);

  if (error) throw error;
}

export async function updateTaskSprint(taskId: string, sprintId: string | undefined) {
  const { error } = await supabase
    .from('tasks')
    .update({ sprint_id: sprintId ?? null })
    .eq('id', taskId);

  if (error) throw error;
}

export async function softDeleteTask(taskId: string) {
  const { error } = await supabase
    .from('tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) throw error;
}

export async function toggleTaskDone(taskId: string, currentStatus: string) {
  const newStatus = currentStatus === 'done' ? 'todo' : 'done';

  const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);

  if (error) throw error;
  return newStatus;
}
