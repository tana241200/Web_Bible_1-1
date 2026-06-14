truncate table
    public.audit_logs,
    public.user_course_progress,
    public.notifications,
    public.messages,
    public.conversations,
    public.mentor_requests,
    public.training_links,
    public.courses,
    public.users,
    public.branches
restart identity cascade;

insert into public.branches (id, name, city, is_active)
values
    ('00000000-0000-0000-0000-000000000001', 'Chi nhánh Hà Nội', 'Hà Nội', true),
    ('00000000-0000-0000-0000-000000000002', 'Chi nhánh Đà Nẵng', 'Đà Nẵng', true),
    ('00000000-0000-0000-0000-000000000003', 'Chi nhánh Sài Gòn', 'TP HCM', true);

insert into public.users (
    id,
    email,
    password_hash,
    full_name,
    birth_date,
    branch_id,
    role,
    status,
    avatar_url,
    phone
)
values

-- =========================
-- ADMIN
-- =========================
(
    '00000000-0000-0000-0000-000000000101',
    'admin@discipleship.vn',
    '$2b$10$Ym4K4N6eD8k7mVvY1J9V4u2n7rYjKzK1O8Y8F4YgWm6X7N0vVY4tC',
    'Lê Mục Sư',
    '1970-03-15',
    '00000000-0000-0000-0000-000000000001',
    'ADMIN',
    'active',
    null,
    '0900000001'
),

-- =========================
-- MEMBERS
-- =========================
(
    '00000000-0000-0000-0000-000000000102',
    'member1@discipleship.vn',
    '$2b$10$Ym4K4N6eD8k7mVvY1J9V4u2n7rYjKzK1O8Y8F4YgWm6X7N0vVY4tC',
    'Trần Môn Đồ',
    '1990-09-10',
    '00000000-0000-0000-0000-000000000003',
    'MEMBER',
    'active',
    null,
    '0900000002'
),

(
    '00000000-0000-0000-0000-000000000103',
    'member2@discipleship.vn',
    '$2b$10$Ym4K4N6eD8k7mVvY1J9V4u2n7rYjKzK1O8Y8F4YgWm6X7N0vVY4tC',
    'Nguyễn Vâng Phục',
    '1992-01-05',
    '00000000-0000-0000-0000-000000000001',
    'MEMBER',
    'active',
    null,
    '0900000003'
),

(
    '00000000-0000-0000-0000-000000000104',
    'member3@discipleship.vn',
    '$2b$10$Ym4K4N6eD8k7mVvY1J9V4u2n7rYjKzK1O8Y8F4YgWm6X7N0vVY4tC',
    'Lê Chiên Con',
    '1995-11-22',
    '00000000-0000-0000-0000-000000000003',
    'MEMBER',
    'active',
    null,
    '0900000004'
),

(
    '00000000-0000-0000-0000-000000000105',
    'member4@discipleship.vn',
    '$2b$10$Ym4K4N6eD8k7mVvY1J9V4u2n7rYjKzK1O8Y8F4YgWm6X7N0vVY4tC',
    'Phạm Hướng Dẫn',
    '1980-06-20',
    '00000000-0000-0000-0000-000000000003',
    'MEMBER',
    'active',
    null,
    '0900000005'
),

(
    '00000000-0000-0000-0000-000000000106',
    'member5@discipleship.vn',
    '$2b$10$Ym4K4N6eD8k7mVvY1J9V4u2n7rYjKzK1O8Y8F4YgWm6X7N0vVY4tC',
    'Võ Tin Kính',
    '1993-07-14',
    '00000000-0000-0000-0000-000000000002',
    'MEMBER',
    'active',
    null,
    '0900000006'
),

(
    '00000000-0000-0000-0000-000000000107',
    'member6@discipleship.vn',
    '$2b$10$Ym4K4N6eD8k7mVvY1J9V4u2n7rYjKzK1O8Y8F4YgWm6X7N0vVY4tC',
    'Đặng Yêu Thương',
    '1997-04-30',
    '00000000-0000-0000-0000-000000000001',
    'MEMBER',
    'active',
    null,
    '0900000007'
),

(
    '00000000-0000-0000-0000-000000000108',
    'member7@discipleship.vn',
    '$2b$10$Ym4K4N6eD8k7mVvY1J9V4u2n7rYjKzK1O8Y8F4YgWm6X7N0vVY4tC',
    'Bùi Trung Tín',
    '1988-12-03',
    '00000000-0000-0000-0000-000000000003',
    'MEMBER',
    'active',
    null,
    '0900000008'
),

-- =========================
-- PRE_REGISTERED_MENTOR
-- Admin approved but mentor
-- has not registered yet
-- =========================
(
    '00000000-0000-0000-0000-000000000109',
    'mentor.pending1@discipleship.vn',
    '',
    'Nguyễn Người Hướng Dẫn',
    '1978-10-01',
    '00000000-0000-0000-0000-000000000001',
    'PRE_REGISTERED_MENTOR',
    'pending',
    null,
    '0900000009'
),

(
    '00000000-0000-0000-0000-000000000110',
    'mentor.pending2@discipleship.vn',
    '',
    'Trần Người Dạy',
    '1982-05-20',
    '00000000-0000-0000-0000-000000000002',
    'PRE_REGISTERED_MENTOR',
    'pending',
    null,
    '0900000010'
);
insert into public.courses (id, code, name, description, order_no, is_active)
values
    ('00000000-0000-0000-0000-000000000201', 'GENESIS_1', 'Sáng thế ký 1', 'Bài học nền tảng mở đầu Kinh Thánh.', 1, true),
    ('00000000-0000-0000-0000-000000000202', 'COMPANION_1', 'Lớp Đồng hành 1 kèm 1', 'Môn học đồng hành cá nhân.', 2, true),
    ('00000000-0000-0000-0000-000000000203', 'OT_OVERVIEW', 'Khái luận Cựu Ước', 'Tổng quan Cựu Ước.', 3, true),
    ('00000000-0000-0000-0000-000000000204', 'NT_OVERVIEW', 'Khái luận Tân Ước', 'Tổng quan Tân Ước.', 4, true);

insert into public.training_links (id, course_id, mentor_id, disciple_id, start_month, end_month, status, notes, created_by)
values
    ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000102', '2022-01-01', '2022-06-01', 'completed', null, '00000000-0000-0000-0000-000000000101'),
    ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000103', '2022-02-01', '2022-08-01', 'completed', null, '00000000-0000-0000-0000-000000000101'),
    ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000104', '2022-07-01', '2022-12-01', 'completed', null, '00000000-0000-0000-0000-000000000101'),
    ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000104', '2023-01-01', '2023-06-01', 'completed', null, '00000000-0000-0000-0000-000000000101'),
    ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000203', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000108', '2023-06-01', '2023-12-01', 'completed', null, '00000000-0000-0000-0000-000000000101');

insert into public.mentor_requests (id, requester_id, mentor_name, mentor_branch, mentor_birth_date, contact_info, reason, status, reviewed_by, reviewed_at)
values
    ('00000000-0000-0000-0000-000000000401', null, 'Hoàng Mới Đến', 'Chi nhánh Cần Thơ', '1994-02-01', 'hoang@email.com', 'Mục sư đang dạy nhưng chưa có tài khoản', 'pending', null, null),
    ('00000000-0000-0000-0000-000000000402', null, 'Nguyễn Minh Tuấn', 'Chi nhánh Hà Nội', '1989-08-11', 'tuan.nguyen@email.com', 'Đã hoàn thành chương trình đào tạo mentor.', 'approved', '00000000-0000-0000-0000-000000000101', now());

insert into public.conversations (id, course_id, member_a, member_b)
values
    ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000101');

insert into public.messages (id, conversation_id, sender_id, content, email_sent)
values
    ('00000000-0000-0000-0000-000000000601', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000101', 'Chào em, tuần này mình học chương 3 nhé.', true),
    ('00000000-0000-0000-0000-000000000602', '00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000102', 'Vâng, em đã chuẩn bị sẵn bài học rồi ạ.', true);

insert into public.notifications (id, user_id, title, content, is_read)
values
    ('00000000-0000-0000-0000-000000000701', '00000000-0000-0000-0000-000000000102', 'New training link', 'Bạn vừa được thêm vào course Sáng thế ký 1.', false);

insert into public.user_course_progress (id, user_id, course_id, mentor_id, status, start_date, completed_date)
values
    ('00000000-0000-0000-0000-000000000801', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000101', 'completed', '2022-01-01', '2022-06-01'),
    ('00000000-0000-0000-0000-000000000802', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000103', 'in_progress', '2023-01-01', null);

insert into public.audit_logs (id, actor_id, entity_type, entity_id, action, old_data, new_data)
values
    ('00000000-0000-0000-0000-000000000901', '00000000-0000-0000-0000-000000000101', 'training_links', '00000000-0000-0000-0000-000000000301', 'create', null, '{}'::jsonb);

refresh materialized view public.mentor_statistics;