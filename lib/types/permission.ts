export interface Permission {
    id: string;
    name: string;
    userIDs: string[];
    groupIDs: string[];
    createdAt: Date;
    updatedAt: Date;
    resourceType: 'project' | 'agent' | 'user' | 'group';
    resourceIDs: string[];
    level: 'read' | 'write' | 'admin';
}
