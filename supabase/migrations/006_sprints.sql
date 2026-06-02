-- 006_sprints.sql
-- Sprints table for Agile planning

create table public.sprints (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  status text not null default 'planned' check (status in ('planned', 'active', 'completed')),
  project_id uuid not null references public.projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz
);

create index idx_sprints_project on public.sprints(project_id) where deleted_at is null;
create index idx_sprints_status on public.sprints(status) where deleted_at is null;

-- Enable RLS
alter table public.sprints enable row level security;

-- Sprints: project members can CRUD
create policy "sprints_select_members"
  on public.sprints for select
  to authenticated
  using (
    deleted_at is null
    and public.is_project_member(project_id)
  );

create policy "sprints_insert_members"
  on public.sprints for insert
  to authenticated
  with check (
    public.is_project_member(project_id)
    and created_by = auth.uid()
  );

create policy "sprints_update_members"
  on public.sprints for update
  to authenticated
  using (public.is_project_member(project_id));

create policy "sprints_delete_members"
  on public.sprints for delete
  to authenticated
  using (public.is_project_member(project_id));

-- Auto-update updated_at
create trigger sprints_updated_at
  before update on public.sprints
  for each row execute function public.set_updated_at();

-- Add foreign key constraint to tasks table for sprint_id
-- We must make sure to only add it if it isn't already there or just alter table
alter table public.tasks 
add constraint fk_tasks_sprint 
foreign key (sprint_id) 
references public.sprints(id) 
on delete set null;
