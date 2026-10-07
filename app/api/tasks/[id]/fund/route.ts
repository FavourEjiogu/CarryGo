import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const body = await request.json();
  const discount = Math.max(0, Math.min(100, Math.round(Number(body.discount_percent || 0))));
  const pin = String(body.handoff_pin || '');

  const { data, error } = await supabase.rpc('fund_errand_from_wallet', {
    p_errand_id: id,
    p_discount_percent: discount,
    p_handoff_pin: pin,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
