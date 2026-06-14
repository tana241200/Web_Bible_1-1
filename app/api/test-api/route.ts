// app/api/test-env/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishable: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    serviceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
}