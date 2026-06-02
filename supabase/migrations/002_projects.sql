-- 002_projects.sql
-- Projects with members, soft delete, and audit trail

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'completed', 'delayed', 'archived')),
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  client text,
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz
);

create index idx_projects_status on public.projects(status) where deleted_at is null;
create index idx_projects_created_by on public.projects(created_by);
create index idx_projects_deleted_at on public.projects(deleted_at);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  unique(project_id, user_id)
);

create index idx_project_members_user on public.project_members(user_id);
create index idx_project_members_project on public.project_members(project_id);

-- Enable RLS
alter table public.projects enable row level security;
alter table public.project_members enable row level security;

-- Helper: check if user is member of a project
create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists(
    select 1 from public.project_members
    where project_id = p_project_id and user_id = auth.uid()
  );
$$;

-- Projects: members can read, creators can write
create policy "projects_select_members"
  on public.projects for select
  to authenticated
  using (
    deleted_at is null
    and (
      created_by = auth.uid()
      or public.is_project_member(id)
    )
  );

create policy "projects_insert_authenticated"
  on public.projects for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "projects_update_members"
  on public.projects for update
  to authenticated
  using (
    created_by = auth.uid()
    or public.is_project_member(id)
  );

-- Soft delete only (no hard delete via API)
create policy "projects_delete_owner"
  on public.projects for delete
  to authenticated
  using (created_by = auth.uid());

-- Project members: members can see members
create policy "project_members_select"
  on public.project_members for select
  to authenticated
  using (public.is_project_member(project_id) or user_id = auth.uid());

create policy "project_members_insert"
  on public.project_members for insert
  to authenticated
  with check (
    exists(
      select 1 from public.projects
      where id = project_id and created_by = auth.uid()
    )
  );

create policy "project_members_delete"
  on public.project_members for delete
  to authenticated
  using (
    exists(
      select 1 from public.projects
      where id = project_id and created_by = auth.uid()
    )
  );

-- Auto-add creator as owner member
create or replace function public.auto_add_project_owner()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.project_members (project_id, user_id, role)
  values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_project_created
  after insert on public.projects
  for each row execute function public.auto_add_project_owner();

-- Auto-update updated_at
create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();
