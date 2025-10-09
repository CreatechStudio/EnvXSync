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
