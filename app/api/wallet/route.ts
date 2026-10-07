import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function GET() {
  const s = await createSupabaseServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const { data, error } = await s.rpc('get_wallet_summary', { p_user_id: user.id });
  if (error) return NextResponse.json({ error: 'Could not load wallet.' }, { status: 400 });
  return NextResponse.json({ wallet: data || null });
}
