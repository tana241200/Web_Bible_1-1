// types/auth.ts

// Role codes as seeded in public.roles. If new roles are added later,
// extend this union (or switch to `string` if roles become fully dynamic).
export type UserRoleCode = 'ADMIN' | 'MENTOR' | 'MEMBER';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  roles: UserRoleCode[];
  branchId: string | null;
}
