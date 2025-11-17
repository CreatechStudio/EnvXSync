import {Project} from "../../lib/types/project";
import {Agent} from "../../lib/types/agent";
import {EnvVar} from "../../lib/types/env_var";
import {get, post} from "@/utils/network";
import {ApiResponse} from "../../lib/types/api";
import {addToast} from "@heroui/toast";

export async function getProjects(): Promise<Project[]> {
    return await get("/project/info/list").then((data: ApiResponse<Project[]>) => {
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

export async function getProjectById(projectID: string): Promise<Project | null> {
    return await get(`/project/info/fetch/${projectID}`).then((data: ApiResponse<Project>) => {
        if (data.success && data.data) {
            return data.data;
        } else {
            addToast({
                title: data.error || "Failed to fetch project details",
                color: "danger"
            });
            return null;
        }
    }).catch(() => {
        addToast({
            title: "Failed to fetch project details",
            color: "danger"
        });
        return null;
    });
}

export function getProjectAgents(projectID: string): Agent[] {
    return [];
}

export async function getEnvVarsByIds(ids: string[]): Promise<EnvVar[]> {
    if (ids.length === 0) {
        return [];
    }
    return await post("/project/env/fetch/batch", {ids}).then((data: ApiResponse<EnvVar[]>) => {
        if (data.success && data.data !== undefined) {
            const envVars: EnvVar[] = [];
            data.data.forEach((envVar: EnvVar) => {
                envVars.push({
                    ...envVar,
                    updatedAt: new Date(envVar.updatedAt),
                    createdAt: new Date(envVar.createdAt),
                    value: envVar.isSecret ? "********" : envVar.value
                });
            });
            return envVars;
        } else {
            addToast({
                title: data.error || "Failed to fetch env vars",
                color: "danger"
            });
            return [];
        }
    }).catch(() => {
        addToast({
            title: "Failed to fetch env vars",
            color: "danger"
        });
        return [];
    });
}

export async function getEnvVarSecretValueById(id: string): Promise<string | null> {
    return await get(`/project/env/secret/value/${id}`).then((data: ApiResponse<string>) => {
        if (data.success && data.data !== undefined) {
            return data.data;
        } else {
            addToast({
                title: data.error || "Failed to fetch secret",
                color: "danger"
            });
            return null;
        }
    }).catch(() => {
        addToast({
            title: "Failed to fetch secret",
            color: "danger"
        });
        return null;
    });
}

export async function updateProject(newProject: Project): Promise<boolean> {
    return await post("/project/info/update", {
        id: newProject.id,
        name: newProject.name,
        description: newProject.description,
        reloadOnChange: newProject.reloadOnChange,
    }).then((data: ApiResponse) => {
        if (data.success) {
            return true;
        } else {
            addToast({
                title: data.error || "Failed to update project",
                color: "danger"
            });
            return false;
        }
    }).catch(() => {
        addToast({
            title: "Failed to update project",
            color: "danger"
        });
        return false;
    });
}
