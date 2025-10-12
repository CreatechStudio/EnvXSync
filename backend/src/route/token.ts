import base64 from "base-64";
import { Elysia, status, t } from "elysia";
import { ApiResponse } from "../../../lib/types/api";
import { Token } from "../../../lib/types/token";
import { TokenRuntime } from "../runtime/token";
import PermissionRuntime from "../runtime/permission";
import { rateLimit } from "elysia-rate-limit";

export const TokenRoute = new Elysia()
    .decorate('token', new TokenRuntime())
    .group('token', (app) =>
        app.guard(
            {
                async beforeHandle({ cookie: { auth } }) {
                    if (auth) {
                        try {
                            let permissionRuntime = new PermissionRuntime();
                            if (await permissionRuntime.verifyJWT(auth.toString() || '')) {
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
                        return status(401, "Unauthorized")
                    }
                }
            },
            (app) => app
                .use(
                    rateLimit({
                        duration: 60_000,
                        max: 5,
                        scoping: 'scoped',
                        errorResponse: new Response(JSON.stringify({ success: false, error: 'Too many requests, please try again later.' }), {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        })
                    })
                )
                .post('generate', async ({ token, cookie: { auth }, body }) => {
                    try {
                        let userId = JSON.parse(base64.decode(auth.toString().split(".")[1])).id;
                        let newToken = await token.generateToken(userId || "", body.type);
                        return {
                            success: true,
                            data: newToken,
                        } as ApiResponse<Token>;
                    } catch (e) {
                        return {
                            success: false,
                            error: e,
                        } as ApiResponse;
                    }
                }, {
                    body: t.Object({
                        type: t.String()
                    })
                })
                .post('verify', async ({ token, cookie: { auth }, body }) => {
                    try {
                        let userId = JSON.parse(base64.decode(auth.toString().split(".")[1])).id;
                        let result = await token.verifyToken(userId || "", body.token, body.type);
                        return {
                            success: result,
                            data: "Token verified successfully",
                        } as ApiResponse<string>;
                    } catch (e) {
                        return {
                            success: false,
                            error: e,
                        } as ApiResponse;
                    }
                }, {
                    body: t.Object({
                        token: t.String(),
                        type: t.String()
                    })
                })
        )
    );
