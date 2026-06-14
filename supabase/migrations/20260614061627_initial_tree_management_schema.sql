-- =====================================================
-- DISCIPLESHIP TREE MANAGEMENT
-- FULL REBUILD SCHEMA (DEV ONLY)
-- =====================================================

drop schema if exists public cascade;
create schema public;

grant usage on schema public to postgres;
grant all on schema public to postgres;

grant usage on schema public to anon;
grant usage on schema public to authenticated;
grant usage on schema public to service_role;

create extension if not exists pgcrypto;

-- =====================================================
-- ENUMS
-- =====================================================

create type public.user_role as enum (
    'ADMIN',
    'MEMBER',
    'PRE_REGISTERED_MENTOR'
);

create type public.user_status as enum (
    'active',
    'inactive',
    'pending'
);

create type public.course_status as enum (
    'active',
    'inactive'
);

create type public.training_link_status as enum (
    'in_progress',
    'completed'
);

create type public.mentor_request_status as enum (
    'pending',
    'approved',
    'rejected'
);

create type public.user_course_progress_status as enum (
    'not_started',
    'in_progress',
    'completed'
);

-- =====================================================
-- BRANCHES
-- =====================================================

create table public.branches (
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null unique,
    city varchar(255) not null,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =====================================================
-- USERS
-- =====================================================

create table public.users (
    id uuid primary key default gen_random_uuid(),
    email varchar(255) not null unique,
    password_hash text not null,
    full_name varchar(255) not null,
    birth_date date,
    branch_id uuid references public.branches(id)
        on update cascade
        on delete set null,
    role public.user_role not null default 'user',
    status public.user_status not null default 'pending',
    avatar_url text,
    phone varchar(50),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index users_branch_id_idx
on public.users(branch_id);

-- =====================================================
-- COURSES
-- =====================================================

create table public.courses (
    id uuid primary key default gen_random_uuid(),
    code varchar(50) not null unique,
    name varchar(255) not null,
    description text,
    order_no integer not null default 0 check (order_no >= 0),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =====================================================
-- TRAINING LINKS
-- =====================================================

create table public.training_links (
    id uuid primary key default gen_random_uuid(),

    course_id uuid not null references public.courses(id)
        on update cascade
        on delete restrict,

    mentor_id uuid not null references public.users(id)
        on update cascade
        on delete restrict,

    disciple_id uuid not null references public.users(id)
        on update cascade
        on delete restrict,

    start_month date not null,
    end_month date,

    status public.training_link_status
        not null
        default 'in_progress',

    notes text,

    created_by uuid references public.users(id)
        on update cascade
        on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint training_links_different_people
        check (mentor_id <> disciple_id),

    constraint training_links_period_check
        check (
            end_month is null
            or end_month >= start_month
        )
);

create index training_links_course_id_idx
on public.training_links(course_id);

create index training_links_mentor_id_idx
on public.training_links(mentor_id);

create index training_links_disciple_id_idx
on public.training_links(disciple_id);

-- =====================================================
-- MENTOR REQUESTS
-- =====================================================

create table public.mentor_requests (
    id uuid primary key default gen_random_uuid(),

    requester_id uuid references public.users(id)
        on update cascade
        on delete set null,

    mentor_name varchar(255) not null,
    mentor_branch varchar(255) not null,
    mentor_birth_date date,

    contact_info text not null,
    reason text not null,

    status public.mentor_request_status
        not null
        default 'pending',

    reviewed_by uuid references public.users(id)
        on update cascade
        on delete set null,

    reviewed_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index mentor_requests_requester_id_idx
on public.mentor_requests(requester_id);

-- =====================================================
-- CONVERSATIONS
-- =====================================================

create table public.conversations (
    id uuid primary key default gen_random_uuid(),

    course_id uuid not null references public.courses(id)
        on update cascade
        on delete cascade,

    member_a uuid not null references public.users(id)
        on update cascade
        on delete cascade,

    member_b uuid not null references public.users(id)
        on update cascade
        on delete cascade,

    created_at timestamptz not null default now(),

    constraint conversations_members_different
        check (member_a <> member_b)
);

create unique index conversations_course_members_unique
on public.conversations(course_id, member_a, member_b);

-- =====================================================
-- MESSAGES
-- =====================================================

create table public.messages (
    id uuid primary key default gen_random_uuid(),

    conversation_id uuid not null references public.conversations(id)
        on update cascade
        on delete cascade,

    sender_id uuid not null references public.users(id)
        on update cascade
        on delete cascade,

    content text not null,

    email_sent boolean not null default false,

    created_at timestamptz not null default now()
);

create index messages_conversation_id_idx
on public.messages(conversation_id);

-- =====================================================
-- NOTIFICATIONS
-- =====================================================

create table public.notifications (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null references public.users(id)
        on update cascade
        on delete cascade,

    title varchar(255) not null,
    content text not null,

    is_read boolean not null default false,

    created_at timestamptz not null default now()
);

create index notifications_user_id_idx
on public.notifications(user_id);

-- =====================================================
-- USER COURSE PROGRESS
-- =====================================================

create table public.user_course_progress (
    id uuid primary key default gen_random_uuid(),

    user_id uuid not null references public.users(id)
        on update cascade
        on delete cascade,

    course_id uuid not null references public.courses(id)
        on update cascade
        on delete cascade,

    mentor_id uuid references public.users(id)
        on update cascade
        on delete set null,

    status public.user_course_progress_status
        not null
        default 'not_started',

    start_date date,
    completed_date date,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint user_course_progress_dates
        check (
            completed_date is null
            or start_date is null
            or completed_date >= start_date
        ),

    constraint user_course_progress_unique
        unique (user_id, course_id)
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================

create table public.audit_logs (
    id uuid primary key default gen_random_uuid(),

    actor_id uuid references public.users(id)
        on update cascade
        on delete set null,

    entity_type varchar(100) not null,
    entity_id uuid not null,

    action varchar(100) not null,

    old_data jsonb,
    new_data jsonb,

    created_at timestamptz not null default now()
);

create index audit_logs_actor_id_idx
on public.audit_logs(actor_id);

create index audit_logs_entity_idx
on public.audit_logs(entity_type, entity_id);

-- =====================================================
-- UPDATED AT TRIGGER
-- =====================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger set_branches_updated_at before update on public.branches
for each row execute function public.set_updated_at();

create trigger set_users_updated_at before update on public.users
for each row execute function public.set_updated_at();

create trigger set_courses_updated_at before update on public.courses
for each row execute function public.set_updated_at();

create trigger set_training_links_updated_at before update on public.training_links
for each row execute function public.set_updated_at();

create trigger set_mentor_requests_updated_at before update on public.mentor_requests
for each row execute function public.set_updated_at();

create trigger set_user_course_progress_updated_at before update on public.user_course_progress
for each row execute function public.set_updated_at();

-- =====================================================
-- MATERIALIZED VIEW
-- =====================================================

create materialized view public.mentor_statistics as
select
    mentor_id,
    count(*)::integer as total_disciples,
    count(distinct course_id)::integer as total_courses,
    count(*) filter (where status = 'completed')::integer as total_completed
from public.training_links
group by mentor_id;

-- =====================================================
-- RLS
-- =====================================================

alter table public.branches enable row level security;
alter table public.users enable row level security;
alter table public.courses enable row level security;
alter table public.training_links enable row level security;
alter table public.mentor_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.user_course_progress enable row level security;
alter table public.audit_logs enable row level security;