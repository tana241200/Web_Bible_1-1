import { NextResponse } from 'next/server';

import type { ApiBody } from '@/types/api.types';

export function apiSuccess<T>(data: T, status = 200) {
    return NextResponse.json<ApiBody<T>>(
        {
            success: true,
            data,
        },
        { status },
    );
}

export function apiFailure(message: string, status = 400, details?: unknown) {
    return NextResponse.json<ApiBody<never>>(
        {
            success: false,
            error: {
                message,
                details,
            },
        },
        { status },
    );
}