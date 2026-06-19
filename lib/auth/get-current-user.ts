import { cookies } from 'next/headers';

import { verifyToken } from './jwt';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { AuthUser, RoleCode } from '@/types/auth.types';

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return null;
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return null;
  }

  const admin = getSupabaseAdminClient();

  // users no longer have a `role` column — roles come from the
  // user_roles -> roles RBAC join (see seed2.sql / database.types.ts).
  const { data } = await admin
    .from('users')
    .select(`
      id, email, full_name, branch_id,
      user_roles ( role:roles ( code ) )
    `)
    .eq('id', payload.userId)
    .single();

  if (!data) {
    return null;
  }

  const roles = (data.user_roles ?? [])
    .map((ur: any) => ur.role?.code)
    .filter((code: any): code is RoleCode => Boolean(code));

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    roles,
    branchId: data.branch_id,
  };
}
