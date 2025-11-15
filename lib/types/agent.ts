export interface Agent {
    id: string;
    name: string;
    status: 'pending' | 'online' | 'offline' | 'error';
    lastSeen: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string;
    os?: string;
    arch?: string;
    version?: string;
    projectIDs: string[];
    taskIDs: string[];
    creatorID: string;

    accessKeyHash: string;
    refreshKeyHash: string;
    accessKeyExpiresAt: Date;
    refreshKeyExpiresAt: Date;
    revoked?: boolean;
}

export interface AgentKeyPair {
    agentId: string;
    accessToken: string;
    refreshToken: string;
    accessKeyExpiresAt: Date;
    refreshKeyExpiresAt: Date;
}

export interface AgentTask {
    id: string;
    agentID: string;
    command: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: string;
    createdAt: Date;
    executedAt?: Date;
    completedAt?: Date;
}
