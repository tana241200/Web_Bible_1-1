import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { comparePassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import type { RoleCode } from '@/types/auth.types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const admin = getSupabaseAdminClient();

        // users không có cột role — join user_roles -> roles để lấy danh sách roles
        const { data: user, error } = await admin
            .from('users')
            .select(`
                *,
                user_roles (
                    role:roles ( id, code, name )
                )
            `)
            .eq('email', email)
            .single();

        if (error || !user) {
            return apiFailure('Invalid email or password', 401);
        }

        const validPassword = await comparePassword(password, user.password_hash);
        if (!validPassword) {
            return apiFailure('Invalid email or password', 401);
        }

        if (user.status !== 'active') {
            return apiFailure('Your account has not been approved yet.', 403);
        }

        const roles = (user.user_roles ?? [])
            .map((ur: any) => ur.role?.code)
            .filter((code: any): code is RoleCode => Boolean(code));

        const token = signToken({ userId: user.id, email: user.email, roles });

        const cookieStore = await cookies();
        cookieStore.set('access_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7,
        });

        return apiSuccess({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                roles,
            },
        });
    } catch (error) {
        return apiFailure(
            error instanceof Error ? error.message : 'Unexpected error',
            500,
        );
    }
}
