import { NextRequest } from 'next/server';
import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { ApiError } from '@/lib/api/api-error';
import { requireString } from '@/lib/api/validation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { TreeLinkRecord, TreeMemberRecord, TreeResponse } from '@/types/tree.types';

function handleError(error: unknown) {
    if (error instanceof ApiError) return apiFailure(error.message, error.status, error.details);
    return apiFailure(error instanceof Error ? error.message : 'Unexpected error.', 500, error);
}

function mapMember(row: {
    id: string; full_name: string; email: string;
    birth_date: string | null; branch_id: string | null;
    user_roles?: { role: { code: string } | null }[];
}, branchNames: Map<string, string>): TreeMemberRecord {
    const roles = (row.user_roles ?? []).map((ur) => ur.role?.code).filter(Boolean) as string[];
    return {
        id: row.id, fullName: row.full_name, email: row.email,
        roles, birthDate: row.birth_date, branchId: row.branch_id,
        branchName: row.branch_id ? branchNames.get(row.branch_id) : undefined,
    };
}

function mapLink(row: {
    id: string; mentor_id: string; disciple_id: string;
    start_date: string; end_date: string | null; status: 'in_progress' | 'completed';
}): TreeLinkRecord {
    return {
        id: row.id, mentorId: row.mentor_id, discipleId: row.disciple_id,
        startDate: row.start_date, endDate: row.end_date, status: row.status,
    };
}

export async function GET(request: NextRequest) {
    try {
        const admin = getSupabaseAdminClient();
        const courseId = requireString(new URL(request.url).searchParams.get('courseId'), 'courseId');

        const [courseResult, linksResult, branchesResult, usersResult] = await Promise.all([
            admin.from('courses').select('id, code, name').eq('id', courseId).single(),
            admin.from('training_links').select('*').eq('course_id', courseId),
            admin.from('branches').select('id, name'),
            admin.from('users').select('id, full_name, email, birth_date, branch_id, user_roles ( role:roles ( code ) )'),
        ]);

        if (courseResult.error) throw courseResult.error;
        if (linksResult.error) throw linksResult.error;
        if (branchesResult.error) throw branchesResult.error;
        if (usersResult.error) throw usersResult.error;

        const branchNames = new Map((branchesResult.data ?? []).map((b) => [b.id, b.name]));
        const links = linksResult.data ?? [];

        const memberIds = new Set<string>();
        links.forEach((l) => { memberIds.add(l.mentor_id); memberIds.add(l.disciple_id); });

        const members = (usersResult.data ?? [])
            .filter((u) => memberIds.has(u.id))
            .map((u) => mapMember(u as any, branchNames));

        const discipleCounts: Record<string, number> = {};
        links.forEach((l) => { discipleCounts[l.mentor_id] = (discipleCounts[l.mentor_id] ?? 0) + 1; });

        const mentorIds = new Set(links.map((l) => l.mentor_id));
        const discipleIds = new Set(links.map((l) => l.disciple_id));
        const rootMentorIds = [...mentorIds].filter((id) => !discipleIds.has(id));

        const response: TreeResponse = {
            course: courseResult.data,
            members,
            links: links.map(mapLink),
            discipleCounts,
            rootMentorIds,
        };
        return apiSuccess(response);
    } catch (error) { return handleError(error); }
}
