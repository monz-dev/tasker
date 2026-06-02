-- 005_dashboard_views.sql
-- RPC functions for dashboard widgets

-- Weekly completion stats (the big number + bar chart)
create or replace function public.get_weekly_stats()
returns json
language sql
security definer
stable
as $$
  with week_range as (
    select
      date_trunc('week', now())::date as week_start,
      (date_trunc('week', now()) + interval '6 days')::date as week_end
  ),
  daily_counts as (
    select
      extract(isodow from al.created_at)::int as day_num,
      count(*) as completed
    from public.activity_log al
    inner join public.project_members pm
      on pm.project_id = al.project_id and pm.user_id = auth.uid()
    cross join week_range wr
    where al.action = 'completed_task'
      and al.created_at >= wr.week_start
      and al.created_at < wr.week_end + interval '1 day'
    group by 1
  ),
  total as (
    select coalesce(sum(completed), 0) as total_completed
    from daily_counts
  )
  select json_build_object(
    'total_completed', (select total_completed from total),
    'daily', (
      select coalesce(json_agg(
        json_build_object('day', d.day_num, 'count', coalesce(dc.completed, 0))
        order by d.day_num
      ), '[]'::json)
      from generate_series(1, 7) as d(day_num)
      left join daily_counts dc on dc.day_num = d.day_num
    )
  );
$$;

-- Pending tasks for current user (dashboard widget)
create or replace function public.get_pending_tasks(p_limit int default 10)
returns json
language sql
security definer
stable
as $$
  select coalesce(json_agg(row_to_json(t) order by
    case
      when t.due_date < current_date then 0
      when t.due_date = current_date then 1
      when t.due_date = current_date + 1 then 2
      else 3
    end,
    t.due_date asc nulls last,
    t.priority_order asc
  ), '[]'::json)
  from (
    select
      tk.id,
      tk.title,
      tk.due_date,
      tk.priority,
      tk.status,
      tk.project_id,
      p.name as project_name,
      case tk.priority
        when 'urgent' then 0
        when 'high' then 1
        when 'medium' then 2
        when 'low' then 3
      end as priority_order,
      case
        when tk.due_date < current_date then 'overdue'
        when tk.due_date = current_date then 'today'
        when tk.due_date = current_date + 1 then 'tomorrow'
        else 'upcoming'
      end as urgency
    from public.tasks tk
    inner join public.projects p on p.id = tk.project_id
    inner join public.project_members pm on pm.project_id = tk.project_id and pm.user_id = auth.uid()
    where tk.status in ('todo', 'in_progress', 'review')
      and tk.deleted_at is null
      and tk.assignee_id = auth.uid()
    limit p_limit
  ) t;
$$;

-- Active projects summary for dashboard
create or replace function public.get_active_projects_summary()
returns json
language sql
security definer
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
          'avatar_url', pr.avatar_url
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

-- Recent activity feed for dashboard
create or replace function public.get_recent_activity(p_limit int default 15)
returns json
language sql
security definer
stable
as $$
  select coalesce(json_agg(row_to_json(a) order by a.created_at desc), '[]'::json)
  from (
    select
      al.id,
      al.action,
      al.target_type,
      al.target_name,
      al.metadata,
      al.created_at,
      pr.full_name as user_name,
      pr.avatar_url as user_avatar,
      p.name as project_name
    from public.activity_log al
    inner join public.profiles pr on pr.id = al.user_id
    inner join public.projects p on p.id = al.project_id
    inner join public.project_members pm on pm.project_id = al.project_id and pm.user_id = auth.uid()
    where al.created_at > now() - interval '30 days'
    order by al.created_at desc
    limit p_limit
  ) a;
$$;
