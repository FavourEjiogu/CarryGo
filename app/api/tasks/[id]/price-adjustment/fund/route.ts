import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (!body.adjustment_id) return NextResponse.json({ error: 'adjustment_id is required' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const { data: adjustment } = await supabase
    .from('price_adjustments')
    .select('id,errand_id,status')
    .eq('id', body.adjustment_id)
    .eq('errand_id', id)
    .single();

  if (!adjustment || adjustment.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Adjustment not ready.' }, { status: 409 });
  }

  const { data, error } = await supabase.rpc('fund_price_variance_from_wallet', {
    p_adjustment_id: adjustment.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
