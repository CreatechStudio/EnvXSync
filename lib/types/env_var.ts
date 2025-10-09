export interface EnvVar {
    key: string;
    value: string;
    isSecret: boolean;
    createdAt: Date;
    updatedAt: Date;
}
