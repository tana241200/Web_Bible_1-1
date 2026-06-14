// app/api/auth/logout/route.ts

import { cookies } from 'next/headers';
import { apiSuccess } from '@/lib/api/api-response';

export async function POST() {
  const cookieStore = await cookies();

  cookieStore.delete('access_token');

  return apiSuccess({
    success: true,
  });
}