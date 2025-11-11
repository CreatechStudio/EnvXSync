import base64 from "base-64";
import { Elysia, status, t } from "elysia";
import { ApiResponse } from "../../../lib/types/api";
import { Token } from "../../../lib/types/token";
import { TokenRuntime } from "../runtime/token";
import { rateLimit } from "elysia-rate-limit";

export const TokenRoute = new Elysia()
    .decorate("token", new TokenRuntime())
    .group("token", (app) =>
        app
            .use(
                rateLimit({
                    duration: 60_000,
                    max: 1,
                    errorResponse: new Response(
                        JSON.stringify({
                            success: false,
                            error: `Too many requests`,
                        }),
                        {
                            status: 200,
                            headers: { "Content-Type": "application/json" },
                        },
                    ),
                    scoping: "scoped",
                    generator: (request, server) => {
                        const ip =
                            server?.requestIP(request)?.address ||
                            request.headers
                                .get("x-forwarded-for")
                                ?.split(",")[0]
                                ?.trim() ||
                            request.headers.get("cf-connecting-ip") ||
                            "127.0.0.1";
                        return ip;
                    },
                }),
            )
            .post(
                "generate",
                async ({ token, cookie: { auth }, body }) => {
                    try {
                        let newToken;
                        let userId;
                        if (body.type === "email_verification") {
                            if (!auth) throw new Error("Missing auth cookie");
                            const parts = auth.toString().split(".");
                            if (parts.length !== 3)
                                throw new Error("Invalid auth token format");
                            try {
                                userId = JSON.parse(base64.decode(parts[1])).id;
                            } catch {
                                throw new Error(
                                    "Invalid base64 encoding in auth token",
                                );
                            }
                            newToken = await token.generateToken(
                                body.type,
                                userId,
                                body.email || "",
                            );
                        } else if (body.type === "password_reset") {
                            if (!body.email)
                                throw new Error(
                                    "Missing email for password reset",
                                );
                            newToken = await token.generateToken(
                                body.type,
                                "",
                                body.email,
                            );
                        } else {
                            throw new Error("Invalid parameters");
                        }
                        return {
                            success: true,
                            data: newToken,
                        } as ApiResponse<Token>;
                    } catch (e) {
                        return {
                            success: false,
                            // @ts-ignore
                            error: e?.message || e,
                        } as ApiResponse;
                    }
                },
                {
                    body: t.Object({
                        type: t.String(),
                        email: t.Optional(t.String()),
                    }),
                },
            ),
    )
    .group("token", (app) =>
        app
            .use(
                rateLimit({
                    duration: 60_000,
                    max: 5,
                    errorResponse: new Response(
                        JSON.stringify({
                            success: false,
                            error: `Try 1 minute later`,
                        }),
                        {
                            status: 200,
                            headers: { "Content-Type": "application/json" },
                        },
                    ),
                    scoping: "scoped",
                    generator: (request, server) => {
                        const ip =
                            server?.requestIP(request)?.address ||
                            request.headers
                                .get("x-forwarded-for")
                                ?.split(",")[0]
                                ?.trim() ||
                            request.headers.get("cf-connecting-ip") ||
                            "127.0.0.1";
                        return ip;
                    },
                }),
            )
            .post(
                "verify",
                async ({ token, cookie: { auth }, body }) => {
                    try {
                        let userId = "";
                        if (body.type === "email_verification") {
                            if (!auth) throw new Error("Missing auth cookie");
                            const parts = auth.toString().split(".");
                            if (parts.length !== 3)
                                throw new Error("Invalid auth token format");
                            try {
                                userId = JSON.parse(base64.decode(parts[1])).id;
                            } catch {
                                throw new Error(
                                    "Invalid base64 encoding in auth token",
                                );
                            }
                        }
                        const result = await token.verifyToken(
                            body.type,
                            body.token,
                            userId,
                            body.email,
                        );
                        return {
                            success: true,
                            data: result,
                        } as ApiResponse<string>;
                    } catch (e) {
                        return {
                            success: false,
                            // @ts-ignore
                            error: e?.message || e,
                        } as ApiResponse;
                    }
                },
                {
                    body: t.Object({
                        token: t.String(),
                        type: t.String(),
                        email: t.String(),
                    }),
                },
            ),
    );
