-- Refine completed route intelligence to prefer actual agreed runner fees
-- and delivery-session duration over the proposed estimates.

create or replace function private.record_completed_route_sample()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  delivery_seconds integer;
  from_name text;
  to_name text;
begin
  if new.status = 'COMPLETED'::public.errand_status
     and old.status is distinct from new.status then
    select cl.name into from_name
    from public.campus_locations cl
    where cl.id = new.pickup_location_id
      and cl.campus_id = new.campus_id;

    select cl.name into to_name
    from public.campus_locations cl
    where cl.id = new.destination_location_id
      and cl.campus_id = new.campus_id;

    select greatest(
      1,
      round(extract(epoch from (ds.ended_at - ds.started_at)))::integer
    ) into delivery_seconds
    from public.delivery_sessions ds
    where ds.errand_id = new.id
      and ds.started_at is not null
      and ds.ended_at is not null
    order by ds.ended_at desc
    limit 1;

    delivery_seconds := coalesce(
      delivery_seconds,
      case
        when new.started_at is not null and new.completed_at is not null and new.completed_at > new.started_at
        then greatest(1, round(extract(epoch from (new.completed_at - new.started_at)))::integer)
        else null
      end
    );

    if delivery_seconds is null then return new; end if;

    insert into public.delivery_route_samples(
      campus_id, errand_id, from_label, to_label, travel_seconds, full_loop_seconds
    )
    values (
      new.campus_id,
      new.id,
      left(coalesce(from_name, new.pickup_location_text, 'Unknown'), 250),
      left(coalesce(to_name, new.destination_location_text, 'Unknown'), 250),
      delivery_seconds,
      delivery_seconds
    )
    on conflict (errand_id) do nothing;

    insert into public.delivery_metrics(
      campus_id, from_label, to_label, sample_count,
      avg_travel_seconds, p50_travel_seconds, p90_travel_seconds,
      avg_runner_fee_kobo, p50_runner_fee_kobo, updated_at
    )
    select
      drs.campus_id,
      drs.from_label,
      drs.to_label,
      count(*)::integer,
      round(avg(drs.travel_seconds))::integer,
      round(percentile_cont(0.50) within group (order by drs.travel_seconds))::integer,
      round(percentile_cont(0.90) within group (order by drs.travel_seconds))::integer,
      round(avg(coalesce(a.runner_fee_kobo, e.proposed_runner_fee_kobo)))::bigint,
      round(percentile_cont(0.50) within group (order by coalesce(a.runner_fee_kobo, e.proposed_runner_fee_kobo)))::bigint,
      now()
    from public.delivery_route_samples drs
    join public.errands e on e.id = drs.errand_id
    left join public.errand_agreements a on a.errand_id = e.id
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
