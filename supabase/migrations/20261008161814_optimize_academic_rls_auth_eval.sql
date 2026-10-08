drop policy if exists faculties_read on public.faculties;
create policy faculties_read
on public.faculties
for select
to authenticated
using (
  is_active = true
  and campus_id = (
    select u.campus_id
    from public.users u
    where u.id = (select auth.uid())
  )
);

drop policy if exists departments_read on public.academic_departments;
create policy departments_read
on public.academic_departments
for select
to authenticated
using (
  is_active = true
  and campus_id = (
    select u.campus_id
    from public.users u
    where u.id = (select auth.uid())
  )
);