import { Project } from "../../../lib/types/project";
import { projectTable } from "../db/project";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { UserRuntime } from "./user";

export default class ProjectRuntime {
    async fetchUserProjects(userId: string) {
        let allProjects: Project[] = [];
        const createdProjects = await db
            .select()
            .from(projectTable)
            .where(sql`${projectTable.creatorID} = ${userId}`)
            .then((res) => res as Project[]);
        allProjects = allProjects.concat(createdProjects);
        // TODO: Apply permission logic here
        return allProjects;
    }

    async createProject(
        userId: string,
        name: string,
        description: string,
        reloadOnChange: boolean,
    ) {
        const now = new Date();
        const user = new UserRuntime();
        const isCreatorAdmin = await user.isUserAdmin(userId);
        if (!isCreatorAdmin) throw "Only admin users can create projects";
        return await db
            .insert(projectTable)
            .values({
                name: name,
                description: description,
                reloadOnChange: reloadOnChange,
                createdAt: now,
                updatedAt: now,
                creatorID: userId,
                updatedBy: userId,
            })
            .returning()
            .then((res) => res[0] as Project);
    }

    async updateProject(
        projectId: string,
        name: string,
        description: string,
        reloadOnChange: boolean,
        userId: string,
    ) {
        let project = await this.getProjectDetail(projectId);
        if (!project) throw "Project not found";
        // TODO: Apply permission logic here
        const currentTime = new Date();
        return await db
            .update(projectTable)
            .set({
                name: name,
                description: description,
                reloadOnChange: reloadOnChange,
                updatedAt: currentTime,
                updatedBy: userId,
            })
            .where(sql`${projectTable.id} = ${projectId}`)
            .returning()
            .then((res) => res[0] as Project);
    }

    async getProjectDetail(id: string) {
        // TODO: Apply permission logic here
        try {
            return (await db
                .select()
                .from(projectTable)
                .where(sql`${projectTable.id} = ${id}`)
                .then((res) => res[0])) as Project;
        } catch (error) {
            throw "Could not fetch project";
        }
    }
}
