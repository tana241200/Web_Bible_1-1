import type { UserRole, UserStatus } from '@/types/database.types';

export interface UserRecord {
    id: string;
    name: string;
    birthDate: string | null;
    branchId: string | null;
    branchName?: string | null;
    email: string;
    role: UserRole;
    status: UserStatus;
    avatar: string | null;
    phone?: string | null;
}

export interface UserInput {
    name: string;
    birthDate?: string | null;
    branchId?: string | null;
    email: string;
    passwordHash?: string;
    role?: UserRole;
    status?: UserStatus;
    avatar?: string | null;
    phone?: string | null;
}