import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function GET() {
  const s = await createSupabaseServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const { data: profile } = await s.from('users').select('campus_id').eq('id', user.id).single();
  if (!profile?.campus_id) return NextResponse.json({ faculties: [], departments: [] });

  const [f, d] = await Promise.all([
    s.from('faculties').select('id,name,structure_type').eq('campus_id', profile.campus_id).eq('is_active', true).order('name'),
    s.from('academic_departments').select('id,faculty_id,name').eq('campus_id', profile.campus_id).eq('is_active', true).order('name'),
  ]);
  if (f.error || d.error) return NextResponse.json({ error: (f.error || d.error)?.message }, { status: 400 });
  return NextResponse.json({ faculties: f.data || [], departments: d.data || [] });
}
