import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  if (!body.bid_id) return NextResponse.json({ error: 'bid_id is required' }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

  const { data, error } = await supabase.rpc('accept_errand_bid', { p_bid_id: body.bid_id });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ errand_id: data, redirect: '/fund/' + id });
}
