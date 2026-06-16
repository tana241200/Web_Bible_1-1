export interface TreeMemberRecord {
  id: string;
  fullName: string;
  email: string;
  role: string;
  birthDate: string | null;
  branchId: string | null;
  branchName?: string;
}

export interface TreeLinkRecord {
  id: string;
  mentorId: string;
  discipleId: string;
  startMonth: string;
  endMonth: string | null;
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