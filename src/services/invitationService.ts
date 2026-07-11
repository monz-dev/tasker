import { supabase } from '@/lib/supabase/client';

export interface Invitation {
  id: string;
  project_id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  invited_by: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface InvitationWithProject extends Invitation {
  projects: {
    name: string;
  };
}

export async function createInvitation(
  projectId: string,
  email: string,
  role: 'admin' | 'member' | 'viewer'
): Promise<Invitation> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      project_id: projectId,
      email: email.trim().toLowerCase(),
      role: role,
      invited_by: user.id,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getInvitation(invitationId: string): Promise<InvitationWithProject> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, projects(name)')
    .eq('id', invitationId)
    .single();

  if (error) throw error;
  return data as InvitationWithProject;
}

export async function acceptInvitation(invitationId: string): Promise<string> {
  const { data, error } = await supabase.rpc('accept_project_invitation', {
    p_invitation_id: invitationId,
  });

  if (error) throw error;
  return data as string; // returns project_id uuid
}
