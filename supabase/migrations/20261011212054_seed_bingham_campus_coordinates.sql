-- Seed verified coordinates supplied for Bingham University delivery points.
-- The girls' hostel records and Portfolio remain separate named landmarks even though
-- the supplied coordinates place them within a few metres.
update public.campus_locations
set latitude = case id
  when '00000000-0000-0000-0000-000000000235'::uuid then 8.9575145
  when '00000000-0000-0000-0000-000000000211'::uuid then 8.9556177
  when '00000000-0000-0000-0000-000000000212'::uuid then 8.9557211
  when '00000000-0000-0000-0000-000000000213'::uuid then 8.9562473
  when '00000000-0000-0000-0000-000000000230'::uuid then 8.9567044
  else latitude
end,
longitude = case id
  when '00000000-0000-0000-0000-000000000235'::uuid then 7.7021794
  when '00000000-0000-0000-0000-000000000211'::uuid then 7.7037844
  when '00000000-0000-0000-0000-000000000212'::uuid then 7.7041240
  when '00000000-0000-0000-0000-000000000213'::uuid then 7.7050695
  when '00000000-0000-0000-0000-000000000230'::uuid then 7.7038981
  else longitude
end
where campus_id = '00000000-0000-0000-0000-000000000001'::uuid
  and id in (
    '00000000-0000-0000-0000-000000000235'::uuid,
    '00000000-0000-0000-0000-000000000211'::uuid,
    '00000000-0000-0000-0000-000000000212'::uuid,
    '00000000-0000-0000-0000-000000000213'::uuid,
    '00000000-0000-0000-0000-000000000230'::uuid
  );

insert into public.campus_locations
  (campus_id, zone_id, name, location_type, latitude, longitude, is_public, is_active)
select
  '00000000-0000-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000012'::uuid,
  locations.name,
  'HOSTEL',
  locations.latitude,
  locations.longitude,
  true,
  true
from (values
  ('Girls New Hostel 1', 8.9568945::numeric, 7.7028684::numeric),
  ('Girls New Hostel 2', 8.9559281::numeric, 7.7039893::numeric),
  ('Girls New Hostel 3', 8.9557171::numeric, 7.7041147::numeric)
) as locations(name, latitude, longitude)
where not exists (
  select 1 from public.campus_locations existing
  where existing.campus_id = '00000000-0000-0000-0000-000000000001'::uuid
    and lower(existing.name) = lower(locations.name)
);
