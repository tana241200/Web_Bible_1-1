import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { ApiError } from '@/lib/api/api-error';
import { readJsonBody } from '@/lib/api/validation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

function handleError(error: unknown) {
    if (error instanceof ApiError) return apiFailure(error.message, error.status, error.details);
    return apiFailure(error instanceof Error ? error.message : 'Unexpected error.', 500, error);
}

async function getAuthUserId(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    if (!token) return null;
    try {
        const payload = verifyToken(token);
        return payload.userId;
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const userId = await getAuthUserId();
        if (!userId) return apiFailure('Unauthorized', 401);

        const admin = getSupabaseAdminClient();
        const { data, error } = await admin
            .from('users')
            .select('id, email, full_name, birth_date, branch_id, avatar_url, phone, branches ( name )')
            .eq('id', userId)
            .single();

        if (error || !data) return apiFailure('User not found', 404);

        return apiSuccess({
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            birthDate: data.birth_date,
            branchId: data.branch_id,
            branchName: (data.branches as any)?.name ?? null,
            avatarUrl: data.avatar_url,
            phone: data.phone,
        });
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const userId = await getAuthUserId();
        if (!userId) return apiFailure('Unauthorized', 401);

        const admin = getSupabaseAdminClient();
        const body = await readJsonBody<{
            fullName?: string;
            birthDate?: string | null;
            phone?: string | null;
            avatarUrl?: string | null;
        }>(request);

        type UpdatePayload = {
            full_name?: string;
            birth_date?: string | null;
            phone?: string | null;
            avatar_url?: string | null;
        };

        const payload: UpdatePayload = {};
        if (body.fullName !== undefined) payload.full_name = body.fullName;
        if (body.birthDate !== undefined) payload.birth_date = body.birthDate;
        if (body.phone !== undefined) payload.phone = body.phone;
        if (body.avatarUrl !== undefined) payload.avatar_url = body.avatarUrl;

        if (Object.keys(payload).length === 0) throw new ApiError('No fields to update.', 400);

        const { data, error } = await admin
            .from('users')
            .update(payload)
            .eq('id', userId)
            .select('id, email, full_name, birth_date, branch_id, avatar_url, phone, branches ( name )')
            .single();

        if (error) throw error;

        return apiSuccess({
            id: data.id,
            email: data.email,
            fullName: data.full_name,
            birthDate: data.birth_date,
            branchId: data.branch_id,
            branchName: (data.branches as any)?.name ?? null,
            avatarUrl: data.avatar_url,
            phone: data.phone,
        });
    } catch (error) {
        return handleError(error);
    }
}