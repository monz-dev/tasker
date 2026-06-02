import { supabase } from '../lib/supabaseClient';
import type { ActivityLog } from '../types/models';

export async function getRecentActivity(limit = 15): Promise<ActivityLog[]> {
  const { data, error } = await supabase.rpc('get_recent_activity', { p_limit: limit });

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return (data as ActivityLog[]) ?? [];
}

export async function logActivity(entry: {
  project_id: string;
  action: ActivityLog['action'];
  target_type: ActivityLog['target_type'];
  target_id?: string;
  target_name: string;
  metadata?: Record<string, unknown>;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('activity_log')
    .insert({
      ...entry,
      user_id: user.id,
    });

  if (error) throw error;
}
