// app/api/auth/me/route.ts
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AuthUser } from '@/types/auth.types';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return apiFailure('Unauthorized', 401);
    }

    const payload = verifyToken(token);
    const admin = getSupabaseAdminClient();

    // users.role is the enum column (ADMIN | MEMBER | PRE_REGISTERED_MENTOR)
    const { data: user } = await admin
      .from('users')
      .select(
        `
        id,
        email,
        full_name,
        status,
        branch_id,
        role
      `
      )
      .eq('id', payload.userId)
      .single();

    if (!user) {
      return apiFailure('Unauthorized', 401);
    }

    const response: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      branchId: user.branch_id,
    };

    return apiSuccess(response);
  } catch {
    return apiFailure('Unauthorized', 401);
  }
}
