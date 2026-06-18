export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

// DEPRECATED: cột "role" enum trên bảng users đã bị loại bỏ (insert mới trong seed
// KHÔNG còn cột "role"), hệ thống đã chuyển sang RBAC quan hệ qua roles/user_roles/
// permissions/role_permissions. Type này được giữ lại để tránh phá vỡ code cũ còn
// import UserRole, nhưng không còn map tới enum Postgres nào trong Database.Enums.
export type UserRole = 'ADMIN' | 'MEMBER' | 'PRE_REGISTERED_MENTOR' | 'MENTOR';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type CourseStatus = 'active' | 'inactive';
export type TrainingLinkStatus = 'in_progress' | 'completed';
export type MentorRequestStatus = 'pending' | 'approved' | 'rejected';
export type UserCourseProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface Database {
    public: {
        Tables: {
            // ĐÃ CẬP NHẬT: thêm cột "code" (seed insert branches có code: 'HN', 'DN', 'HCM').
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
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            // MỚI: bảng roles, cột lấy từ seed insert (id, code, name, description).
            // created_at/updated_at được giữ vì trigger "roles_updated_at" đã xác nhận
            // có updated_at; created_at suy theo convention chung của toàn schema.
            // description đang để nullable (suy luận, chưa có DDL xác nhận not null/nullable).
            roles: {
                Row: {
                    id: string;
                    code: string;
                    name: string;
                    description: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    code: string;
                    name: string;
                    description?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    code?: string;
                    name?: string;
                    description?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            // MỚI: bảng permission_groups, cột lấy từ seed insert (id, code, name).
            // created_at thêm theo convention chung; KHÔNG có trigger updated_at nào
            // được khai báo cho bảng này nên không thêm updated_at (cần xác nhận lại).
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
                    created_at?: string;
                };
                Relationships: [];
            };
            // MỚI: bảng permissions, cột lấy từ seed insert
            // (id, permission_group_id, code, name, module).
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
                    created_at?: string;
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
            // MỚI: bảng nối role_permissions, seed insert chỉ có (role_id, permission_id),
            // không có cột "id" => suy luận đây là composite primary key (role_id, permission_id).
            role_permissions: {
                Row: {
                    role_id: string;
                    permission_id: string;
                    created_at: string;
                };
                Insert: {
                    role_id: string;
                    permission_id: string;
                    created_at?: string;
                };
                Update: {
                    role_id?: string;
                    permission_id?: string;
                    created_at?: string;
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
            // ĐÃ CẬP NHẬT: bỏ hẳn cột "role" (enum UserRole) — seed insert users mới
            // KHÔNG còn cột này. Phân quyền chuyển sang bảng user_roles.
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
                    created_at?: string;
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
            // MỚI: bảng nối user_roles, seed insert chỉ có (user_id, role_id),
            // không có cột "id" => composite primary key (user_id, role_id).
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
                    created_at?: string;
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
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            // ĐÃ CẬP NHẬT: seed insert dùng start_date/end_date (giá trị dạng ngày đầy đủ,
            // ví dụ '2022-01-01') thay cho start_month/end_month trước đây.
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
                    created_at?: string;
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
            // CHƯA CÓ THÊM THÔNG TIN MỚI: seed truncate có mentor_requests nhưng không
            // insert dữ liệu mẫu, nên giữ nguyên cấu trúc suy luận từ trước (mentor_id,
            // course_id thêm dựa trên index, vẫn cần DDL gốc để xác nhận 100%).
            mentor_requests: {
                Row: {
                    id: string;
                    requester_id: string | null;
                    mentor_id: string | null;
                    course_id: string | null;
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
                    mentor_id?: string | null;
                    course_id?: string | null;
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
                    mentor_id?: string | null;
                    course_id?: string | null;
                    mentor_name?: string;
                    mentor_branch?: string;
                    mentor_birth_date?: string | null;
                    contact_info?: string;
                    reason?: string;
                    status?: MentorRequestStatus;
                    reviewed_by?: string | null;
                    reviewed_at?: string | null;
                    created_at?: string;
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
                        foreignKeyName: 'mentor_requests_mentor_id_fkey';
                        columns: ['mentor_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'mentor_requests_course_id_fkey';
                        columns: ['course_id'];
                        isOneToOne: false;
                        referencedRelation: 'courses';
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
                    created_at?: string;
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
                    created_at?: string;
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
                    created_at?: string;
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
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
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
                    {
                        foreignKeyName: 'user_course_progress_user_id_fkey';
                        columns: ['user_id'];
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
                    created_at?: string;
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
                Relationships: [
                    {
                        foreignKeyName: 'training_links_mentor_id_fkey';
                        columns: ['mentor_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Functions: Record<string, never>;
        // ĐÃ BỎ "user_role" khỏi Enums vì cột users.role (enum) không còn tồn tại;
        // hệ thống chuyển sang RBAC quan hệ (roles/user_roles/permissions/role_permissions).
        Enums: {
            user_status: UserStatus;
            course_status: CourseStatus;
            training_link_status: TrainingLinkStatus;
            mentor_request_status: MentorRequestStatus;
            user_course_progress_status: UserCourseProgressStatus;
        };
        CompositeTypes: Record<string, never>;
    };
}
