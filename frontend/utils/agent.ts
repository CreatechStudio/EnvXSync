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
        ipAddress: "10.217.35.29"
    },
    {
        id: "2",
        name: "Agent Two",
        status: "offline",
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        projectIDs: ["1", "2"],
        ipAddress: "120.117.52.173"
    },
    {
        id: "3",
        name: "Agent Three",
        status: "error",
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        projectIDs: ["1", "2"]
    },
    {
        id: "4",
        name: "Agent Four",
        status: "online",
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        projectIDs: ["1", "2"]
    }
];
