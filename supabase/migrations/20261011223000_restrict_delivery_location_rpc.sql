-- Expose only the validated location write wrapper to authenticated callers.
-- The SECURITY DEFINER wrapper has a fixed empty search_path and delegates to a
-- private implementation which still validates auth.uid(), participation, task state,
-- ranges, timestamp freshness, accuracy, and write frequency.

create or replace function public.record_delivery_location(
  p_errand_id uuid,
  p_latitude numeric,
  p_longitude numeric,
  p_accuracy_m numeric,
  p_captured_at timestamptz,
  p_client_sequence bigint
)
returns jsonb
language sql
security definer
set search_path = ''
as $function$
  select private.record_delivery_location_impl(
    p_errand_id,
    p_latitude,
    p_longitude,
    p_accuracy_m,
    p_captured_at,
    p_client_sequence
  )
$function$;

revoke all on function public.record_delivery_location(uuid,numeric,numeric,numeric,timestamptz,bigint)
  from public, anon, authenticated;
grant execute on function public.record_delivery_location(uuid,numeric,numeric,numeric,timestamptz,bigint)
  to authenticated;

revoke all on function private.record_delivery_location_impl(uuid,numeric,numeric,numeric,timestamptz,bigint)
  from public, anon, authenticated;
grant execute on function private.record_delivery_location_impl(uuid,numeric,numeric,numeric,timestamptz,bigint)
  to postgres;
