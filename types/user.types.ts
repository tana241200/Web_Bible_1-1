import type { RoleCode } from '@/types/auth.types';

export interface UserRecord {
    id: string;
    name: string;
    birthDate: string | null;
    branchId: string | null;
    branchName?: string | null;
    email: string;
    roles: RoleCode[];
    status: string;
    avatar: string | null;
    phone?: string | null;
}

export interface UserInput {
    name: string;
    birthDate?: string | null;
    branchId?: string | null;
    email: string;
    passwordHash?: string;
    roles?: RoleCode[];
    status?: string;
    avatar?: string | null;
    phone?: string | null;
}
