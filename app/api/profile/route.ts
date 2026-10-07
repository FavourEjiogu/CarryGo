import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';
export async function PATCH(request: Request) {
  const s = await createSupabaseServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const b = await request.json();
  const patch = {
    display_name: String(b.display_name || '').trim(),
    phone_number: b.phone_number ? String(b.phone_number).trim() : null,
    gender: b.gender || 'UNSPECIFIED',
    faculty_id: b.faculty_id || null,
    department_id: b.department_id || null,
    birthday_month: b.birthday_month || null,
    birthday_day: b.birthday_day || null,
  };
  if (!patch.display_name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  const { data, error } = await s.from('users').update(patch).eq('id', user.id).select('id,username,display_name,email,phone_number,campus_id,role,verification_level,gender,faculty_id,department_id,birthday_month,birthday_day').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await s.from('user_public_profiles').update({ display_name: data.display_name }).eq('user_id', user.id);
  return NextResponse.json({ profile: data });
}
