-- Keep privileged implementation functions out of the PostgREST-exposed public API.
-- Public RPC wrappers remain SECURITY INVOKER and explicitly validate caller context.

create or replace function private.create_shared_task_status_impl(
  p_errand_id uuid,p_token_hash text,p_expires_at timestamptz
)
returns table(ok boolean, expires_at timestamptz)
language plpgsql security definer set search_path to ''
as $function$
declare uid uuid:=auth.uid(); e public.errands;
begin
  if uid is null then raise exception 'Unauthorized'; end if;
  if p_token_hash is null or length(p_token_hash)<>64 then raise exception 'Invalid token'; end if;
  if p_expires_at<=now() or p_expires_at>now()+interval '24 hours' then raise exception 'Invalid expiry'; end if;
  select * into e from public.errands where id=p_errand_id;
  if e.id is null then raise exception 'Task not found'; end if;
  if e.payer_id<>uid and e.runner_id<>uid then raise exception 'Not authorized'; end if;
  if e.status in ('COMPLETED','CANCELLED','EXPIRED','FAILED','DISPUTED','ABANDONED')::public.errand_status[] then raise exception 'Task no longer has live status'; end if;
  update public.shared_task_status set revoked_at=now() where errand_id=p_errand_id and created_by=uid and revoked_at is null;
  insert into public.shared_task_status(errand_id,created_by,token_hash,expires_at) values(p_errand_id,uid,p_token_hash,p_expires_at);
  return query select true,p_expires_at;
end;
$function$;

drop function if exists public.create_shared_task_status(uuid,text,timestamptz);
create function public.create_shared_task_status(p_errand_id uuid,p_token_hash text,p_expires_at timestamptz)
returns table(ok boolean, expires_at timestamptz)
language sql security invoker set search_path to ''
as $function$ select * from private.create_shared_task_status_impl(p_errand_id,p_token_hash,p_expires_at) $function$;

create or replace function private.get_shared_task_status_impl(p_token_hash text)
returns table(errand_id uuid,title text,status public.errand_status,pickup_location_text text,destination_location_text text,updated_at timestamptz,scheduled_for timestamptz,expires_at timestamptz)
language sql security definer set search_path to ''
as $function$
  select e.id,e.title,e.status,e.pickup_location_text,e.destination_location_text,e.updated_at,e.scheduled_for,s.expires_at
  from public.shared_task_status s join public.errands e on e.id=s.errand_id
  where s.token_hash=p_token_hash and s.revoked_at is null and s.expires_at>now() limit 1
$function$;

drop function if exists public.get_shared_task_status(text);
create function public.get_shared_task_status(p_token_hash text)
returns table(errand_id uuid,title text,status public.errand_status,pickup_location_text text,destination_location_text text,updated_at timestamptz,scheduled_for timestamptz,expires_at timestamptz)
language sql security invoker set search_path to ''
as $function$ select * from private.get_shared_task_status_impl(p_token_hash) $function$;

create or replace function private.get_route_suggestion_impl(p_pickup_location_id uuid,p_destination_location_id uuid)
returns table(sample_count integer,suggested_fee_kobo bigint,suggested_eta_minutes integer,p90_eta_minutes integer)
language sql security definer set search_path to ''
as $function$
  select dm.sample_count,dm.p50_runner_fee_kobo,
         greatest(10,ceil(dm.p50_travel_seconds/60.0)::integer),
         greatest(10,ceil(dm.p90_travel_seconds/60.0)::integer)
  from public.delivery_metrics dm
  join public.users u on u.campus_id=dm.campus_id
  join public.campus_locations from_loc on from_loc.campus_id=dm.campus_id and from_loc.id=p_pickup_location_id and dm.from_label=from_loc.name
  join public.campus_locations to_loc on to_loc.campus_id=dm.campus_id and to_loc.id=p_destination_location_id and dm.to_label=to_loc.name
  where u.id=auth.uid() and u.is_suspended=false and dm.sample_count>=3
  limit 1
$function$;

drop function if exists public.get_route_suggestion(uuid,uuid);
create function public.get_route_suggestion(p_pickup_location_id uuid,p_destination_location_id uuid)
returns table(sample_count integer,suggested_fee_kobo bigint,suggested_eta_minutes integer,p90_eta_minutes integer)
language sql security invoker set search_path to ''
as $function$ select * from private.get_route_suggestion_impl(p_pickup_location_id,p_destination_location_id) $function$;

create or replace function private.repeat_errand_impl(p_errand_id uuid)
returns uuid language plpgsql security definer set search_path to ''
as $function$
declare uid uuid:=auth.uid(); source public.errands; source_item public.errand_items; new_id uuid;
begin
  if uid is null then raise exception 'Unauthorized'; end if;
  select * into source from public.errands where id=p_errand_id and payer_id=uid and status='COMPLETED'::public.errand_status;
  if source.id is null then raise exception 'Only completed tasks can be repeated'; end if;
  if not exists(select 1 from public.users u where u.id=uid and u.campus_id=source.campus_id and not u.is_suspended) then raise exception 'Account unavailable'; end if;
  select * into source_item from public.errand_items where errand_id=source.id order by created_at asc limit 1;
  new_id:=public.create_errand_v2(source.title,source.description,coalesce(source.pickup_location_text,''),coalesce(source.destination_location_text,''),source.estimated_item_cost_kobo,source.proposed_runner_fee_kobo,source.proposed_eta_minutes,source.delivery_mode,source.delivery_room,null,source_item.name,coalesce(source_item.quantity,1),source.pickup_location_id,source.destination_location_id,source.category::text);
  return new_id;
end;
$function$;

drop function if exists public.repeat_errand(uuid);
create function public.repeat_errand(p_errand_id uuid)
returns uuid language sql security invoker set search_path to ''
as $function$ select private.repeat_errand_impl(p_errand_id) $function$;

revoke execute on function public.create_shared_task_status(uuid,text,timestamptz) from public, anon;
grant execute on function public.create_shared_task_status(uuid,text,timestamptz) to authenticated;
revoke execute on function public.get_shared_task_status(text) from public;
grant execute on function public.get_shared_task_status(text) to anon, authenticated;
revoke execute on function public.get_route_suggestion(uuid,uuid) from public, anon;
grant execute on function public.get_route_suggestion(uuid,uuid) to authenticated;
revoke execute on function public.repeat_errand(uuid) from public, anon;
grant execute on function public.repeat_errand(uuid) to authenticated;
