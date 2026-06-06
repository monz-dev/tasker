import { supabase } from '@/lib/supabase/client';
import type { Sprint } from '@/types/models';

export async function getSprintsByProject(projectId: string): Promise<Sprint[]> {
  const { data, error } = await supabase
    .from('sprints')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching sprints by project:', error);
    return [];
  }

  return (data as Sprint[]) ?? [];
}

export async function createSprint(sprint: {
  name: string;
  project_id: string;
  start_date: string;
  end_date: string;
  status?: 'planned' | 'active' | 'completed';
}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('sprints')
    .insert({
      name: sprint.name,
      project_id: sprint.project_id,
      start_date: sprint.start_date,
      end_date: sprint.end_date,
      status: sprint.status ?? 'planned',
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSprintStatus(
  sprintId: string,
  status: 'planned' | 'active' | 'completed'
) {
  const { error } = await supabase
    .from('sprints')
    .update({ status })
    .eq('id', sprintId);

  if (error) throw error;
}
