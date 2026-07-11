-- 007_collaboration.sql
-- Create invitations table and invitation acceptance RPC

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member', 'viewer')),
  invited_by uuid not null references auth.users(id),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.invitations enable row level security;

-- Security Policies

create policy "invitations_read_all"
  on public.invitations for select
  to public
  using (true); -- Allow general select to check invitation metadata prior to register/login

create policy "invitations_insert_members"
  on public.invitations for insert
  to authenticated
  with check (
    public.is_project_member(project_id)
  );

create policy "invitations_update_members"
  on public.invitations for update
  to authenticated
  using (
    invited_by = auth.uid() or public.is_project_member(project_id)
  );

-- Auto-update updated_at
create trigger invitations_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();

-- Security Definer RPC function to accept invitations and insert project member
create or replace function public.accept_project_invitation(p_invitation_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_project_id uuid;
  v_email text;
  v_role text;
  v_user_email text;
begin
  -- 1. Get the invitation details
  select project_id, email, role into v_project_id, v_email, v_role
  from public.invitations
  where id = p_invitation_id and status = 'pending';

  if not found then
    raise exception 'Invitación inválida o ya procesada.';
  end if;

  -- 2. Validate that the authenticated user's email matches the invitation email
  v_user_email := auth.jwt() ->> 'email';
  if v_user_email is null or lower(v_user_email) != lower(v_email) then
    raise exception 'El email del usuario logueado no coincide con el de la invitación.';
  end if;

  -- 3. Insert user as project member
  insert into public.project_members (project_id, user_id, role)
  values (v_project_id, auth.uid(), v_role)
  on conflict (project_id, user_id) do nothing;

  -- 4. Update invitation status to accepted
  update public.invitations
  set status = 'accepted', updated_at = now()
  where id = p_invitation_id;

  return v_project_id;
end;
$$;
