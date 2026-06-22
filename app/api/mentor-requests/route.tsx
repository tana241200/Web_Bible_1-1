import { NextRequest } from 'next/server';
import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { ApiError } from '@/lib/api/api-error';
import { readJsonBody, requireString } from '@/lib/api/validation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type MentorRequestRow =
    Database['public']['Tables']['mentor_requests']['Row'];

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

function mapRequest(row: MentorRequestRow) {
    return {
        id: row.id,
        requesterId: row.requester_id,
        mentorName: row.mentor_name,
        mentorBranch: row.mentor_branch,
        mentorBirthDate: row.mentor_birth_date,
        contactInfo: row.contact_info,
        reason: row.reason,
        status: row.status,
        reviewedBy: row.reviewed_by,
        reviewedAt: row.reviewed_at,
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
   GET LIST
========================= */
export async function GET(request: NextRequest) {
    try {
        const admin = getSupabaseAdminClient();

        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const requesterId = url.searchParams.get('requesterId');

        let query = admin
            .from('mentor_requests')
            .select(SELECT)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status as MentorRequestStatus);
        }

        if (requesterId) {
            query = query.eq('requester_id', requesterId);
        }

        const { data, error } = await query;

        if (error) throw error;

        return apiSuccess((data ?? []).map(mapRequest));
    } catch (error) {
        return handleError(error);
    }
}

/* =========================
   CREATE
========================= */
export async function POST(request: NextRequest) {
    try {
        const admin = getSupabaseAdminClient();

        const body = await readJsonBody<{
            mentorName: string;
            mentorBranch: string;
            mentorBirthDate?: string;
            contactInfo: string;
            reason: string;
            requesterId?: string;
        }>(request);

        const { data, error } = await admin
            .from('mentor_requests')
            .insert({
                mentor_name: requireString(body.mentorName, 'mentorName'),
                mentor_branch: requireString(body.mentorBranch, 'mentorBranch'),
                mentor_birth_date: body.mentorBirthDate,
                contact_info: requireString(body.contactInfo, 'contactInfo'),
                reason: requireString(body.reason, 'reason'),
                requester_id: body.requesterId,
                status: 'pending' as MentorRequestStatus, // ✅ FIX HERE
            })
            .select(SELECT)
            .single();

        if (error) throw error;

        return apiSuccess(mapRequest(data), 201);
    } catch (error) {
        return handleError(error);
    }
}