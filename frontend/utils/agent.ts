import {Agent, AgentTask} from "../../lib/types/agent";

export const SAMPLE_AGENTS: Agent[] = [
    {
        id: "1",
        name: "Agent One",
        status: "online",
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        projectIDs: ["1", "2"],
        ipAddress: "10.217.35.29",
        taskIDs: [],
        os: "Linux",
        arch: "arm64",
        creatorID: "1"
    },
    {
        id: "2",
        name: "Agent Two",
        status: "offline",
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        projectIDs: ["1", "2"],
        ipAddress: "120.117.52.173",
        taskIDs: [],
        os: "Windows",
        arch: "x64",
        creatorID: "2"
    },
    {
        id: "3",
        name: "Agent Three",
        status: "error",
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        projectIDs: ["1", "2"],
        taskIDs: [],
        os: "macOS",
        creatorID: "1"
    },
    {
        id: "4",
        name: "Agent Four",
        status: "pending",
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        projectIDs: ["1", "2"],
        taskIDs: [],
        creatorID: "1"
    }
];

const SAMPLE_AGENT_TASKS: AgentTask[] = [
    {
        id: "1",
        agentID: "1",
        command: "open",
        status: "pending",
        result: "",
        createdAt: new Date()
    },
    {
        id: "2",
        agentID: "1",
        command: "close",
        status: "pending",
        result: "",
        createdAt: new Date()
    },
    {
        id: "3",
        agentID: "2",
        command: "close",
        status: "pending",
        result: "",
        createdAt: new Date()
    },
    {
        id: "4",
        agentID: "1",
        command: "close",
        status: "completed",
        result: "",
        createdAt: new Date()
    },
    {
        id: "5",
        agentID: "1",
        command: "close",
        status: "failed",
        result: "",
        createdAt: new Date()
    }
]

export function getAgentById(agentID: string): Agent | null {
    const a = SAMPLE_AGENTS.filter((agent: Agent) => agent.id === agentID);
    return a.length > 0 ? a[0] : null;
}

export function getAgentTasks(agentID: string): AgentTask[] {
    const tasks: AgentTask[] = [];
    SAMPLE_AGENT_TASKS.forEach(task => {
        if (task.agentID === agentID) {
            tasks.push(task);
        }
    });
    return tasks;
}
