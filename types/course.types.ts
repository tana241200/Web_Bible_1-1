export interface CourseRecord {
    id: string;
    code: string;
    name: string;
    description: string | null;
    orderNo: number;
    isActive: boolean;
    totalTrainings?: number;
    createdAt?: string;
}

export interface CourseInput {
    code: string;
    name: string;
    description?: string | null;
    orderNo?: number;
    isActive?: boolean;
}