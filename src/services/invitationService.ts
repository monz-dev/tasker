import { supabase } from '@/lib/supabase/client';
import { fetchWithRetry, fetchOnce } from '@/lib/fetch-utils';

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

  const { data, error } = await fetchOnce<Invitation>(() =>
    supabase
      .from('invitations')
      .insert({
        project_id: projectId,
        email: email.trim().toLowerCase(),
        role: role,
        invited_by: user.id,
        status: 'pending',
      })
      .select()
      .single()
  );

  if (error) throw error;
  return data!;
}

export async function getInvitation(invitationId: string): Promise<InvitationWithProject> {
  // Sessions: direct query (RLS autoriza solo al destinatario, al creador o a un admin).
  // Anónimos: RPC público acotado por id — nunca acceso directo a la tabla.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const query = () =>
    session?.user
      ? supabase
          .from('invitations')
          .select('*, projects(name)')
          .eq('id', invitationId)
          .single()
      : supabase.rpc('get_invitation_public', {
          p_invitation_id: invitationId,
        });

  const { data, error } = await fetchWithRetry<InvitationWithProject>(query);

  if (error) throw error;
  if (!data) throw new Error('Invitación no encontrada');
  return data!;
}

export async function acceptInvitation(invitationId: string): Promise<string> {
  // Mutations: use fetchOnce to avoid duplicate side-effects on retry
  const { data, error } = await fetchOnce<string>(() =>
    supabase.rpc('accept_project_invitation', {
      p_invitation_id: invitationId,
    })
  );

  if (error) throw error;
  return data as string; // returns project_id uuid
}
