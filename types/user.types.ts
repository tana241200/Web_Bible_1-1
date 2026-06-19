import type { RoleCode, UserStatus } from './database.types';


export interface UserRecord {

    id: string;

    email: string;


    /**
     * users.full_name
     */
    fullName: string;


    /**
     * users.birth_date
     */
    birthDate: string | null;


    /**
     * users.branch_id
     */
    branchId: string | null;


    /**
     * join branches.name
     */
    branchName?: string | null;


    /**
     * RBAC:
     * user_roles -> roles.code
     */
    roles: RoleCode[];


    /**
     * users.status
     */
    status: UserStatus;


    /**
     * users.avatar_url
     */
    avatarUrl: string | null;


    /**
     * users.phone
     */
    phone: string | null;
}



export interface UserInput {


    email: string;


    fullName: string;


    birthDate?: string | null;


    branchId?: string | null;


    passwordHash?: string;


    roles?: RoleCode[];


    status?: UserStatus;


    avatarUrl?: string | null;


    phone?: string | null;
}