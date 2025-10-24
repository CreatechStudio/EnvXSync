import {Agent} from "../../lib/types/agent";

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

export function getAgentById(agentID: string): Agent | null {
    const a = SAMPLE_AGENTS.filter((agent: Agent) => agent.id === agentID);
    return a.length > 0 ? a[0] : null;
}
