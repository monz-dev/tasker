-- 003_tasks.sql
-- Tasks with full audit, soft delete, priority, and ordering

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  project_id uuid not null references public.projects(id) on delete cascade,
  assignee_id uuid references auth.users(id),
  sprint_id uuid,
  story_points integer,
  due_date date,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  updated_by uuid references auth.users(id),
  deleted_at timestamptz
);

create index idx_tasks_project on public.tasks(project_id) where deleted_at is null;
create index idx_tasks_assignee on public.tasks(assignee_id) where deleted_at is null;
create index idx_tasks_status on public.tasks(status) where deleted_at is null;
create index idx_tasks_due_date on public.tasks(due_date) where deleted_at is null and status != 'done';
create index idx_tasks_project_status on public.tasks(project_id, status) where deleted_at is null;

-- Enable RLS
alter table public.tasks enable row level security;

-- Tasks: project members can CRUD
create policy "tasks_select_members"
  on public.tasks for select
  to authenticated
  using (
    deleted_at is null
    and public.is_project_member(project_id)
  );

create policy "tasks_insert_members"
  on public.tasks for insert
  to authenticated
  with check (
    public.is_project_member(project_id)
    and created_by = auth.uid()
  );

create policy "tasks_update_members"
  on public.tasks for update
  to authenticated
  using (public.is_project_member(project_id));

create policy "tasks_delete_members"
  on public.tasks for delete
  to authenticated
  using (public.is_project_member(project_id));

-- Auto-update updated_at
create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();
