import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';
import { CAMPUS_ID, ROOM_PREMIUM_KOBO, serviceFee } from '@/src/lib/app-config';

function isOpen() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const hour = Number(parts.find(p => p.type === 'hour')?.value || 0);
  return hour >= 5 && hour < 22;
}
export async function GET(request: Request) {
  const s = await createSupabaseServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const url = new URL(request.url);
  const mine = url.searchParams.get('mine') === '1';
  let q = s.from('errands').select('id,title,description,category,estimated_item_cost_kobo,proposed_runner_fee_kobo,proposed_eta_minutes,payer_deadline_at,runner_preference,delivery_mode,delivery_room,scheduled_for,same_gender_premium_kobo,status,created_at,pickup_location_text,destination_location_text,payer_id,runner_id,service_fee_kobo,service_fee_discount_kobo').order('created_at', { ascending: false }).limit(50);
  q = mine ? q.or('payer_id.eq.' + user.id + ',runner_id.eq.' + user.id) : q.in('status', ['OPEN', 'NEGOTIATING']);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ tasks: data || [], open: isOpen() });
}
export async function POST(request: Request) {
  const s = await createSupabaseServerClient();
  const { data: { user } } = await s.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  if (!isOpen()) return NextResponse.json({ error: 'CarryGo is sleeping. New tasks open at 5:00 AM.' }, { status: 409 });
  const b = await request.json();
  const title = String(b.title || '').trim();
  const description = String(b.description || '').trim();
  const pickup = String(b.pickup_location_text || '').trim();
  const destination = String(b.destination_location_text || '').trim();
  const item = Math.max(0, Math.round(Number(b.estimated_item_cost_kobo || 0)));
  const fee = Math.max(0, Math.round(Number(b.proposed_runner_fee_kobo || 0)));
  const eta = Math.max(10, Math.min(240, Math.round(Number(b.proposed_eta_minutes || 30))));
  const mode = b.delivery_mode === 'ROOM' ? 'ROOM' : b.delivery_mode === 'HOSTEL' ? 'HOSTEL' : 'LANDMARK';
  const room = mode === 'ROOM' ? String(b.delivery_room || '').trim() : null;
  const when = b.scheduled_for ? new Date(b.scheduled_for) : null;
  const { data: me } = await s.from('users').select('campus_id,gender,is_suspended').eq('id', user.id).single();
  if (!me || me.is_suspended) return NextResponse.json({ error: 'Account unavailable.' }, { status: 403 });
  if (!title || !description || !pickup || !destination || fee <= 0) return NextResponse.json({ error: 'Complete the task details.' }, { status: 400 });
  if (mode === 'ROOM' && (!room || !me.gender || me.gender === 'UNSPECIFIED')) return NextResponse.json({ error: 'Room delivery needs your gender and room number.' }, { status: 400 });
  if (when && (Number.isNaN(when.getTime()) || when.getTime() < Date.now())) return NextResponse.json({ error: 'Choose a future delivery time.' }, { status: 400 });
  const premium = mode === 'ROOM' ? ROOM_PREMIUM_KOBO : 0;
  const { data: task, error } = await s.from('errands').insert({
    campus_id: me.campus_id || CAMPUS_ID, payer_id: user.id, category: b.category || 'BUY_AND_BRING',
    title, description, estimated_item_cost_kobo: item, proposed_runner_fee_kobo: fee, proposed_eta_minutes: eta,
    hard_max_total_kobo: item + fee + premium, payer_deadline_at: when ? when.toISOString() : null,
    price_guard_mode: 'STRICT', auto_approve_variance_kobo: 0, trust_requirement: 'ANY_ELIGIBLE', status: 'OPEN',
    runner_preference: mode === 'ROOM' ? 'SAME_GENDER_REQUIRED' : 'ANY', delivery_mode: mode, delivery_room: room,
    scheduled_for: when ? when.toISOString() : null, same_gender_premium_kobo: premium,
    pickup_location_text: pickup, destination_location_text: destination, service_fee_kobo: serviceFee(fee),
    service_fee_discount_kobo: 0, discount_percent_used: 0,
  }).select('id,title,status,delivery_mode,delivery_room,same_gender_premium_kobo').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { error: itemError } = await s.from('errand_items').insert({ errand_id: task.id, name: title, quantity: 1, estimated_unit_cost_kobo: item, notes: description });
  if (itemError) return NextResponse.json({ error: itemError.message }, { status: 500 });
  await s.from('funnel_events').insert({ campus_id: me.campus_id || CAMPUS_ID, user_id: user.id, errand_id: task.id, event_name: 'TASK_CREATED', metadata: { mode, scheduled: !!when } });
  return NextResponse.json({ task }, { status: 201 });
}
