-- 008_harden_rls.sql
-- Hardening RLS:
--   * Permisos por rol real (project_members.role): viewer solo lee,
--     member edita tareas/sprints (sin reasignar propiedad), admin edita
--     proyectos, owner control total + gestión de miembros.
--   * Invitaciones: solo owner/admin invitan, nunca otorgan 'admin'
--     (solo el owner lo hace). Expiran a los 7 días.
--   * Sin acceso directo anónimo a invitations (reemplazado por un RPC
--     público acotado por id). Funciones security definer con search_path fijo.

-- ============================================================
-- 1. Helpers de rol (reemplazan el is_project_member original)
-- ============================================================

create or replace function public.get_project_member_role(p_project_id uuid)
returns text
language sql
security definer
set search_path = ''
stable
as $$
  select role::text
  from public.project_members
  where project_id = p_project_id and user_id = auth.uid()
  limit 1;
$$;

create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select public.get_project_member_role(p_project_id) is not null;
$$;

create or replace function public.is_project_admin(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select public.get_project_member_role(p_project_id) in ('owner', 'admin');
$$;

create or replace function public.is_project_owner(p_project_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select public.get_project_member_role(p_project_id) = 'owner';
$$;

-- ============================================================
-- 2. Hardening de funciones security definer existentes
-- ============================================================

-- Fijar search_path para evitar hijacking del search_path del llamador.
alter function public.auto_add_project_owner() set search_path = '';
alter function public.log_task_status_change() set search_path = '';
alter function public.log_task_creation() set search_path = '';

-- RPCs del dashboard: solo autenticados, sin ejecución por anónimos.
alter function public.get_weekly_stats() set search_path = '';
alter function public.get_pending_tasks(integer) set search_path = '';
alter function public.get_recent_activity(integer) set search_path = '';

revoke execute on function public.get_weekly_stats() from public, anon;
grant execute on function public.get_weekly_stats() to authenticated;

revoke execute on function public.get_pending_tasks(integer) from public, anon;
grant execute on function public.get_pending_tasks(integer) to authenticated;

revoke execute on function public.get_recent_activity(integer) from public, anon;
grant execute on function public.get_recent_activity(integer) to authenticated;

-- ============================================================
-- 3. Invitaciones: expiración, policies por rol, acceso público acotado
-- ============================================================

alter table public.invitations
  add column expires_at timestamptz not null default (now() + interval '7 days');

create index if not exists idx_invitations_email_status
  on public.invitations (lower(email), status);

drop policy if exists "invitations_read_all" on public.invitations;
drop policy if exists "invitations_insert_members" on public.invitations;
drop policy if exists "invitations_update_members" on public.invitations;

-- Solo puede leer: quien la creó, un admin del proyecto, o (si está pendiente)
-- la persona a la que va dirigido el correo. Los anónimos usan el RPC público.
create policy "invitations_select_own_or_admin"
  on public.invitations for select
  to authenticated
  using (
    invited_by = auth.uid()
    or public.is_project_admin(project_id)
    or (
      status = 'pending'
      and lower(coalesce(auth.jwt() ->> 'email', '')) = lower(email)
    )
  );

-- Solo owner/admin invitan. Los admins pueden otorgar member/viewer;
-- otorgar 'admin' queda reservado al owner.
create policy "invitations_insert_admins"
  on public.invitations for insert
  to authenticated
  with check (
    invited_by = auth.uid()
    and public.is_project_admin(project_id)
    and (role in ('member', 'viewer') or public.is_project_owner(project_id))
  );

create policy "invitations_update_inviter_or_admin"
  on public.invitations for update
  to authenticated
  using (invited_by = auth.uid() or public.is_project_admin(project_id));

-- RPC público para ver una invitación antes de registrarse/login.
-- Solo devuelve la fila pedida por id explícito, nunca listados.
-- No expone nada si la invitación no existe.
create or replace function public.get_invitation_public(p_invitation_id uuid)
returns json
language sql
security definer
set search_path = ''
stable
as $$
  select json_build_object(
    'id', i.id,
    'project_id', i.project_id,
    'email', i.email,
    'role', i.role,
    'invited_by', i.invited_by,
    'status', case
      when i.status = 'pending' and i.expires_at < now() then 'expired'
      else i.status
    end,
    'created_at', i.created_at,
    'updated_at', i.updated_at,
    'projects', json_build_object('name', p.name)
  )
  from public.invitations i
  inner join public.projects p on p.id = i.project_id
  where i.id = p_invitation_id
  limit 1;
$$;

revoke execute on function public.get_invitation_public(uuid) from public;
grant execute on function public.get_invitation_public(uuid) to anon, authenticated;

-- Aceptar invitación: valida expiración, invalida invitaciones duplicadas
-- del mismo correo+proyecto y fija search_path.
create or replace function public.accept_project_invitation(p_invitation_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_project_id uuid;
  v_email text;
  v_role text;
  v_user_email text;
begin
  -- Expira invitaciones vencidas pendientes (hygiene) antes de resolver.
  update public.invitations
  set status = 'expired', updated_at = now()
  where status = 'pending' and expires_at < now();

  select project_id, email, role into v_project_id, v_email, v_role
  from public.invitations
  where id = p_invitation_id and status = 'pending' and expires_at > now();

  if not found then
    raise exception 'Invitación inválida, vencida o ya procesada.';
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

  -- 4. Invalidate other pending invitations for the same person + project
  update public.invitations
  set status = 'expired', updated_at = now()
  where project_id = v_project_id
    and lower(email) = lower(v_email)
    and status = 'pending'
    and id <> p_invitation_id;

  -- 5. Update invitation status to accepted
  update public.invitations
  set status = 'accepted', updated_at = now()
  where id = p_invitation_id;

  return v_project_id;
end;
$$;

revoke execute on function public.accept_project_invitation(uuid) from public, anon;
grant execute on function public.accept_project_invitation(uuid) to authenticated;

-- ============================================================
-- 4. Tasks: policies por rol + protección de columnas de propiedad
-- ============================================================

drop policy if exists "tasks_select_members" on public.tasks;
drop policy if exists "tasks_insert_members" on public.tasks;
drop policy if exists "tasks_update_members" on public.tasks;
drop policy if exists "tasks_delete_members" on public.tasks;

-- viewer también lee (solo lectura).
create policy "tasks_select_members"
  on public.tasks for select
  to authenticated
  using (deleted_at is null and public.is_project_member(project_id));

create policy "tasks_insert_members"
  on public.tasks for insert
  to authenticated
  with check (
    public.get_project_member_role(project_id) in ('owner', 'admin', 'member')
    and created_by = auth.uid()
  );

-- member edita tareas (contenido, estado, asignación, soft-delete);
-- el trigger bloquea reasignar la propiedad o mover de proyecto.
create policy "tasks_update_members"
  on public.tasks for update
  to authenticated
  using (public.get_project_member_role(project_id) in ('owner', 'admin', 'member'));

-- El delete físico queda reservado a admin/owner (la app usa soft delete).
create policy "tasks_delete_admins"
  on public.tasks for delete
  to authenticated
  using (public.get_project_member_role(project_id) in ('owner', 'admin'));

-- Trigger anti-escalación + auditoría updated_by.
create or replace function public.prevent_task_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.get_project_member_role(old.project_id) not in ('owner', 'admin')
     and (
       old.id is distinct from new.id
       or old.project_id is distinct from new.project_id
       or old.created_by is distinct from new.created_by
     ) then
    raise exception 'No tienes permiso para reasignar la propiedad de esta tarea.';
  end if;
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger tasks_before_update
  before update on public.tasks
  for each row execute function public.prevent_task_privilege_change();

-- ============================================================
-- 5. Sprints: policies por rol + protección de columnas de propiedad
-- ============================================================

drop policy if exists "sprints_select_members" on public.sprints;
drop policy if exists "sprints_insert_members" on public.sprints;
drop policy if exists "sprints_update_members" on public.sprints;
drop policy if exists "sprints_delete_members" on public.sprints;

create policy "sprints_select_members"
  on public.sprints for select
  to authenticated
  using (deleted_at is null and public.is_project_member(project_id));

create policy "sprints_insert_members"
  on public.sprints for insert
  to authenticated
  with check (
    public.get_project_member_role(project_id) in ('owner', 'admin', 'member')
    and created_by = auth.uid()
  );

create policy "sprints_update_members"
  on public.sprints for update
  to authenticated
  using (public.get_project_member_role(project_id) in ('owner', 'admin', 'member'));

create policy "sprints_delete_admins"
  on public.sprints for delete
  to authenticated
  using (public.get_project_member_role(project_id) in ('owner', 'admin'));

create or replace function public.prevent_sprint_privilege_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.get_project_member_role(old.project_id) not in ('owner', 'admin')
     and (
       old.id is distinct from new.id
       or old.project_id is distinct from new.project_id
       or old.created_by is distinct from new.created_by
     ) then
    raise exception 'No tienes permiso para reasignar la propiedad de este sprint.';
  end if;
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger sprints_before_update
  before update on public.sprints
  for each row execute function public.prevent_sprint_privilege_change();

-- ============================================================
-- 6. Projects: solo admin/owner editan (viewer y member solo leen)
-- ============================================================

drop policy if exists "projects_update_members" on public.projects;

create policy "projects_update_admins"
  on public.projects for update
  to authenticated
  using (public.is_project_admin(id));

-- Auditoría updated_by en proyectos.
create or replace function public.projects_set_updated_by()
returns trigger
language plpgsql
as $$
begin
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger projects_before_update
  before update on public.projects
  for each row execute function public.projects_set_updated_by();

-- ============================================================
-- 7. get_active_projects_summary: expone el rol del miembro
--    (necesario para gatear la UI por permisos)
-- ============================================================

create or replace function public.get_active_projects_summary()
returns json
language sql
security definer
set search_path = ''
stable
as $$
  select coalesce(json_agg(row_to_json(p) order by p.updated_at desc), '[]'::json)
  from (
    select
      proj.id,
      proj.name,
      proj.description,
      proj.status,
      proj.progress,
      proj.target_date,
      proj.updated_at,
      (
        select coalesce(json_agg(json_build_object(
          'user_id', pm2.user_id,
          'full_name', pr.full_name,
          'avatar_url', pr.avatar_url,
          'role', pm2.role
        )), '[]'::json)
        from public.project_members pm2
        inner join public.profiles pr on pr.id = pm2.user_id
        where pm2.project_id = proj.id
      ) as members
    from public.projects proj
    inner join public.project_members pm on pm.project_id = proj.id and pm.user_id = auth.uid()
    where proj.status in ('active', 'delayed')
      and proj.deleted_at is null
    limit 6
  ) p;
$$;

revoke execute on function public.get_active_projects_summary() from public, anon;
grant execute on function public.get_active_projects_summary() to authenticated;