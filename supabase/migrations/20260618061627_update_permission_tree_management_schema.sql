create extension if not exists pgcrypto;

drop table if exists public.audit_logs cascade;
drop table if exists public.user_course_progress cascade;
drop table if exists public.notifications cascade;
drop table if exists public.messages cascade;
drop table if exists public.conversations cascade;
drop table if exists public.mentor_requests cascade;
drop table if exists public.training_links cascade;
drop table if exists public.role_permissions cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.permissions cascade;
drop table if exists public.permission_groups cascade;
drop table if exists public.roles cascade;
drop table if exists public.courses cascade;
drop table if exists public.users cascade;
drop table if exists public.branches cascade;

drop type if exists public.user_course_progress_status cascade;
drop type if exists public.mentor_request_status cascade;
drop type if exists public.training_link_status cascade;
drop type if exists public.user_status cascade;

create type public.user_status as enum (
'active',
'inactive',
'pending'
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

create table public.branches (
id uuid primary key default gen_random_uuid(),
code varchar(50) not null unique,
name varchar(255) not null unique,
city varchar(255) not null,
is_active boolean not null default true,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);

create table public.roles (
id uuid primary key default gen_random_uuid(),
code varchar(100) not null unique,
name varchar(255) not null,
description text,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);

create table public.permission_groups (
id uuid primary key default gen_random_uuid(),
code varchar(100) not null unique,
name varchar(255) not null,
created_at timestamptz not null default now()
);

create table public.permissions (
id uuid primary key default gen_random_uuid(),


permission_group_id uuid
    references public.permission_groups(id)
    on update cascade
    on delete set null,

code varchar(150) not null unique,
name varchar(255) not null,
description text,
module varchar(100) not null,

created_at timestamptz not null default now()


);

create table public.users (
id uuid primary key default gen_random_uuid(),


email varchar(255) not null unique,
password_hash text not null,

full_name varchar(255) not null,
birth_date date,

avatar_url text,
phone varchar(50),

branch_id uuid
    references public.branches(id)
    on update cascade
    on delete set null,

status public.user_status not null default 'pending',

created_at timestamptz not null default now(),
updated_at timestamptz not null default now()


);

create index users_branch_id_idx
on public.users(branch_id);

create table public.user_roles (
id uuid primary key default gen_random_uuid(),


user_id uuid not null
    references public.users(id)
    on update cascade
    on delete cascade,

role_id uuid not null
    references public.roles(id)
    on update cascade
    on delete cascade,

created_at timestamptz not null default now(),

constraint user_roles_unique
    unique(user_id, role_id)


);

create index user_roles_user_id_idx
on public.user_roles(user_id);

create index user_roles_role_id_idx
on public.user_roles(role_id);

create table public.role_permissions (
id uuid primary key default gen_random_uuid(),


role_id uuid not null
    references public.roles(id)
    on update cascade
    on delete cascade,

permission_id uuid not null
    references public.permissions(id)
    on update cascade
    on delete cascade,

created_at timestamptz not null default now(),

constraint role_permissions_unique
    unique(role_id, permission_id)


);

create index role_permissions_role_id_idx
on public.role_permissions(role_id);

create index role_permissions_permission_id_idx
on public.role_permissions(permission_id);

create table public.courses (
id uuid primary key default gen_random_uuid(),


code varchar(50) not null unique,
name varchar(255) not null,

description text,

order_no integer not null default 0
    check (order_no >= 0),

is_active boolean not null default true,

created_at timestamptz not null default now(),
updated_at timestamptz not null default now()


);

create table public.training_links (
id uuid primary key default gen_random_uuid(),


course_id uuid not null
    references public.courses(id)
    on update cascade
    on delete restrict,

mentor_id uuid not null
    references public.users(id)
    on update cascade
    on delete restrict,

disciple_id uuid not null
    references public.users(id)
    on update cascade
    on delete restrict,

start_date date not null,
end_date date,

status public.training_link_status
    not null
    default 'in_progress',

notes text,

created_by uuid
    references public.users(id)
    on update cascade
    on delete set null,

created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),

constraint training_links_different_people
    check (mentor_id <> disciple_id),

constraint training_links_period_check
    check (
        end_date is null
        or end_date >= start_date
    )


);

create unique index training_link_active_unique
on public.training_links (
course_id,
mentor_id,
disciple_id
)
where status = 'in_progress';

create index training_links_course_id_idx
on public.training_links(course_id);

create index training_links_mentor_id_idx
on public.training_links(mentor_id);

create index training_links_disciple_id_idx
on public.training_links(disciple_id);

create table public.mentor_requests (
id uuid primary key default gen_random_uuid(),


requester_id uuid not null
    references public.users(id)
    on update cascade
    on delete cascade,

mentor_id uuid not null
    references public.users(id)
    on update cascade
    on delete cascade,

course_id uuid
    references public.courses(id)
    on update cascade
    on delete set null,

status public.mentor_request_status
    not null
    default 'pending',

note text,
approved_at timestamptz,

created_at timestamptz not null default now(),
updated_at timestamptz not null default now()


);

create table public.user_course_progress (
id uuid primary key default gen_random_uuid(),


user_id uuid not null
    references public.users(id)
    on update cascade
    on delete cascade,

course_id uuid not null
    references public.courses(id)
    on update cascade
    on delete cascade,

mentor_id uuid
    references public.users(id)
    on update cascade
    on delete set null,

status public.user_course_progress_status
    not null
    default 'not_started',

start_date date,
completed_date date,

created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),

constraint user_course_progress_unique
    unique(user_id, course_id)


);
