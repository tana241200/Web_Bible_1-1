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

async function loadTrainingCount(admin: ReturnType<typeof getSupabaseAdminClient>, courseId: string) {
    const { count, error } = await admin.from('training_links').select('*', { count: 'exact', head: true }).eq('course_id', courseId);
    if (error) throw error;
    return count ?? 0;
}

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const admin = getSupabaseAdminClient();
        const { data, error } = await admin.from('courses').select('*').eq('id', requireString(id, 'id')).single();
        if (error) throw error;
        return apiSuccess(mapCourse(data, await loadTrainingCount(admin, data.id)));
    } catch (error) {
        return handleError(error);
    }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const admin = getSupabaseAdminClient();

    const body =
      await readJsonBody<Partial<CourseInput>>(request);

    const payload: {
      code?: string;
      name?: string;
      description?: string | null;
      order_no?: number;
      is_active?: boolean;
    } = {};

    if (body.code !== undefined) {
      payload.code = requireString(body.code, 'code');
    }

    if (body.name !== undefined) {
      payload.name = requireString(body.name, 'name');
    }

    if (body.description !== undefined) {
      payload.description = optionalString(
        body.description
      );
    }

    if (body.orderNo !== undefined) {
      payload.order_no = body.orderNo;
    }

    if (body.isActive !== undefined) {
      payload.is_active = body.isActive;
    }

    if (Object.keys(payload).length === 0) {
      throw new ApiError(
        'No update fields were provided.',
        400
      );
    }

    const { data, error } = await admin
      .from('courses')
      .update(payload)
      .eq('id', requireString(id, 'id'))
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return apiSuccess(
      mapCourse(
        data,
        await loadTrainingCount(admin, data.id)
      )
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const admin = getSupabaseAdminClient();
        const { error } = await admin.from('courses').delete().eq('id', requireString(id, 'id'));
        if (error) throw error;
        return apiSuccess({ deleted: true });
    } catch (error) {
        return handleError(error);
    }
}