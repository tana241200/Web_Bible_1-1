export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type UserRole = 'ADMIN' | 'MEMBER' | 'MENTOR';
export type UserStatus = 'active' | 'inactive' | 'pending';
export type CourseStatus = 'active' | 'inactive';
export type TrainingLinkStatus = 'in_progress' | 'completed';
export type MentorRequestStatus = 'pending' | 'approved' | 'rejected';
export type UserCourseProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface Database {
    public: {
        Tables: {
            branches: {
                Row: {
                    id: string;
                    name: string;
                    city: string;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    city: string;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    city?: string;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [];
            };
            // TODO: Bảng "roles" mới xuất hiện trong migration (trigger roles_updated_at
            // on public.roles) nhưng chưa có CREATE TABLE đầy đủ cho bảng này.
            // Hãy gửi DDL của bảng roles (các cột, kiểu dữ liệu, FK nếu có) để mình
            // bổ sung Row/Insert/Update/Relationships chính xác.
            // Đồng thời cần xác nhận: cột "role" trong "users" có còn dùng enum UserRole
            // như cũ hay đã chuyển sang role_id tham chiếu bảng roles?
            users: {
                Row: {
                    id: string;
                    email: string;
                    password_hash: string;
                    full_name: string;
                    birth_date: string | null;
                    branch_id: string | null;
                    role: UserRole;
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
                    role?: UserRole;
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
                    role?: UserRole;
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
            training_links: {
                Row: {
                    id: string;
                    course_id: string;
                    mentor_id: string;
                    disciple_id: string;
                    start_month: string;
                    end_month: string | null;
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
                    start_month: string;
                    end_month?: string | null;
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
                    start_month?: string;
                    end_month?: string | null;
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
            // TODO: Migration mới có các index:
            //   mentor_requests_mentor_idx on public.mentor_requests(mentor_id)
            //   mentor_requests_course_idx on public.mentor_requests(course_id)
            // nhưng các cột mentor_id / course_id KHÔNG tồn tại trong cấu trúc hiện tại
            // của mentor_requests (hiện chỉ có mentor_name, mentor_branch, mentor_birth_date
            // dạng text, không tham chiếu users/courses).
            // => Bảng mentor_requests có vẻ đã đổi cấu trúc (có thể mentor_name/mentor_branch
            // được thay bằng mentor_id uuid FK tới users, và thêm course_id FK tới courses).
            // Hãy gửi CREATE TABLE đầy đủ của mentor_requests mới để mình cập nhật chính xác
            // Row/Insert/Update/Relationships. Tạm thời mình GIỮ NGUYÊN cấu trúc cũ dưới đây
            // để tránh đoán sai kiểu dữ liệu.
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
                        foreignKeyName: 'mentor_requests_reviewed_by_fkey';
                        columns: ['reviewed_by'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };
            // ĐÃ CẬP NHẬT: conversations đổi member_a/member_b -> user_a_id/user_b_id,
            // bỏ cột course_id (không còn liên kết tới courses), thêm constraint
            // conversations_different_users (chỉ là CHECK ở DB, không ảnh hưởng type TS).
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
            // ĐÃ CẬP NHẬT: messages đổi email_sent -> is_read.
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
            // ĐÃ CẬP NHẬT: notifications.content giờ là nullable (không có "not null"
            // trong migration mới), trước đây là required.
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
        Enums: {
            user_role: UserRole;
            user_status: UserStatus;
            course_status: CourseStatus;
            training_link_status: TrainingLinkStatus;
            mentor_request_status: MentorRequestStatus;
            user_course_progress_status: UserCourseProgressStatus;
        };
        CompositeTypes: Record<string, never>;
    };
}
