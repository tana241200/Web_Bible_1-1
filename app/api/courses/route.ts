import { NextRequest } from 'next/server';

import { apiFailure, apiSuccess } from '@/lib/api/api-response';
import { ApiError } from '@/lib/api/api-error';
import { optionalString, readJsonBody, requireString } from '@/lib/api/validation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { CourseInput, CourseRecord } from '@/types/course.types';

function mapCourse(row: { id: string; code: string; name: string; description: string | null; order_no: number; is_active: boolean; created_at: string }, totalTrainings = 0): CourseRecord {
    return {
        id: row.id,
        code: row.code,
        name: row.name,
        description: row.description,
        orderNo: row.order_no,
        isActive: row.is_active,
        totalTrainings,
        createdAt: row.created_at,
    };
}

function handleError(error: unknown) {
    if (error instanceof ApiError) {
        return apiFailure(error.message, error.status, error.details);
    }

    const message = error instanceof Error ? error.message : 'Unexpected error.';
    return apiFailure(message, 500, error);
}

async function loadTrainingCounts(admin: ReturnType<typeof getSupabaseAdminClient>) {
    const { data, error } = await admin.from('training_links').select('course_id');

    if (error) {
        throw error;
    }

    const counts = new Map<string, number>();
    for (const row of data ?? []) {
        counts.set(row.course_id, (counts.get(row.course_id) ?? 0) + 1);
    }

    return counts;
}

export async function GET(request: NextRequest) {
    try {
        const admin = getSupabaseAdminClient();
        const url = new URL(request.url);
        const search = url.searchParams.get('search')?.trim().toLowerCase() ?? '';
        const isActive = url.searchParams.get('isActive');

        const query = admin.from('courses').select('*').order('order_no', { ascending: true });
        const { data, error } = isActive === null ? await query : await query.eq('is_active', isActive === 'true');
        console.log("data", data);
        if (error) {
            throw error;
        }

        const counts = await loadTrainingCounts(admin);
        const filtered = (data ?? []).filter((course) => {
            if (!search) return true;
            return [course.code, course.name, course.description]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(search));
        });

        return apiSuccess(filtered.map((course) => mapCourse(course, counts.get(course.id) ?? 0)));
    } catch (error) {
        return handleError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = getSupabaseAdminClient();
        const body = await readJsonBody<Partial<CourseInput>>(request);

        const payload = {
            code: requireString(body.code, 'code'),
            name: requireString(body.name, 'name'),
            description: optionalString(body.description),
            order_no: body.orderNo ?? 0,
            is_active: body.isActive ?? true,
        };

        const { data, error } = await admin.from('courses').insert(payload).select('*').single();
        if (error) throw error;

        return apiSuccess(mapCourse(data, 0), 201);
    } catch (error) {
        return handleError(error);
    }
}