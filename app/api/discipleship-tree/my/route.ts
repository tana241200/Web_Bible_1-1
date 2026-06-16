import { NextRequest } from 'next/server';

import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { ApiError } from '@/lib/api/api-error';
import { requireString } from '@/lib/api/validation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { TreeLinkRecord, TreeMemberRecord, TreeResponse } from '@/types/tree.types';

function handleError(error: unknown) {
    if (error instanceof ApiError) {
        return apiFailure(error.message, error.status, error.details);
    }

    const message = error instanceof Error ? error.message : 'Unexpected error.';
    return apiFailure(message, 500, error);
}

function mapMember(row: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    birth_date: string | null;
    branch_id: string | null;
}, branchNames: Map<string, string>): TreeMemberRecord {
    return {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        role: row.role,
        birthDate: row.birth_date,
        branchId: row.branch_id,
        branchName: row.branch_id ? branchNames.get(row.branch_id) ?? undefined : undefined,
    };
}

function mapLink(row: {
    id: string;
    mentor_id: string;
    disciple_id: string;
    start_month: string;
    end_month: string | null;
    status: 'in_progress' | 'completed';
}): TreeLinkRecord {
    return {
        id: row.id,
        mentorId: row.mentor_id,
        discipleId: row.disciple_id,
        startMonth: row.start_month,
        endMonth: row.end_month,
        status: row.status,
    };
}

export async function GET(request: NextRequest) {
    try {
        const admin = getSupabaseAdminClient();
        const params = new URL(request.url).searchParams;
        const courseId = requireString(params.get('courseId'), 'courseId');
        const userId = requireString(params.get('userId'), 'userId');

        const [courseResult, linksResult, branchesResult, usersResult] = await Promise.all([
            admin.from('courses').select('id, code, name').eq('id', courseId).single(),
            admin.from('training_links').select('*').eq('course_id', courseId),
            admin.from('branches').select('id, name'),
            admin.from('users').select('id, full_name, email, role, birth_date, branch_id'),
        ]);

        if (courseResult.error) throw courseResult.error;
        if (linksResult.error) throw linksResult.error;
        if (branchesResult.error) throw branchesResult.error;
        if (usersResult.error) throw usersResult.error;

        const branchNames = new Map((branchesResult.data ?? []).map((b) => [b.id, b.name]));
        const allLinks = linksResult.data ?? [];

        // ── Truy vết ngược lên (Ancestors): disciple_id -> mentor_id, đến tận gốc ──
        const ancestorLinks = new Map<string, typeof allLinks[number]>();
        const ancestorVisited = new Set<string>([userId]);
        let frontier = [userId];
        while (frontier.length > 0) {
            const next: string[] = [];
            for (const personId of frontier) {
                for (const link of allLinks) {
                    if (link.disciple_id === personId) {
                        ancestorLinks.set(link.id, link);
                        if (!ancestorVisited.has(link.mentor_id)) {
                            ancestorVisited.add(link.mentor_id);
                            next.push(link.mentor_id);
                        }
                    }
                }
            }
            frontier = next;
        }

        // ── Truy vết xuôi xuống (Descendants): mentor_id -> disciple_id, hết các thế hệ ──
        const descendantLinks = new Map<string, typeof allLinks[number]>();
        const descendantVisited = new Set<string>([userId]);
        frontier = [userId];
        while (frontier.length > 0) {
            const next: string[] = [];
            for (const personId of frontier) {
                for (const link of allLinks) {
                    if (link.mentor_id === personId) {
                        descendantLinks.set(link.id, link);
                        if (!descendantVisited.has(link.disciple_id)) {
                            descendantVisited.add(link.disciple_id);
                            next.push(link.disciple_id);
                        }
                    }
                }
            }
            frontier = next;
        }

        const lineageLinks = [...new Map([...ancestorLinks, ...descendantLinks]).values()];

        const memberIds = new Set<string>([userId]);
        lineageLinks.forEach((l) => {
            memberIds.add(l.mentor_id);
            memberIds.add(l.disciple_id);
        });

        const members = (usersResult.data ?? [])
            .filter((u) => memberIds.has(u.id))
            .map((u) => mapMember(u, branchNames));

        const discipleCounts: Record<string, number> = {};
        lineageLinks.forEach((l) => {
            discipleCounts[l.mentor_id] = (discipleCounts[l.mentor_id] ?? 0) + 1;
        });

        const mentorIds = new Set(lineageLinks.map((l) => l.mentor_id));
        const discipleIds = new Set(lineageLinks.map((l) => l.disciple_id));
        // Nếu user hoàn toàn chưa có liên kết nào, hiển thị chính họ làm root duy nhất
        const rootMentorIds = mentorIds.size > 0
            ? [...mentorIds].filter((id) => !discipleIds.has(id))
            : [userId];

        const response: TreeResponse = {
            course: courseResult.data,
            members,
            links: lineageLinks.map(mapLink),
            discipleCounts,
            rootMentorIds,
            focusUserId: userId,
        };

        return apiSuccess(response);
    } catch (error) {
        return handleError(error);
    }
}