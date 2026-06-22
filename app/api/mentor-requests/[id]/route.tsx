import { NextRequest } from 'next/server';
import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { ApiError } from '@/lib/api/api-error';
import { readJsonBody, requireString } from '@/lib/api/validation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type RouteContext = {
    params: Promise<{ id: string }>;
};

type MentorRequestUpdate =
    Database['public']['Tables']['mentor_requests']['Update'];

type MentorRequestStatus =
    Database['public']['Tables']['mentor_requests']['Row']['status'];

function handleError(error: unknown) {
    if (error instanceof ApiError) {
        return apiFailure(error.message, error.status, error.details);
    }

    return apiFailure(
        error instanceof Error ? error.message : 'Unexpected error.',
        500,
        error
    );
}

function mapRequest(row: any) {
    return {
        id: row.id,
        requesterId: row.requester_id,
        mentorName: row.mentor_name,
        mentorBranch: row.mentor_branch,
        mentorBirthDate: row.mentor_birth_date ?? null,
        contactInfo: row.contact_info,
        reason: row.reason,
        status: row.status,
        reviewedBy: row.reviewed_by ?? null,
        reviewedAt: row.reviewed_at ?? null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

const SELECT = `
    id,
    requester_id,
    mentor_name,
    mentor_branch,
    mentor_birth_date,
    contact_info,
    reason,
    status,
    reviewed_by,
    reviewed_at,
    created_at,
    updated_at
`;

/* =========================
   GET
========================= */
export async function GET(
    _req: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        const admin = getSupabaseAdminClient();

        const { data, error } = await admin
            .from('mentor_requests')
            .select(SELECT)
            .eq('id', id)
            .single();

        if (error) throw error;

        return apiSuccess(mapRequest(data));
    } catch (error) {
        return handleError(error);
    }
}

/* =========================
   PATCH
========================= */
export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        const admin = getSupabaseAdminClient();

        const body = await readJsonBody<{
            action?: 'approve' | 'reject';
            reviewedBy?: string;
            mentorName?: string;
            mentorBranch?: string;
            mentorBirthDate?: string;
            contactInfo?: string;
            reason?: string;
        }>(request);

        const updatePayload: MentorRequestUpdate = {};

        if (body.action === 'approve') {
            updatePayload.status = 'approved' as MentorRequestStatus;
            updatePayload.reviewed_by = body.reviewedBy ?? null;
            updatePayload.reviewed_at = new Date().toISOString();
        }

        else if (body.action === 'reject') {
            updatePayload.status = 'rejected' as MentorRequestStatus;
            updatePayload.reviewed_by = body.reviewedBy ?? null;
            updatePayload.reviewed_at = new Date().toISOString();
        }

        else {
            if (body.mentorName !== undefined) {
                updatePayload.mentor_name = requireString(body.mentorName, 'mentorName');
            }

            if (body.mentorBranch !== undefined) {
                updatePayload.mentor_branch = body.mentorBranch;
            }

            if (body.mentorBirthDate !== undefined) {
                updatePayload.mentor_birth_date = body.mentorBirthDate;
            }

            if (body.contactInfo !== undefined) {
                updatePayload.contact_info = body.contactInfo;
            }

            if (body.reason !== undefined) {
                updatePayload.reason = body.reason;
            }
        }

        if (Object.keys(updatePayload).length === 0) {
            throw new ApiError('No update fields provided.', 400);
        }

        const { data, error } = await admin
            .from('mentor_requests')
            .update(updatePayload)
            .eq('id', id)
            .select(SELECT)
            .single();

        if (error) throw error;

        return apiSuccess(mapRequest(data));
    } catch (error) {
        return handleError(error);
    }
}

/* =========================
   DELETE
========================= */
export async function DELETE(
    _req: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        const admin = getSupabaseAdminClient();

        const { error } = await admin
            .from('mentor_requests')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return apiSuccess({ deleted: true });
    } catch (error) {
        return handleError(error);
    }
}