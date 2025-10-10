export interface Project {
    id: string;
    name: string;
    description?: string;
    reloadOnChange: boolean;
    reloadCommand?: string;
    createdAt: Date;
    updatedAt: Date;
    creatorID: string;
    envVarIDs: string[];
}
