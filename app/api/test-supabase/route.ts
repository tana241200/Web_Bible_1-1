// app/api/test-supabase/route.ts

import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase.auth.admin.listUsers();

    return NextResponse.json({
      success: !error,
      userCount: data?.users?.length ?? 0,
      error,
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: e instanceof Error ? e.message : String(e),
    });
  }
}