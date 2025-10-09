import {Project} from "../../lib/types/project";
import {Agent} from "../../lib/types/agent";
import {SAMPLE_AGENTS} from "@/utils/agent";


const PROJECT_SAMPLE_DATA: Project[] = [
    {
        id: "1",
        name: "Project Alpha",
        description: "This is the first project.",
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorID: "123",
        envVars: [
            {
                key: "EXTERNAL_URL",
                value: "https://test.example.com",
                isSecret: false,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: "API_KEY",
                value: "1234567890abcdef",
                isSecret: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                key: "DATABASE_URL",
                value: "postgres://user:password@localhost:5432/dbname",
                isSecret: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]
    },
    {
        id: "2",
        name: "Project Beta",
        description: "This is the second project.",
        createdAt: new Date(),
        updatedAt: new Date('2025-10-01T10:00:00Z'),
        creatorID: "234",
        envVars: []
    },
    {
        id: "3",
        name: "Project Beta",
        description: "This is the second project.",
        createdAt: new Date(),
        updatedAt: new Date('2025-03-01T10:00:00Z'),
        creatorID: "234",
        envVars: []
    },
    {
        id: "4",
        name: "Project Beta",
        description: "This is the second project.",
        createdAt: new Date(),
        updatedAt: new Date('2024-10-01T10:00:00Z'),
        creatorID: "234",
        envVars: []
    },
    {
        id: "5",
        name: "Project Beta",
        description: "This is the second project.",
        createdAt: new Date(),
        updatedAt: new Date('2023-10-01T10:00:00Z'),
        creatorID: "234",
        envVars: []
    }
];

export function getProjects(): Project[] {
    return PROJECT_SAMPLE_DATA;
}

export function getProjectById(projectID: string): Project | null {
    const p = PROJECT_SAMPLE_DATA.filter((project: Project) => project.id === projectID);
    return p.length > 0 ? p[0] : null;
}

export function getProjectAgents(projectID: string): Agent[] {
    return SAMPLE_AGENTS.filter((agent: Agent) => agent.projectIDs.includes(projectID));
}
