export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
    oidcID?: string;
    groupIDs: string[];
}

export interface UserGroup {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
