import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';
export async function GET() {
  const s = await createSupabaseServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ authenticated: false }, { status: 401 });
  await s.rpc('sync_streak_benefits', { p_user_id: user.id });
  const [p, streak, credit, wallet] = await Promise.all([
    s.from('users').select('id,username,display_name,email,phone_number,campus_id,role,verification_level,gender,faculty_id,department_id,birthday_month,birthday_day').eq('id', user.id).single(),
    s.from('user_streaks').select('*').eq('user_id', user.id).single(),
    s.from('user_credits').select('balance_kobo').eq('user_id', user.id).maybeSingle(),
    s.rpc('get_wallet_summary', { p_user_id: user.id }),
  ]);
  return NextResponse.json({ user: { id: user.id, email: user.email }, profile: p.data, streak: streak.data, credit_kobo: Number(credit.data?.balance_kobo || 0), wallet: wallet.data || null });
}
