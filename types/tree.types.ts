import type { ReactNode } from 'react';

export interface ColumnType<T, TValue = unknown> {
    title: string;
    dataIndex?: keyof T;
    key: string;
    width?: number;
    align?: 'left' | 'center' | 'right';
    sorter?: (a: T, b: T) => number;
    render?: (value: any, record: T) => ReactNode;
}
export type ColumnsType<T> = ColumnType<T, any>[];

export interface TreeMemberRecord {
    id: string;
    fullName: string;
    email: string;
    roles: string[];
    birthDate: string | null;
    branchId: string | null;
    branchName?: string;
}

export interface TreeLinkRecord {
    id: string;
    mentorId: string;
    discipleId: string;
    startDate: string;
    endDate: string | null;
    status: 'in_progress' | 'completed';
}

export interface TreeCourseRecord {
    id: string;
    code: string;
    name: string;
}

export interface TreeResponse {
    course: TreeCourseRecord;
    members: TreeMemberRecord[];
    links: TreeLinkRecord[];
    discipleCounts: Record<string, number>;
    rootMentorIds: string[];
    focusUserId?: string;
}
