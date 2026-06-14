// app/api/auth/me/route.ts

import { cookies } from 'next/headers';

import { verifyToken } from '@/lib/auth/jwt';
import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const cookieStore = await cookies();

    const token =
      cookieStore.get('access_token')?.value;

    if (!token) {
      return apiFailure('Unauthorized', 401);
    }

    const payload = verifyToken(token);

    const admin = getSupabaseAdminClient();

    const { data: user } = await admin
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        status,
        branch_id
      `)
      .eq('id', payload.userId)
      .single();

    if (!user) {
      return apiFailure('Unauthorized', 401);
    }

    return apiSuccess({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      branchId: user.branch_id,
    });
  } catch {
    return apiFailure('Unauthorized', 401);
  }
}