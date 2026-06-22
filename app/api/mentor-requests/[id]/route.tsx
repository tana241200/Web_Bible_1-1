import { NextRequest } from 'next/server';
import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { ApiError } from '@/lib/api/api-error';
import { readJsonBody } from '@/lib/api/validation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

/* =====================================================
   ROUTE CONTEXT (FIXED: params is Promise in Next.js)
===================================================== */
type RouteContext = {
    params: Promise<{ id: string }>;
};

type MentorRequestRow =
    Database['public']['Tables']['mentor_requests']['Row'];

type MentorRequestUpdate =
    Database['public']['Tables']['mentor_requests']['Update'];

type MentorRequestStatus = MentorRequestRow['status'];

/* =====================================================
   ERROR HANDLER
===================================================== */
function handleError(error: unknown) {
    console.error('[mentor_requests error]', error);

    if (error instanceof ApiError) {
        return apiFailure(error.message, error.status, error.details);
    }

    return apiFailure(
        error instanceof Error ? error.message : 'Unexpected error.',
        500,
        error
    );
}

/* =====================================================
   FULL SELECT
===================================================== */
const SELECT = `
    id,
    requester_id,
    mentor_id,
    course_id,
    status,
    created_at,
    updated_at,

    requester:users!mentor_requests_requester_id_fkey (
        id,
        full_name,
        email,
        avatar_url,
        phone
    ),

    mentor:users!mentor_requests_mentor_id_fkey (
        id,
        full_name,
        email,
        avatar_url,
        phone
    ),

    course:courses (
        id,
        code,
        name,
        description
    )
`;

/* =====================================================
   MAPPER
===================================================== */
function mapRequest(row: any) {
    if (!row) return null;

    return {
        id: row.id,
        status: row.status,

        createdAt: row.created_at,
        updatedAt: row.updated_at ?? null,

        requester: row.requester
            ? {
                  id: row.requester.id,
                  name: row.requester.full_name,
                  email: row.requester.email,
                  avatar: row.requester.avatar_url,
                  phone: row.requester.phone,
              }
            : null,

        mentor: row.mentor
            ? {
                  id: row.mentor.id,
                  name: row.mentor.full_name,
                  email: row.mentor.email,
                  avatar: row.mentor.avatar_url,
                  phone: row.mentor.phone,
              }
            : null,

        course: row.course
            ? {
                  id: row.course.id,
                  code: row.course.code,
                  name: row.course.name,
                  description: row.course.description,
              }
            : null,
    };
}

/* =====================================================
   GET BY ID
===================================================== */
export async function GET(_req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const admin = getSupabaseAdminClient();

        const { data, error } = await admin
            .from('mentor_requests')
            .select(SELECT)
            .eq('id', id)
            .maybeSingle();

        if (error) throw new ApiError(error.message, 500, error);
        if (!data) throw new ApiError('Mentor request not found', 404);

        return apiSuccess(mapRequest(data));
    } catch (error) {
        return handleError(error);
    }
}

/* =====================================================
   PATCH (approve / reject)
===================================================== */
export async function PATCH(request: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const admin = getSupabaseAdminClient();

        const body = await readJsonBody<{
            action: 'approve' | 'reject';
            reviewedBy: string;
        }>(request);

        const updatePayload: MentorRequestUpdate = {
            reviewed_by: body.reviewedBy,
            reviewed_at: new Date().toISOString(),
        };

        if (body.action === 'approve') {
            updatePayload.status = 'approved' as MentorRequestStatus;
        }

        if (body.action === 'reject') {
            updatePayload.status = 'rejected' as MentorRequestStatus;
        }

        const { data, error } = await admin
            .from('mentor_requests')
            .update(updatePayload)
            .eq('id', id)
            .select(SELECT)
            .maybeSingle();

        if (error) throw new ApiError(error.message, 500, error);
        if (!data) throw new ApiError('Mentor request not found', 404);

        return apiSuccess(mapRequest(data));
    } catch (error) {
        return handleError(error);
    }
}

/* =====================================================
   DELETE
===================================================== */
export async function DELETE(_req: NextRequest, context: RouteContext) {
    try {
        const { id } = await context.params;

        const admin = getSupabaseAdminClient();

        const { error } = await admin
            .from('mentor_requests')
            .delete()
            .eq('id', id);

        if (error) throw new ApiError(error.message, 500, error);

        return apiSuccess({ deleted: true });
    } catch (error) {
        return handleError(error);
    }
}