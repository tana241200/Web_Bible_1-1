// app/api/auth/register/route.ts
import bcrypt from 'bcryptjs';
import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName, birthDate, branchId, phone } = body;

    if (!email) {
      return apiFailure('Email is required', 400);
    }
    if (!password) {
      return apiFailure('Password is required', 400);
    }
    if (!fullName) {
      return apiFailure('Full name is required', 400);
    }

    const admin = getSupabaseAdminClient();

    const { data: existingUser } = await admin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      return apiFailure('Email already exists', 400);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // users.role is an enum column on the users table (ADMIN | MEMBER | PRE_REGISTERED_MENTOR)
    // New self-registrations always get the MEMBER role
    const { data, error } = await admin
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
        birth_date: birthDate || null,
        branch_id: branchId || null,
        phone: phone || null,
        role: 'MEMBER',
        status: 'pending',
      })
      .select(
        `
        id,
        email,
        full_name,
        role,
        status
      `
      )
      .single();

    if (error) {
      throw error;
    }

    return apiSuccess(
      {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        role: data.role,
        status: data.status,
      },
      201
    );
  } catch (error) {
    console.error(error);
    return apiFailure(
      error instanceof Error ? error.message : 'Unexpected error',
      500
    );
  }
}
