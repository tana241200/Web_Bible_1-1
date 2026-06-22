
export interface TrainingRelationRecord {
    id: string;
    courseId: string;
    courseName?: string;
    mentorId: string;
    mentorName?: string;
    discipleId: string;
    discipleName?: string;
    branchName?: string;
    /** ISO date string "YYYY-MM-DD" */
    startDate: string;
    /** ISO date string "YYYY-MM-DD" hoặc null */
    endDate: string | null;
    status: 'in_progress' | 'completed';
    notes: string | null;
    createdBy: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TrainingRelationInput {
    courseId: string;
    mentorId: string;
    discipleId: string;
    /** ISO date string "YYYY-MM-DD" */
    startDate: string;
    /** ISO date string "YYYY-MM-DD" — optional */
    endDate?: string | null;
    status?: 'in_progress' | 'completed';
    notes?: string | null;
    createdBy?: string | null;
}
