-- Keep only the intended callers for CarryGo intelligence RPCs.
revoke execute on function public.create_shared_task_status(uuid,text,timestamptz) from public, anon;
grant execute on function public.create_shared_task_status(uuid,text,timestamptz) to authenticated;

revoke execute on function public.get_route_suggestion(uuid,uuid) from public, anon;
grant execute on function public.get_route_suggestion(uuid,uuid) to authenticated;

revoke execute on function public.repeat_errand(uuid) from public, anon;
grant execute on function public.repeat_errand(uuid) to authenticated;

-- Public shared status is intentionally available to anonymous viewers, but not to PUBLIC.
revoke execute on function public.get_shared_task_status(text) from public;
grant execute on function public.get_shared_task_status(text) to anon, authenticated;

-- The original migration created this duplicate unique index; keep the existing generated unique index.
drop index if exists public.delivery_metrics_route_unique_idx;
