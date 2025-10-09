export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    creatorID: string;
    envVarIDs: string[];
}
