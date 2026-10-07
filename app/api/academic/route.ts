import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function GET(request: Request) {
  const s = await createSupabaseServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const url = new URL(request.url);
  const requestedCampusId = url.searchParams.get('campus_id');
  const { data: profile } = await s.from('users').select('campus_id').eq('id', user.id).single();
  const campusId = requestedCampusId || profile?.campus_id;
  if (!campusId) return NextResponse.json({ faculties: [], departments: [] });

  const { data: campus } = await s.from('campuses').select('id').eq('id', campusId).eq('is_active', true).maybeSingle();
  if (!campus) return NextResponse.json({ error: 'Campus is not available' }, { status: 404 });

  const [f, d] = await Promise.all([
    s.from('faculties').select('id,name,structure_type').eq('campus_id', campusId).eq('is_active', true).order('name'),
    s.from('academic_departments').select('id,faculty_id,name').eq('campus_id', campusId).eq('is_active', true).order('name'),
  ]);
  if (f.error || d.error) return NextResponse.json({ error: (f.error || d.error)?.message }, { status: 400 });
  return NextResponse.json({ faculties: f.data || [], departments: d.data || [] }, { headers: { 'Cache-Control': 'private, max-age=60' } });
}
