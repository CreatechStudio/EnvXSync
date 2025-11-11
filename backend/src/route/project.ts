import base64 from "base-64";
import { Elysia, status, t } from "elysia";
import ProjectRuntime from "../runtime/project";
import PermissionRuntime from "../runtime/permission";
import { ApiResponse } from "../../../lib/types/api";
import { Project } from "../../../lib/types/project";

export const ProjectRoute = new Elysia()
    .decorate("project", new ProjectRuntime())
    .group("project", (app) =>
        app.guard(
            {
                async beforeHandle({ cookie: { auth } }) {
                    if (auth) {
                        try {
                            let permissionRuntime = new PermissionRuntime();
                            if (
                                await permissionRuntime.verifyJWT(
                                    auth.toString() || "",
                                )
                            ) {
                                return;
                            } else {
                                return status(401, "Unauthorized");
                            }
                        } catch (e) {
                            return {
                                success: false,
                                error: e,
                            };
                        }
                    } else {
                        return status(401, "Unauthorized");
                    }
                },
            },
            (app) =>
                app.group("info", (app) =>
                    app
                        .get("list", async ({ project, cookie: { auth } }) => {
                            try {
                                const decodedId: string = JSON.parse(
                                    base64.decode(
                                        auth.toString().split(".")[1],
                                    ),
                                ).id;
                                const projects =
                                    await project.fetchUserProjects(decodedId);
                                return {
                                    success: true,
                                    data: projects,
                                } as ApiResponse<Project[]>;
                            } catch (e) {
                                return {
                                    success: false,
                                    error: e,
                                } as ApiResponse;
                            }
                        })
                        .get("fetch/:id", async ({ project, params }) => {
                            try {
                                const projectDetail =
                                    await project.getProjectDetail(params.id);
                                return {
                                    success: true,
                                    data: projectDetail,
                                } as ApiResponse<Project>;
                            } catch (e) {
                                return {
                                    success: false,
                                    error: e,
                                } as ApiResponse;
                            }
                        })
                        .post(
                            "create",
                            async ({ project, cookie: { auth }, body }) => {
                                try {
                                    const decodedId: string = JSON.parse(
                                        base64.decode(
                                            auth.toString().split(".")[1],
                                        ),
                                    ).id;
                                    const createdProject =
                                        await project.createProject(
                                            decodedId,
                                            body.name,
                                            body.description,
                                            body.reloadOnChange,
                                        );
                                    return {
                                        success: true,
                                        data: createdProject,
                                    } as ApiResponse<Project>;
                                } catch (e) {
                                    return {
                                        success: false,
                                        error: e,
                                    } as ApiResponse;
                                }
                            },
                            {
                                body: t.Object({
                                    name: t.String(),
                                    description: t.String(),
                                    reloadOnChange: t.Boolean(),
                                }),
                            },
                        )
                        .post(
                            "update",
                            async ({ project, cookie: { auth }, body }) => {
                                try {
                                    const decodedId: string = JSON.parse(
                                        base64.decode(
                                            auth.toString().split(".")[1],
                                        ),
                                    ).id;
                                    const updatedProject =
                                        await project.updateProject(
                                            body.id,
                                            body.name,
                                            body.description,
                                            body.reloadOnChange,
                                            decodedId,
                                        );
                                    return {
                                        success: true,
                                        data: updatedProject,
                                    } as ApiResponse<Project>;
                                } catch (e) {
                                    return {
                                        success: false,
                                        error: e,
                                    } as ApiResponse;
                                }
                            },
                            {
                                body: t.Object({
                                    id: t.String(),
                                    name: t.String(),
                                    description: t.String(),
                                    reloadOnChange: t.Boolean(),
                                }),
                            },
                        ),
                ),
        ),
    );
