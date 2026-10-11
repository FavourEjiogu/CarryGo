-- Harden location ingestion and establish a short, explicit GPS retention window.
-- Public route validation is not a substitute for database-side validation because
-- authenticated clients can call the exposed RPC directly.

create or replace function private.record_delivery_location_impl(
  p_errand_id uuid,
  p_latitude numeric,
  p_longitude numeric,
  p_accuracy_m numeric,
  p_captured_at timestamptz,
  p_client_sequence bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  uid uuid := auth.uid();
  e public.errands;
  s public.delivery_sessions;
  actor_type text;
begin
  if uid is null then
    raise exception 'Unauthorized';
  end if;

  if p_latitude is null or p_latitude < -90 or p_latitude > 90
     or p_longitude is null or p_longitude < -180 or p_longitude > 180 then
    raise exception 'Invalid coordinates';
  end if;

  if p_accuracy_m is null or p_accuracy_m < 0 or p_accuracy_m > 10000 then
    raise exception 'Invalid location accuracy';
  end if;

  if p_captured_at is null
     or p_captured_at < now() - interval '2 minutes'
     or p_captured_at > now() + interval '30 seconds' then
    raise exception 'Location timestamp is stale or in the future';
  end if;

  if p_client_sequence is null or p_client_sequence < 1 then
    raise exception 'Invalid client sequence';
  end if;

  select * into e
  from public.errands
  where id = p_errand_id
  for update;

  if e.id is null then
    raise exception 'Errand not found';
  end if;

  if uid <> e.payer_id and uid <> e.runner_id then
    raise exception 'Not a participant';
  end if;

  if e.status not in ('IN_PROGRESS','AT_VENDOR','ITEM_CONFIRMED','EN_ROUTE','HANDOFF_PENDING') then
    raise exception 'Location sharing is not active';
  end if;

  select * into s
  from public.delivery_sessions
  where errand_id = e.id
  for update;

  if s.id is null or s.status <> 'ACTIVE' or s.ended_at is not null then
    raise exception 'Delivery session is not active';
  end if;

  actor_type := case when uid = e.runner_id then 'RUNNER' else 'PAYER' end;

  -- Do not let an offline/out-of-order GPS packet overwrite a newer position.
  if actor_type = 'RUNNER' and s.last_runner_at is not null then
    if p_captured_at <= s.last_runner_at then
      return jsonb_build_object('accepted', false, 'reason', 'superseded');
    end if;
    if s.last_runner_at > now() - interval '5 seconds' then
      return jsonb_build_object('accepted', false, 'reason', 'rate_limited');
    end if;
  elsif actor_type = 'PAYER' and s.last_payer_at is not null then
    if p_captured_at <= s.last_payer_at then
      return jsonb_build_object('accepted', false, 'reason', 'superseded');
    end if;
    if s.last_payer_at > now() - interval '5 seconds' then
      return jsonb_build_object('accepted', false, 'reason', 'rate_limited');
    end if;
  end if;

  insert into public.delivery_location_points(
    session_id, actor_user_id, actor_type,
    latitude, longitude, accuracy_m, captured_at, client_sequence
  )
  values(
    s.id, uid, actor_type,
    p_latitude, p_longitude, p_accuracy_m, p_captured_at, p_client_sequence
  )
  on conflict(session_id, actor_user_id, client_sequence) do nothing;

  return jsonb_build_object('accepted', true, 'actor_type', actor_type, 'session_id', s.id);
end
$function$;

-- Defence in depth: the trigger must also refuse to replace a newer current point.
create or replace function public.update_delivery_last_location()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if new.actor_type = 'RUNNER' then
    update public.delivery_sessions
    set last_runner_lat = new.latitude,
        last_runner_lng = new.longitude,
        last_runner_accuracy_m = new.accuracy_m,
        last_runner_at = new.captured_at
    where id = new.session_id
      and (last_runner_at is null or last_runner_at <= new.captured_at);
  else
    update public.delivery_sessions
    set last_payer_lat = new.latitude,
        last_payer_lng = new.longitude,
        last_payer_accuracy_m = new.accuracy_m,
        last_payer_at = new.captured_at
    where id = new.session_id
      and (last_payer_at is null or last_payer_at <= new.captured_at);
  end if;
  return new;
end
$function$;

-- GPS traces are needed for an active task and short-term handoff/dispute support,
-- not as a permanent movement history. Keep the operational window explicit:
-- raw points and latest-coordinate fields are purged 24 hours after a session ends,
-- or 24 hours after a task becomes terminal if the session did not get closed cleanly.
create or replace function private.purge_expired_delivery_locations()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  deleted_points bigint := 0;
  cleared_sessions bigint := 0;
begin
  delete from public.delivery_location_points p
  using public.delivery_sessions s, public.errands e
  where p.session_id = s.id
    and e.id = s.errand_id
    and (
      (s.ended_at is not null and s.ended_at <= now() - interval '24 hours')
      or
      (e.status in ('COMPLETED','CANCELLED','EXPIRED','FAILED','DISPUTED','ABANDONED')
       and e.updated_at <= now() - interval '24 hours')
    );
  get diagnostics deleted_points = row_count;

  update public.delivery_sessions s
  set last_runner_lat = null,
      last_runner_lng = null,
      last_runner_accuracy_m = null,
      last_runner_at = null,
      last_payer_lat = null,
      last_payer_lng = null,
      last_payer_accuracy_m = null,
      last_payer_at = null
  from public.errands e
  where e.id = s.errand_id
    and (
      (s.ended_at is not null and s.ended_at <= now() - interval '24 hours')
      or
      (e.status in ('COMPLETED','CANCELLED','EXPIRED','FAILED','DISPUTED','ABANDONED')
       and e.updated_at <= now() - interval '24 hours')
    )
    and (
      s.last_runner_lat is not null or s.last_runner_lng is not null
      or s.last_runner_accuracy_m is not null or s.last_runner_at is not null
      or s.last_payer_lat is not null or s.last_payer_lng is not null
      or s.last_payer_accuracy_m is not null or s.last_payer_at is not null
    );
  get diagnostics cleared_sessions = row_count;

  return jsonb_build_object(
    'deleted_location_points', deleted_points,
    'cleared_session_coordinate_sets', cleared_sessions
  );
end
$function$;

revoke all on function private.purge_expired_delivery_locations() from public, anon, authenticated;
grant execute on function private.purge_expired_delivery_locations() to postgres;

-- Idempotently ensure only one cleanup job is scheduled.
select cron.unschedule(jobid)
from cron.job
where jobname = 'carrygo-purge-expired-delivery-locations';

select cron.schedule(
  'carrygo-purge-expired-delivery-locations',
  '*/15 * * * *',
  'select private.purge_expired_delivery_locations();'
);
