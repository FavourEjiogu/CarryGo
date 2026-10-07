-- CarryGo intelligence foundation
-- Applied in Supabase as 20261008001000_add_carrygo_intelligence

create table if not exists public.shared_task_status (
  id uuid primary key default gen_random_uuid(),
  errand_id uuid not null references public.errands(id) on delete cascade,
  created_by uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists shared_task_status_errand_idx on public.shared_task_status(errand_id, created_at desc);
create index if not exists shared_task_status_expiry_idx on public.shared_task_status(expires_at);
alter table public.shared_task_status enable row level security;
drop policy if exists shared_task_status_internal_deny_all on public.shared_task_status;
create policy shared_task_status_internal_deny_all on public.shared_task_status for all to public using (false) with check (false);

alter table public.delivery_metrics
  add column if not exists avg_runner_fee_kobo bigint,
  add column if not exists p50_runner_fee_kobo bigint;
create unique index if not exists delivery_metrics_route_unique_idx on public.delivery_metrics(campus_id, from_label, to_label);

create or replace function private.record_completed_route_sample()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  travel_seconds integer;
  from_name text;
  to_name text;
begin
  if new.status = 'COMPLETED'::public.errand_status
     and old.status is distinct from new.status
     and new.started_at is not null
     and new.completed_at is not null
     and new.completed_at > new.started_at then
    travel_seconds := greatest(1, round(extract(epoch from (new.completed_at - new.started_at)))::integer);

    select cl.name into from_name
    from public.campus_locations cl
    where cl.id = new.pickup_location_id and cl.campus_id = new.campus_id;

    select cl.name into to_name
    from public.campus_locations cl
    where cl.id = new.destination_location_id and cl.campus_id = new.campus_id;

    insert into public.delivery_route_samples(campus_id, errand_id, from_label, to_label, travel_seconds, full_loop_seconds)
    values (
      new.campus_id, new.id,
      left(coalesce(from_name, new.pickup_location_text, 'Unknown'), 250),
      left(coalesce(to_name, new.destination_location_text, 'Unknown'), 250),
      travel_seconds, travel_seconds
    )
    on conflict (errand_id) do nothing;

    insert into public.delivery_metrics(
      campus_id, from_label, to_label, sample_count,
      avg_travel_seconds, p50_travel_seconds, p90_travel_seconds,
      avg_runner_fee_kobo, p50_runner_fee_kobo, updated_at
    )
    select
      drs.campus_id, drs.from_label, drs.to_label, count(*)::integer,
      round(avg(drs.travel_seconds))::integer,
      round(percentile_cont(0.50) within group (order by drs.travel_seconds))::integer,
      round(percentile_cont(0.90) within group (order by drs.travel_seconds))::integer,
      round(avg(e.proposed_runner_fee_kobo))::bigint,
      round(percentile_cont(0.50) within group (order by e.proposed_runner_fee_kobo))::bigint,
      now()
    from public.delivery_route_samples drs
    join public.errands e on e.id = drs.errand_id
    where drs.campus_id = new.campus_id
      and drs.from_label = left(coalesce(from_name, new.pickup_location_text, 'Unknown'), 250)
      and drs.to_label = left(coalesce(to_name, new.destination_location_text, 'Unknown'), 250)
      and drs.travel_seconds is not null
      and e.status = 'COMPLETED'::public.errand_status
    group by drs.campus_id, drs.from_label, drs.to_label
    on conflict (campus_id, from_label, to_label)
    do update set
      sample_count = excluded.sample_count,
      avg_travel_seconds = excluded.avg_travel_seconds,
      p50_travel_seconds = excluded.p50_travel_seconds,
      p90_travel_seconds = excluded.p90_travel_seconds,
      avg_runner_fee_kobo = excluded.avg_runner_fee_kobo,
      p50_runner_fee_kobo = excluded.p50_runner_fee_kobo,
      updated_at = now();
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_record_completed_route_sample on public.errands;
create trigger trg_record_completed_route_sample
after update of status on public.errands
for each row execute function private.record_completed_route_sample();

create or replace function private.create_errand_impl_v2(
  p_title text,p_description text,p_pickup text,p_destination text,
  p_item_cost_kobo bigint,p_runner_fee_kobo bigint,p_eta_minutes integer,
  p_delivery_mode text,p_delivery_room text,p_scheduled_for timestamptz,
  p_item_name text,p_quantity numeric,p_pickup_location_id uuid,
  p_destination_location_id uuid,p_category text
)
returns uuid language plpgsql security definer set search_path to ''
as $function$
declare
  uid uuid := auth.uid();
  u public.users;
  e_id uuid;
  premium bigint := 0;
  item_label text;
  normalized_category public.task_category;
begin
  if uid is null then raise exception 'Unauthorized'; end if;
  select * into u from public.users where id=uid;
  if u.id is null or u.is_suspended then raise exception 'Account unavailable'; end if;
  if u.campus_id is null then raise exception 'Campus unavailable'; end if;
  if length(trim(coalesce(p_title,'')))=0 or length(trim(coalesce(p_description,'')))=0 then raise exception 'Task details are required'; end if;
  if length(trim(coalesce(p_pickup,'')))=0 or length(trim(coalesce(p_destination,'')))=0 then raise exception 'Pickup and destination are required'; end if;
  if p_item_cost_kobo<0 or p_runner_fee_kobo<=0 then raise exception 'Invalid amount'; end if;
  if p_eta_minutes<10 or p_eta_minutes>240 then raise exception 'Invalid ETA'; end if;
  if p_delivery_mode not in ('LANDMARK','HOSTEL','ROOM') then raise exception 'Invalid delivery mode'; end if;
  if coalesce(p_quantity,1)<=0 or p_quantity>1000 then raise exception 'Invalid quantity'; end if;
  begin normalized_category := coalesce(nullif(p_category,''),'OTHER')::public.task_category;
  exception when invalid_text_representation then raise exception 'Invalid task category'; end;

  if p_pickup_location_id is not null and not exists (
    select 1 from public.campus_locations cl where cl.id=p_pickup_location_id and cl.campus_id=u.campus_id and cl.is_public and cl.is_active
  ) then raise exception 'Pickup location is not available on this campus'; end if;
  if p_destination_location_id is not null and not exists (
    select 1 from public.campus_locations cl where cl.id=p_destination_location_id and cl.campus_id=u.campus_id and cl.is_public and cl.is_active
  ) then raise exception 'Destination location is not available on this campus'; end if;

  if p_delivery_mode='ROOM' then
    if coalesce(u.gender,'UNSPECIFIED')='UNSPECIFIED' or length(trim(coalesce(p_delivery_room,'')))=0 then raise exception 'Room delivery needs gender and room'; end if;
    premium := 15000;
  end if;
  if p_scheduled_for is not null and p_scheduled_for<now() then raise exception 'Scheduled time must be in the future'; end if;
  if ((now() at time zone 'Africa/Lagos')::time>=time '22:00' or (now() at time zone 'Africa/Lagos')::time<time '05:00') and p_delivery_mode='LANDMARK' then raise exception 'From 10 PM to 5 AM, CarryGo only accepts hostel delivery'; end if;
  if p_scheduled_for is not null
     and (((p_scheduled_for at time zone 'Africa/Lagos')::time>=time '22:00') or ((p_scheduled_for at time zone 'Africa/Lagos')::time<time '05:00'))
     and p_delivery_mode='LANDMARK' then raise exception 'Scheduled landmark delivery is unavailable from 10 PM to 5 AM'; end if;

  item_label := left(trim(coalesce(nullif(p_item_name,''),p_title)),160);
  insert into public.errands(
    campus_id,payer_id,category,title,description,pickup_location_id,destination_location_id,
    estimated_item_cost_kobo,proposed_runner_fee_kobo,proposed_eta_minutes,hard_max_total_kobo,
    payer_deadline_at,price_guard_mode,auto_approve_variance_kobo,trust_requirement,status,
    runner_preference,delivery_mode,delivery_room,scheduled_for,same_gender_premium_kobo,
    pickup_location_text,destination_location_text,service_fee_kobo,service_fee_discount_kobo,discount_percent_used
  ) values(
    u.campus_id,uid,normalized_category,left(trim(p_title),160),left(trim(p_description),2000),
    p_pickup_location_id,p_destination_location_id,p_item_cost_kobo,p_runner_fee_kobo,p_eta_minutes,
    p_item_cost_kobo+p_runner_fee_kobo+premium,p_scheduled_for,'STRICT',0,'ANY_ELIGIBLE','OPEN',
    case when p_delivery_mode='ROOM' then 'SAME_GENDER_REQUIRED' else 'ANY' end,p_delivery_mode,
    nullif(left(trim(coalesce(p_delivery_room,'')),80),''),p_scheduled_for,premium,
    left(trim(p_pickup),250),left(trim(p_destination),250),
    least(15000::bigint,greatest(2000::bigint,round(p_runner_fee_kobo*5/100.0))),0,0
  ) returning id into e_id;

  insert into public.errand_items(errand_id,name,quantity,estimated_unit_cost_kobo,notes)
  values(e_id,item_label,p_quantity,case when p_quantity>0 then round(p_item_cost_kobo/p_quantity) else p_item_cost_kobo end,left(trim(p_description),2000));

  insert into public.funnel_events(campus_id,user_id,errand_id,event_name,metadata)
  values(u.campus_id,uid,e_id,'TASK_CREATED',jsonb_build_object(
    'delivery_mode',p_delivery_mode,'scheduled',p_scheduled_for is not null,
    'understanding_version','v2','canonical_pickup',p_pickup_location_id is not null,
    'canonical_destination',p_destination_location_id is not null
  ));
  return e_id;
end;
$function$;

create or replace function public.create_errand_v2(
  p_title text,p_description text,p_pickup text,p_destination text,p_item_cost_kobo bigint,
  p_runner_fee_kobo bigint,p_eta_minutes integer,p_delivery_mode text,p_delivery_room text,
  p_scheduled_for timestamptz,p_item_name text,p_quantity numeric,p_pickup_location_id uuid,
  p_destination_location_id uuid,p_category text
)
returns uuid language sql security invoker set search_path to ''
as $function$
select private.create_errand_impl_v2(
  p_title,p_description,p_pickup,p_destination,p_item_cost_kobo,p_runner_fee_kobo,p_eta_minutes,
  p_delivery_mode,p_delivery_room,p_scheduled_for,p_item_name,p_quantity,p_pickup_location_id,
  p_destination_location_id,p_category
)
$function$;

create or replace function public.repeat_errand(p_errand_id uuid)
returns uuid language plpgsql security definer set search_path to ''
as $function$
declare
  uid uuid:=auth.uid();
  source public.errands;
  source_item public.errand_items;
  new_id uuid;
begin
  if uid is null then raise exception 'Unauthorized'; end if;
  select * into source from public.errands where id=p_errand_id and payer_id=uid and status='COMPLETED'::public.errand_status;
  if source.id is null then raise exception 'Only completed tasks can be repeated'; end if;
  if not exists(select 1 from public.users u where u.id=uid and u.campus_id=source.campus_id and not u.is_suspended) then raise exception 'Account unavailable'; end if;
  select * into source_item from public.errand_items where errand_id=source.id order by created_at asc limit 1;
  new_id:=public.create_errand_v2(
    source.title,source.description,coalesce(source.pickup_location_text,''),coalesce(source.destination_location_text,''),
    source.estimated_item_cost_kobo,source.proposed_runner_fee_kobo,source.proposed_eta_minutes,
    source.delivery_mode,source.delivery_room,null,source_item.name,coalesce(source_item.quantity,1),
    source.pickup_location_id,source.destination_location_id,source.category::text
  );
  return new_id;
end;
$function$;

grant execute on function public.create_errand_v2(text,text,text,text,bigint,bigint,integer,text,text,timestamptz,text,numeric,uuid,uuid,text) to authenticated;
grant execute on function public.repeat_errand(uuid) to authenticated;

create or replace function public.get_route_suggestion(p_pickup_location_id uuid,p_destination_location_id uuid)
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
grant execute on function public.get_route_suggestion(uuid,uuid) to authenticated;
