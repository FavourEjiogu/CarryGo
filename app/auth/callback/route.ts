import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/lib/supabase/server';
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login?error=missing_code', url.origin));
  const supabase = await createSupabaseServerClient();
  const result = await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL(result.error ? '/login?error=auth_failed' : '/do', url.origin));
}
