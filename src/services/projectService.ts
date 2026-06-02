import { supabase } from '../lib/supabaseClient';
import type { ProjectWithMembers } from '../types/models';
import { logActivity } from './activityService';

export async function getActiveProjects(): Promise<ProjectWithMembers[]> {
  const { data, error } = await supabase.rpc('get_active_projects_summary');

  if (error) {
    console.error('Error fetching active projects:', error);
    return [];
  }

  return (data as ProjectWithMembers[]) ?? [];
}

export async function createProject(project: {
  name: string;
  description?: string;
  client?: string;
  target_date?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...project,
      created_by: user.id,
      status: 'active',
      progress: 0,
    })
    .select()
    .single();

  if (error) throw error;

  // Log activity
  try {
    await logActivity({
      project_id: data.id,
      action: 'created_project',
      target_type: 'project',
      target_id: data.id,
      target_name: data.name,
    });
  } catch (err) {
    console.error('Failed to log project creation activity:', err);
  }

  return data;
}

export async function updateProjectProgress(projectId: string, progress: number) {
  const { error } = await supabase
    .from('projects')
    .update({
      progress,
      status: progress >= 100 ? 'completed' : 'active',
    })
    .eq('id', projectId);

  if (error) throw error;
}

export async function updateProjectStatus(projectId: string, status: 'active' | 'completed' | 'delayed' | 'archived') {
  const { error } = await supabase
    .from('projects')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (error) throw error;
}

export async function softDeleteProject(projectId: string) {
  const { error } = await supabase
    .from('projects')
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (error) throw error;
}
