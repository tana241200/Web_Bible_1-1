export type RoleCode = 'ADMIN' | 'MENTOR' | 'MEMBER';

export interface AuthUser {
    id: string;
    email: string;
    fullName: string;
    roles: RoleCode[];
    branchId: string | null;
}
