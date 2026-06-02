-- 004_activity_log.sql
-- Activity feed for dashboard timeline

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  action text not null check (action in ('commented', 'completed_task', 'created_task', 'updated_task', 'uploaded', 'created_project', 'updated_project')),
  target_type text not null check (target_type in ('task', 'project', 'file')),
  target_id uuid,
  target_name text,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index idx_activity_project on public.activity_log(project_id);
create index idx_activity_user on public.activity_log(user_id);
create index idx_activity_created on public.activity_log(created_at desc);

-- Enable RLS
alter table public.activity_log enable row level security;

-- Activity: project members can read
create policy "activity_select_members"
  on public.activity_log for select
  to authenticated
  using (public.is_project_member(project_id));

-- Activity: authenticated users can insert (for their own actions)
create policy "activity_insert_authenticated"
  on public.activity_log for insert
  to authenticated
  with check (user_id = auth.uid());

-- Auto-log task completion
create or replace function public.log_task_status_change()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Only log when status actually changes
  if old.status is distinct from new.status then
    if new.status = 'done' then
      insert into public.activity_log (project_id, user_id, action, target_type, target_id, target_name)
      values (new.project_id, auth.uid(), 'completed_task', 'task', new.id, new.title);
    else
      insert into public.activity_log (project_id, user_id, action, target_type, target_id, target_name, metadata)
      values (
        new.project_id, auth.uid(), 'updated_task', 'task', new.id, new.title,
        jsonb_build_object('old_status', old.status, 'new_status', new.status)
      );
    end if;
  end if;
  return new;
end;
$$;

create trigger on_task_status_change
  after update on public.tasks
  for each row execute function public.log_task_status_change();

-- Auto-log task creation
create or replace function public.log_task_creation()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.activity_log (project_id, user_id, action, target_type, target_id, target_name)
  values (new.project_id, new.created_by, 'created_task', 'task', new.id, new.title);
  return new;
end;
$$;

create trigger on_task_created
  after insert on public.tasks
  for each row execute function public.log_task_creation();
