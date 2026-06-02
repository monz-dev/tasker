import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/models';

export async function updateProfile(profile: {
  full_name: string;
  role: 'admin' | 'member' | 'viewer';
}): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: profile.full_name,
      role: profile.role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}
