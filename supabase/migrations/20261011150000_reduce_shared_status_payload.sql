-- A share token grants read access only to delivery progress, not private task details.
-- The previous public wrapper exposed titles and exact route text through PostgREST
-- and the public API even if the rendered share page chose not to display those values.

drop function if exists public.get_shared_task_status(text);

create function public.get_shared_task_status(p_token_hash text)
returns table(
  status public.errand_status,
  updated_at timestamptz,
  expires_at timestamptz
)
language sql
security invoker
set search_path to ''
as $function$
  select shared.status, shared.updated_at, shared.expires_at
  from private.get_shared_task_status_impl(p_token_hash) as shared
$function$;

revoke execute on function public.get_shared_task_status(text) from public;
grant execute on function public.get_shared_task_status(text) to anon, authenticated;
