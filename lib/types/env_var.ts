export interface EnvVar {
    key: string;
    value: string;
    isSecret: boolean;
    projectID: string;
    createdAt: Date;
    updatedAt: Date;
}
