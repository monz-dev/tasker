-- 009_revoke_service_role_rpc.sql
-- Remove leftover default-privilege EXECUTE grants on service_role for the
-- dashboard RPCs and the invitation acceptance RPC. These functions are
-- designed to run only as the authenticated role (they filter by auth.uid()).
-- get_invitation_public stays available to anon + authenticated by design.
revoke execute on function public.get_weekly_stats() from service_role;
revoke execute on function public.get_pending_tasks(integer) from service_role;
revoke execute on function public.get_recent_activity(
    integer
) from service_role;
revoke execute on function public.get_active_projects_summary() from service_role;
revoke execute on function public.accept_project_invitation(
    uuid
) from service_role;
