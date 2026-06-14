import { ApiError } from './api-error';

export async function readJsonBody<T>(request: Request): Promise<T> {
    try {
        return (await request.json()) as T;
    } catch {
        throw new ApiError('Request body must be valid JSON.', 400);
    }
}

export function requireString(value: unknown, fieldName: string) {
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new ApiError(`${fieldName} is required.`, 400);
    }

    return value.trim();
}

export function optionalString(value: unknown) {
    if (value === undefined) {
        return undefined;
    }

    if (value === null) {
        return null;
    }

    if (typeof value !== 'string') {
        throw new ApiError('Expected a string value.', 400);
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
}