import {Elysia, status, t} from "elysia";
import {ApiResponse} from "../../../lib/types/api";
import jwt from "@elysiajs/jwt";
import {UserRuntime} from "../runtime/user";
import {User} from "../../../lib/types/user";
import dotenv from "dotenv";
import {randomUUID} from "crypto";
import dayjs from "dayjs";
import {rateLimit} from "elysia-rate-limit";

dotenv.config()
export const JWT_SECRET = process.env.EXS_JWT_SECRET || randomUUID()

export const LoginRoute = new Elysia()
    .decorate('user', new UserRuntime())
    .use(
        jwt({
            name: 'jwt',
            secret: JWT_SECRET,
        })
    )
    .group('login', (app) => app
        .get('logout', ({ cookie: { auth } }) => {
            auth.remove();
            return { success: true } as ApiResponse;
        })
        .post('verify', async ({ jwt, body }) => {
            try {
                const token = body.cookie.toString() || '';
                const payload = await jwt.verify(token) as { exp?: number };
                if (payload && payload.exp && payload.exp > dayjs().unix()) {
                    return {
                        success: true,
                        data: true,
                    } as ApiResponse<Boolean>;
                } else {
                    throw "Token is invalid or expired";
                }
            } catch (e) {
                return {
                    success: false,
                    error: e,
                } as ApiResponse;
            }
        }, {
            body: t.Object({
                cookie: t.String()
            })
        })
    )
    .group('login', (app) => app
        .use(rateLimit({
            duration: 60_000,
            max: 5,
            errorResponse: new Response(
                JSON.stringify({
                    success: false,
                    error: `Too many requests`
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            ),
            scoping: "scoped",
            generator: (request, server) => {
                const ip = server?.requestIP(request)?.address
                    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
                    || request.headers.get("cf-connecting-ip")
                    || "127.0.0.1";
                return ip;
            }
        }))
        .post('login', async ({ user, jwt, cookie: { auth } ,body: {email, passwordHash}}) => {
            try {
                let authorizeAnswer = await user.doLogin(email, passwordHash);
                if (authorizeAnswer) {
                    auth.set({
                        value: await jwt.sign({
                            id: authorizeAnswer.id,
                            email: authorizeAnswer.email,
                            exp: dayjs().add(5, 'day').unix()
                        }),
                        httpOnly: true,
                        maxAge: 5 * 86400,
                    })
                    return {
                        success: true,
                        data: authorizeAnswer,
                    } as ApiResponse<User>;
                } else {
                    throw "Login failed";
                }
            } catch (e) {
                return {
                    success: false,
                    error: e,
                } as ApiResponse;
            }
        }, {
            body: t.Object({
                email: t.String(),
                passwordHash: t.String()
            })
        })
        .post('register', async ({ user, body: { name, email, passwordHash } }) => {
            try {
                const newUser = await user.newPasswordUser(name, email, passwordHash);
                if (newUser) {
                    return {
                        success: true,
                        data: newUser,
                    } as ApiResponse<User>;
                } else {
                    throw "Register failed";
                }
            } catch (e) {
                return {
                    success: false,
                    error: e,
                } as ApiResponse;
            }
        }, {
            body: t.Object({
                name: t.String(),
                email: t.String(),
                passwordHash: t.String()
            })
        })
        .post('reset-password', async ({ user, body, cookie: { auth } }) => {
            try {
                const resetResult = await user.resetPassword(body.tokenId, body.email, body.newPasswordHash);
                if (resetResult) {
                    return {
                        success: true,
                        data: resetResult,
                    } as ApiResponse<User>;
                } else {
                    throw "Reset password failed";
                }
            } catch (e) {
                return {
                    success: false,
                    error: e,
                } as ApiResponse;
            }
        }, {
            body: t.Object({
                tokenId: t.String(),
                email: t.String(),
                newPasswordHash: t.String()
            })
        })
    )
