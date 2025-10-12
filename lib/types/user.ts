export interface User {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
    oidcID?: string;
    role: 'admin' | 'user';
    groupIDs: string[];
    avatarURL?: string;
}

export interface UserGroup {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
