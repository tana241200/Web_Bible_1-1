import { NextRequest } from 'next/server';

import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { ApiError } from '@/lib/api/api-error';
import { optionalString, readJsonBody, requireString } from '@/lib/api/validation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { TrainingRelationInput, TrainingRelationRecord } from '@/types/training-link.types';

function mapRelation(row: {
    id: string;
    course_id: string;
    mentor_id: string;
    disciple_id: string;
    start_month: string;
    end_month: string | null;
    status: 'in_progress' | 'completed';
    notes: string | null;
    created_by: string | null;
}, refs: {
    courseNames: Map<string, string>;
    mentorNames: Map<string, string>;
    discipleNames: Map<string, string>;
    branchNames: Map<string, string>;
    branchByUserId: Map<string, string | null>;
}): TrainingRelationRecord {
    return {
        id: row.id,
        courseId: row.course_id,
        courseName: refs.courseNames.get(row.course_id) ?? undefined,
        mentorId: row.mentor_id,
        mentorName: refs.mentorNames.get(row.mentor_id) ?? undefined,
        discipleId: row.disciple_id,
        discipleName: refs.discipleNames.get(row.disciple_id) ?? undefined,
        branchName: (() => {
            const mentorBranchId = refs.branchByUserId.get(row.mentor_id) ?? null;
            return mentorBranchId ? refs.branchNames.get(mentorBranchId) ?? undefined : undefined;
        })(),
        // Expose as startDate / endDate — DB columns remain start_month / end_month
        startDate: row.start_month,
        endDate: row.end_month,
        status: row.status,
        notes: row.notes,
        createdBy: row.created_by,
    };
}

function handleError(error: unknown) {
    if (error instanceof ApiError) {
        return apiFailure(error.message, error.status, error.details);
    }

    const message = error instanceof Error ? error.message : 'Unexpected error.';
    return apiFailure(message, 500, error);
}

async function loadReferences(admin: ReturnType<typeof getSupabaseAdminClient>) {
    const [usersResult, branchesResult, coursesResult] = await Promise.all([
        admin.from('users').select('id, full_name, branch_id'),
        admin.from('branches').select('id, name'),
        admin.from('courses').select('id, name'),
    ]);

    if (usersResult.error) throw usersResult.error;
    if (branchesResult.error) throw branchesResult.error;
    if (coursesResult.error) throw coursesResult.error;

    const branchNames = new Map(
        (branchesResult.data ?? []).map((branch) => [branch.id, branch.name]),
    );
    const branchByUserId = new Map(
        (usersResult.data ?? []).map((user) => [user.id, user.branch_id]),
    );

    return {
        courseNames: new Map((coursesResult.data ?? []).map((course) => [course.id, course.name])),
        mentorNames: new Map((usersResult.data ?? []).map((user) => [user.id, user.full_name])),
        discipleNames: new Map((usersResult.data ?? []).map((user) => [user.id, user.full_name])),
        branchNames,
        branchByUserId,
    };
}

export async function GET(request: NextRequest) {
    try {
        const admin = getSupabaseAdminClient();
        const url = new URL(request.url);
        const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';
        const mentorId = url.searchParams.get('mentorId');
        const discipleId = url.searchParams.get('discipleId');
        const courseId = url.searchParams.get('courseId');

        const [relationsResult, refs] = await Promise.all([
            admin.from('training_links').select('*').order('start_month', { ascending: false }),
            loadReferences(admin),
        ]);

        if (relationsResult.error) throw relationsResult.error;

        const filtered = (relationsResult.data ?? []).filter((relation) => {
            if (mentorId && relation.mentor_id !== mentorId) return false;
            if (discipleId && relation.disciple_id !== discipleId) return false;
            if (courseId && relation.course_id !== courseId) return false;

            if (!search) return true;

            const mentorName = refs.mentorNames.get(relation.mentor_id) ?? '';
            const discipleName = refs.discipleNames.get(relation.disciple_id) ?? '';
            const courseName = refs.courseNames.get(relation.course_id) ?? '';
            const mentorBranchId = refs.branchByUserId.get(relation.mentor_id) ?? null;
            const branchName = mentorBranchId ? refs.branchNames.get(mentorBranchId) ?? '' : '';

            return [mentorName, discipleName, courseName, branchName, relation.created_by]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(search));
        });

        return apiSuccess(filtered.map((relation) => mapRelation(relation, refs)));
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = getSupabaseAdminClient();
        const body = await readJsonBody<Partial<TrainingRelationInput>>(request);

        const payload = {
            course_id: requireString(body.courseId, 'courseId'),
            mentor_id: requireString(body.mentorId, 'mentorId'),
            disciple_id: requireString(body.discipleId, 'discipleId'),
            // Accept startDate from client; map to DB column start_month
            start_month: requireString(body.startDate, 'startDate'),
            // Accept endDate from client; map to DB column end_month
            end_month: optionalString(body.endDate),
            status: body.status ?? 'in_progress',
            notes: optionalString(body.notes),
            created_by: body.createdBy ?? null,
        };

        const { data, error } = await admin
            .from('training_links')
            .insert(payload)
            .select('*')
            .single();

        if (error) throw error;

        const refs = await loadReferences(admin);
        return apiSuccess(mapRelation(data, refs), 201);
    } catch (error) {
        return handleError(error);
    }
}
