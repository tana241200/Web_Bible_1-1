export interface TrainingRelationRecord {
    id: string;

    courseId: string;
    courseName?: string;

    mentorId: string;
    mentorName?: string;

    discipleId: string;
    discipleName?: string;

    branchName?: string;

    startDate: string;
    endDate: string | null;

    status: 'in_progress' | 'completed';

    notes: string | null;

    createdBy: string | null;

    createdAt: string;
    updatedAt: string;
}