import { cookies } from 'next/headers';

import { verifyToken } from './jwt';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const token =
    cookieStore.get('access_token')?.value;

  if (!token) {
    return null;
  }

  const payload = verifyToken(token);

  const admin = getSupabaseAdminClient();

  const { data } = await admin
    .from('users')
    .select('*')
    .eq('id', payload.userId)
    .single();
console.log('Current user:', data);
  return data;
}