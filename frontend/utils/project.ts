import {Project} from "../../lib/types/project";
import {Agent} from "../../lib/types/agent";
import {SAMPLE_AGENTS} from "@/utils/agent";
import {EnvVar} from "../../lib/types/env_var";
import {get} from "@/utils/network";
import {ApiResponse} from "../../lib/types/api";
import {addToast} from "@heroui/toast";

const ENV_VAR_SAMPLE_DATA: EnvVar[] = [
    {
        id: "1",
        key: "EXTERNAL_URL",
        value: "https://test.example.com",
        isSecret: false,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "2",
        key: "API_KEY",
        value: "1234567890abcdef",
        isSecret: true,
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "3",
        key: "DATABASE_URL",
        value: "postgres://user:password@localhost:5432/dbname",
        isSecret: true,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

const PROJECT_SAMPLE_DATA: Project[] = [
    {
        id: "1",
        name: "Project Alpha",
        description: "This is the first project.",
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorID: "123",
        envVarIDs: ["1", "2", "3"],
        reloadOnChange: false,
        updatedBy: ""
    },
    {
        id: "2",
        name: "Project Beta",
        description: "This is the second project.",
        createdAt: new Date(),
        updatedAt: new Date('2025-10-01T10:00:00Z'),
        creatorID: "234",
        envVarIDs: ["1", "2", "3"],
        reloadOnChange: false,
        updatedBy: ""
    },
    {
        id: "3",
        name: "Project Beta",
        description: "This is the second project.",
        createdAt: new Date(),
        updatedAt: new Date('2025-03-01T10:00:00Z'),
        creatorID: "234",
        envVarIDs: [],
        reloadOnChange: false,
        updatedBy: ""
    },
    {
        id: "4",
        name: "Project Beta",
        description: "This is the second project.",
        createdAt: new Date(),
        updatedAt: new Date('2024-10-01T10:00:00Z'),
        creatorID: "234",
        envVarIDs: [],
        reloadOnChange: false,
        updatedBy: ""
    },
    {
        id: "5",
        name: "Project Beta",
        description: "This is the second project.",
        createdAt: new Date(),
        updatedAt: new Date('2023-10-01T10:00:00Z'),
        creatorID: "234",
        envVarIDs: [],
        reloadOnChange: false,
        updatedBy: ""
    }
];

export async function getProjects(): Promise<Project[]> {
    return await get("/project/info/fetch").then((data: ApiResponse<Project[]>) => {
        if (data.success) {
            if (data.data) {
                const p: Project[] = [];
                data.data.forEach((project) => {
                    p.push({
                        ...project,
                        updatedAt: new Date(project.updatedAt),
                        createdAt: new Date(project.createdAt),
                    });
                });
                return p;
            } else {
                return [];
            }
        } else {
            addToast({
                title: data.error,
                color: "danger"
            });
            return [];
        }
    }).catch(() => {
        addToast({
            title: "Failed to fetch project list",
            color: "danger"
        });
        return [];
    });
}

export function getProjectById(projectID: string): Project | null {
    const p = PROJECT_SAMPLE_DATA.filter((project: Project) => project.id === projectID);
    return p.length > 0 ? p[0] : null;
}

export function getProjectAgents(projectID: string): Agent[] {
    return SAMPLE_AGENTS.filter((agent: Agent) => agent.projectIDs.includes(projectID));
}

export function getEnvVarsByIds(ids: string[]): EnvVar[] {
    const envs = ENV_VAR_SAMPLE_DATA.filter((envVar) => ids.includes(envVar.id));
    const envsCopy: EnvVar[] = [];
    envs.forEach(envVar => {
        if (envVar.isSecret) {
            envsCopy.push({...envVar, value: "********"});
        } else {
            envsCopy.push({...envVar});
        }
    });
    return envsCopy;
}

export function getEnvVarSecretValueById(id: string): string {
    const env = ENV_VAR_SAMPLE_DATA.find((envVar) => envVar.id === id);
    if (env && env.isSecret) {
        return env.value;
    }
    return "";
}
