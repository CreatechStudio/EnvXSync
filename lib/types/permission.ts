export interface Permission {
    id: string;
    name: string;
    description?: string;
    priority: number;
    userIDs: string[];
    groupIDs: string[];
    createdAt: Date;
    updatedAt: Date;
    updatedBy: string;
    resourceType: 'project' | 'agent' | 'user' | 'group';
    resourceIDs: string[];
    level: 'deny' | 'read' | 'write' | 'admin';
}
