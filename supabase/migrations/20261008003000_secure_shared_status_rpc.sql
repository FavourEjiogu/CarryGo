-- Restrict shared-status table access to server-side security-definer functions.
-- This avoids requiring the application runtime to carry the Supabase service-role key.

create or replace function public.create_shared_task_status(
  p_errand_id uuid,
  p_token_hash text,
  p_expires_at timestamptz
)
returns table(ok boolean, expires_at timestamptz)
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid:=auth.uid();
  e public.errands;
begin
  if uid is null then raise exception 'Unauthorized'; end if;
  if p_token_hash is null or length(p_token_hash)<>64 then raise exception 'Invalid token'; end if;
  if p_expires_at<=now() or p_expires_at>now()+interval '24 hours' then raise exception 'Invalid expiry'; end if;
  select * into e from public.errands where id=p_errand_id;
  if e.id is null then raise exception 'Task not found'; end if;
  if e.payer_id<>uid and e.runner_id<>uid then raise exception 'Not authorized'; end if;
  if e.status in ('COMPLETED','CANCELLED','EXPIRED','FAILED','DISPUTED','ABANDONED')::public.errand_status[] then raise exception 'Task no longer has live status'; end if;

  update public.shared_task_status set revoked_at=now()
  where errand_id=p_errand_id and created_by=uid and revoked_at is null;

  insert into public.shared_task_status(errand_id,created_by,token_hash,expires_at)
  values(p_errand_id,uid,p_token_hash,p_expires_at);

  return query select true,p_expires_at;
end;
$function$;

create or replace function public.get_shared_task_status(p_token_hash text)
returns table(
  errand_id uuid,
  title text,
  status public.errand_status,
  pickup_location_text text,
  destination_location_text text,
  updated_at timestamptz,
  scheduled_for timestamptz,
  expires_at timestamptz
)
language sql
security definer
set search_path to ''
as $function$
select e.id,e.title,e.status,e.pickup_location_text,e.destination_location_text,e.updated_at,e.scheduled_for,s.expires_at
from public.shared_task_status s
join public.errands e on e.id=s.errand_id
where s.token_hash=p_token_hash and s.revoked_at is null and s.expires_at>now()
limit 1
$function$;

grant execute on function public.create_shared_task_status(uuid,text,timestamptz) to authenticated;
grant execute on function public.get_shared_task_status(text) to anon,authenticated;
