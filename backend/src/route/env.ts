import { Elysia, status, t } from "elysia";
import PermissionRuntime from "../runtime/permission";
import { ApiResponse } from "../../../lib/types/api";
import EnvRuntime from "../runtime/env";
import { EnvVar } from "../../../lib/types/env_var";

export const EnvRoute = new Elysia()
    .decorate("env", new EnvRuntime())
    .group("project/env", (app) =>
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
                app
                    .get("fetch/:id", async ({ env, params }) => {
                        try {
                            const envVar = await env.getEnvVarByID(params.id);
                            return {
                                success: true,
                                data: envVar,
                            } as ApiResponse<EnvVar>;
                        } catch (e) {
                            return {
                                success: false,
                                error: e,
                            } as ApiResponse;
                        }
                    })
                    .post(
                        "fetch/batch",
                        async ({ env, body }) => {
                            try {
                                const envVars = await env.getBatchEnvVarsByIDs(
                                    body.ids,
                                );
                                return {
                                    success: true,
                                    data: envVars,
                                } as ApiResponse<EnvVar[]>;
                            } catch (e) {
                                return {
                                    success: false,
                                    error: e,
                                } as ApiResponse;
                            }
                        },
                        {
                            body: t.Object({
                                ids: t.Array(t.String()),
                            }),
                        },
                    )
                    .post(
                        "create",
                        async ({ env, body }) => {
                            try {
                                const newEnvVar = await env.createEnvVar(
                                    body.key,
                                    body.value,
                                    body.isSecret,
                                    body.bindTo,
                                );
                                return {
                                    success: true,
                                    data: newEnvVar,
                                } as ApiResponse<EnvVar>;
                            } catch (e) {
                                return {
                                    success: false,
                                    error: e,
                                } as ApiResponse;
                            }
                        },
                        {
                            body: t.Object({
                                key: t.String(),
                                value: t.String(),
                                isSecret: t.Boolean(),
                                bindTo: t.String(),
                            }),
                        },
                    )
                    .delete("delete/:id", async ({ env, params }) => {
                        try {
                            await env.deleteEnvVar(params.id);
                            return {
                                success: true,
                            } as ApiResponse;
                        } catch (e) {
                            return {
                                success: false,
                                error: e,
                            } as ApiResponse;
                        }
                    })
                    .post(
                        "update/:id",
                        async ({ env, params, body }) => {
                            try {
                                const updatedEnvVar = await env.updateEnvVar(
                                    params.id,
                                    body.key,
                                    body.value,
                                    body.isSecret,
                                );
                                return {
                                    success: true,
                                    data: updatedEnvVar,
                                } as ApiResponse<EnvVar>;
                            } catch (e) {
                                return {
                                    success: false,
                                    error: e,
                                } as ApiResponse;
                            }
                        },
                        {
                            body: t.Object({
                                key: t.String(),
                                value: t.String(),
                                isSecret: t.Boolean(),
                            }),
                        },
                    )
                    .group("secret", (app) =>
                        app.get("value/:id", async ({ env, params }) => {
                            try {
                                const secretValue =
                                    await env.getSecretEnvVarValue(params.id);
                                return {
                                    success: true,
                                    data: secretValue,
                                } as ApiResponse<string>;
                            } catch (e) {
                                return {
                                    success: false,
                                    error: e,
                                } as ApiResponse;
                            }
                        }),
                    ),
        ),
    );
