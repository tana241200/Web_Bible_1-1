export interface BranchRecord {
    id: string;
    name: string;
    city: string;
    isActive: boolean;
    members?: number;
    mentors?: number;
    trainings?: number;
}

export interface BranchInput {
    name: string;
    city: string;
    isActive?: boolean;
}