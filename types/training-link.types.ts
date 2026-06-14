export interface TrainingRelationRecord {
    id: string;
    courseId: string;
    courseName?: string;
    mentorId: string;
    mentorName?: string;
    discipleId: string;
    discipleName?: string;
    branchName?: string;
    startMonth: string;
    endMonth: string | null;
    status: 'in_progress' | 'completed';
    notes?: string | null;
    createdBy: string | null;
}

export interface TrainingRelationInput {
    courseId: string;
    mentorId: string;
    discipleId: string;
    startMonth: string;
    endMonth?: string | null;
    status?: 'in_progress' | 'completed';
    notes?: string | null;
    createdBy?: string | null;
}