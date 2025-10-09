import {EnvVar} from "./env_var";

export interface Project {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    creatorID: string;
    envVars: EnvVar[];
}
