import { NextRequest } from 'next/server';
import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { ApiError } from '@/lib/api/api-error';
import { readJsonBody, requireString } from '@/lib/api/validation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type MentorRequestRow =
    Database['public']['Tables']['mentor_requests']['Row'];

type MentorRequestStatus = MentorRequestRow['status'];

function handleError(error: unknown) {
    console.error('[mentor_requests api error]', error);

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
   FULL JOIN SELECT
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
        phone,
        branch_id,
        branches:branches (
            id,
            name,
            city
        )
    ),

    mentor:users!mentor_requests_mentor_id_fkey (
        id,
        full_name,
        email,
        avatar_url,
        phone,
        branch_id,
        branches:branches (
            id,
            name,
            city
        )
    ),

    course:courses (
        id,
        code,
        name,
        description
    )
`;

/* =====================================================
   SAFE MAPPER
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
                  branch: row.requester.branches
                      ? {
                            id: row.requester.branches.id,
                            name: row.requester.branches.name,
                            city: row.requester.branches.city,
                        }
                      : null,
              }
            : null,

        mentor: row.mentor
            ? {
                  id: row.mentor.id,
                  name: row.mentor.full_name,
                  email: row.mentor.email,
                  avatar: row.mentor.avatar_url,
                  phone: row.mentor.phone,
                  branch: row.mentor.branches
                      ? {
                            id: row.mentor.branches.id,
                            name: row.mentor.branches.name,
                            city: row.mentor.branches.city,
                        }
                      : null,
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
   GET LIST
===================================================== */
export async function GET(request: NextRequest) {
    try {
        const admin = getSupabaseAdminClient();

        const url = new URL(request.url);
        const status = url.searchParams.get('status');
        const requesterId = url.searchParams.get('requesterId');
        const mentorId = url.searchParams.get('mentorId');

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

        if (mentorId) {
            query = query.eq('mentor_id', mentorId);
        }

        const { data, error } = await query;

        if (error) {
            throw new ApiError(error.message, 500, error);
        }

        return apiSuccess((data ?? []).map(mapRequest));
    } catch (error) {
        return handleError(error);
    }
}

/* =====================================================
   CREATE REQUEST
===================================================== */
export async function POST(request: NextRequest) {
    try {
        const admin = getSupabaseAdminClient();

        const body = await readJsonBody<{
            requesterId: string;
            mentorId: string;
            courseId: string;
        }>(request);

        const { data, error } = await admin
            .from('mentor_requests')
            .insert({
                requester_id: requireString(body.requesterId, 'requesterId'),
                mentor_id: requireString(body.mentorId, 'mentorId'),
                course_id: requireString(body.courseId, 'courseId'),
                status: 'pending' as MentorRequestStatus,
            })
            .select(SELECT)
            .single();

        if (error) {
            throw new ApiError(error.message, 500, error);
        }

        return apiSuccess(mapRequest(data), 201);
    } catch (error) {
        return handleError(error);
    }
}