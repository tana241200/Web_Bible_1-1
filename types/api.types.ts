export interface ApiErrorBody {
    message: string;
    details?: unknown;
}

export interface ApiSuccessBody<T> {
    success: true;
    data: T;
}

export interface ApiFailureBody {
    success: false;
    error: ApiErrorBody;
}

export type ApiBody<T> = ApiSuccessBody<T> | ApiFailureBody;