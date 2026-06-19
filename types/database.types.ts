export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// ─── Enums (chỉ còn các enums không liên quan đến role vì role đã chuyển sang RBAC) ───
export type UserStatus = 'active' | 'inactive' | 'pending';
export type TrainingLinkStatus = 'in_progress' | 'completed';
export type MentorRequestStatus = 'pending' | 'approved' | 'rejected';
export type UserCourseProgressStatus = 'not_started' | 'in_progress' | 'completed';

// ─── Role codes từ bảng roles (seed2) ───
export type RoleCode = 'ADMIN' | 'MENTOR' | 'MEMBER';

export interface Database {
    public: {
        Tables: {
            // branches: thêm cột code (seed2)
            branches: {
                Row: {
                    id: string;
                    code: string;
                    name: string;
                    city: string;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    code: string;
                    name: string;
                    city: string;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    code?: string;
                    name?: string;
                    city?: string;
                    is_active?: boolean;
                    updated_at?: string;
                };
                Relationships: [];
            };

            // roles: RBAC
            roles: {
                Row: {
                    id: string;
                    code: RoleCode;
                    name: string;
                    description: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    code: RoleCode;
                    name: string;
                    description?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    code?: RoleCode;
                    name?: string;
                    description?: string | null;
                    updated_at?: string;
                };
                Relationships: [];
            };

            // permission_groups
            permission_groups: {
                Row: {
                    id: string;
                    code: string;
                    name: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    code: string;
                    name: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    code?: string;
                    name?: string;
                };
                Relationships: [];
            };

            // permissions
            permissions: {
                Row: {
                    id: string;
                    permission_group_id: string;
                    code: string;
                    name: string;
                    module: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    permission_group_id: string;
                    code: string;
                    name: string;
                    module: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    permission_group_id?: string;
                    code?: string;
                    name?: string;
                    module?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'permissions_permission_group_id_fkey';
                        columns: ['permission_group_id'];
                        isOneToOne: false;
                        referencedRelation: 'permission_groups';
                        referencedColumns: ['id'];
                    },
                ];
            };

            // role_permissions: composite PK (role_id, permission_id)
            role_permissions: {
                Row: {
                    role_id: string;
                    permission_id: string;
                };
                Insert: {
                    role_id: string;
                    permission_id: string;
                };
                Update: {
                    role_id?: string;
                    permission_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'role_permissions_role_id_fkey';
                        columns: ['role_id'];
                        isOneToOne: false;
                        referencedRelation: 'roles';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'role_permissions_permission_id_fkey';
                        columns: ['permission_id'];
                        isOneToOne: false;
                        referencedRelation: 'permissions';
                        referencedColumns: ['id'];
                    },
                ];
            };

            // users: KHÔNG có cột role (seed2 insert users không có role)
            users: {
                Row: {
                    id: string;
                    email: string;
                    password_hash: string;
                    full_name: string;
                    birth_date: string | null;
                    branch_id: string | null;
                    status: UserStatus;
                    avatar_url: string | null;
                    phone: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    password_hash: string;
                    full_name: string;
                    birth_date?: string | null;
                    branch_id?: string | null;
                    status?: UserStatus;
                    avatar_url?: string | null;
                    phone?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    password_hash?: string;
                    full_name?: string;
                    birth_date?: string | null;
                    branch_id?: string | null;
                    status?: UserStatus;
                    avatar_url?: string | null;
                    phone?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'users_branch_id_fkey';
                        columns: ['branch_id'];
                        isOneToOne: false;
                        referencedRelation: 'branches';
                        referencedColumns: ['id'];
                    },
                ];
            };

            // user_roles: composite PK (user_id, role_id)
            user_roles: {
                Row: {
                    user_id: string;
                    role_id: string;
                    created_at: string;
                };
                Insert: {
                    user_id: string;
                    role_id: string;
                    created_at?: string;
                };
                Update: {
                    user_id?: string;
                    role_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'user_roles_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'user_roles_role_id_fkey';
                        columns: ['role_id'];
                        isOneToOne: false;
                        referencedRelation: 'roles';
                        referencedColumns: ['id'];
                    },
                ];
            };

            courses: {
                Row: {
                    id: string;
                    code: string;
                    name: string;
                    description: string | null;
                    order_no: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    code: string;
                    name: string;
                    description?: string | null;
                    order_no?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    code?: string;
                    name?: string;
                    description?: string | null;
                    order_no?: number;
                    is_active?: boolean;
                    updated_at?: string;
                };
                Relationships: [];
            };

            // training_links: seed2 dùng start_date / end_date
            training_links: {
                Row: {
                    id: string;
                    course_id: string;
                    mentor_id: string;
                    disciple_id: string;
                    start_date: string;
                    end_date: string | null;
                    status: TrainingLinkStatus;
                    notes: string | null;
                    created_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    course_id: string;
                    mentor_id: string;
                    disciple_id: string;
                    start_date: string;
                    end_date?: string | null;
                    status?: TrainingLinkStatus;
                    notes?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    course_id?: string;
                    mentor_id?: string;
                    disciple_id?: string;
                    start_date?: string;
                    end_date?: string | null;
                    status?: TrainingLinkStatus;
                    notes?: string | null;
                    created_by?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'training_links_course_id_fkey';
                        columns: ['course_id'];
                        isOneToOne: false;
                        referencedRelation: 'courses';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'training_links_mentor_id_fkey';
                        columns: ['mentor_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'training_links_disciple_id_fkey';
                        columns: ['disciple_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'training_links_created_by_fkey';
                        columns: ['created_by'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };

            // mentor_requests: migration v1 schema (no mentor_id/course_id FK columns)
            mentor_requests: {
                Row: {
                    id: string;
                    requester_id: string | null;
                    mentor_name: string;
                    mentor_branch: string;
                    mentor_birth_date: string | null;
                    contact_info: string;
                    reason: string;
                    status: MentorRequestStatus;
                    reviewed_by: string | null;
                    reviewed_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    requester_id?: string | null;
                    mentor_name: string;
                    mentor_branch: string;
                    mentor_birth_date?: string | null;
                    contact_info: string;
                    reason: string;
                    status?: MentorRequestStatus;
                    reviewed_by?: string | null;
                    reviewed_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    requester_id?: string | null;
                    mentor_name?: string;
                    mentor_branch?: string;
                    mentor_birth_date?: string | null;
                    contact_info?: string;
                    reason?: string;
                    status?: MentorRequestStatus;
                    reviewed_by?: string | null;
                    reviewed_at?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'mentor_requests_requester_id_fkey';
                        columns: ['requester_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'mentor_requests_reviewed_by_fkey';
                        columns: ['reviewed_by'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };

            // conversations: migration v2 — user_a_id / user_b_id (không có course_id)
            conversations: {
                Row: {
                    id: string;
                    user_a_id: string;
                    user_b_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_a_id: string;
                    user_b_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_a_id?: string;
                    user_b_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'conversations_user_a_id_fkey';
                        columns: ['user_a_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'conversations_user_b_id_fkey';
                        columns: ['user_b_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };

            // messages: migration v2 — is_read (không có email_sent)
            messages: {
                Row: {
                    id: string;
                    conversation_id: string;
                    sender_id: string;
                    content: string;
                    is_read: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    conversation_id: string;
                    sender_id: string;
                    content: string;
                    is_read?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    conversation_id?: string;
                    sender_id?: string;
                    content?: string;
                    is_read?: boolean;
                };
                Relationships: [
                    {
                        foreignKeyName: 'messages_conversation_id_fkey';
                        columns: ['conversation_id'];
                        isOneToOne: false;
                        referencedRelation: 'conversations';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'messages_sender_id_fkey';
                        columns: ['sender_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };

            // notifications: migration v2 — content nullable
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    content: string | null;
                    is_read: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    content?: string | null;
                    is_read?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    content?: string | null;
                    is_read?: boolean;
                };
                Relationships: [
                    {
                        foreignKeyName: 'notifications_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };

            user_course_progress: {
                Row: {
                    id: string;
                    user_id: string;
                    course_id: string;
                    mentor_id: string | null;
                    status: UserCourseProgressStatus;
                    start_date: string | null;
                    completed_date: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    course_id: string;
                    mentor_id?: string | null;
                    status?: UserCourseProgressStatus;
                    start_date?: string | null;
                    completed_date?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    course_id?: string;
                    mentor_id?: string | null;
                    status?: UserCourseProgressStatus;
                    start_date?: string | null;
                    completed_date?: string | null;
                    updated_at?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'user_course_progress_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'user_course_progress_course_id_fkey';
                        columns: ['course_id'];
                        isOneToOne: false;
                        referencedRelation: 'courses';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'user_course_progress_mentor_id_fkey';
                        columns: ['mentor_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };

            audit_logs: {
                Row: {
                    id: string;
                    actor_id: string | null;
                    entity_type: string;
                    entity_id: string;
                    action: string;
                    old_data: Json | null;
                    new_data: Json | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    actor_id?: string | null;
                    entity_type: string;
                    entity_id: string;
                    action: string;
                    old_data?: Json | null;
                    new_data?: Json | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    actor_id?: string | null;
                    entity_type?: string;
                    entity_id?: string;
                    action?: string;
                    old_data?: Json | null;
                    new_data?: Json | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'audit_logs_actor_id_fkey';
                        columns: ['actor_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Views: {
            mentor_statistics: {
                Row: {
                    mentor_id: string | null;
                    total_disciples: number | null;
                    total_courses: number | null;
                    total_completed: number | null;
                };
                Relationships: [];
            };
        };
        Functions: Record<string, never>;
        Enums: {
            user_status: UserStatus;
            training_link_status: TrainingLinkStatus;
            mentor_request_status: MentorRequestStatus;
            user_course_progress_status: UserCourseProgressStatus;
        };
        CompositeTypes: Record<string, never>;
    };
}
