import {Elysia, status, t} from "elysia";
import {ApiResponse} from "../../../lib/types/api";
import jwt from "@elysiajs/jwt";
import {UserRuntime} from "../runtime/user";
import {User} from "../../../lib/types/user";
import dotenv from "dotenv";
import {randomUUID} from "crypto";
import dayjs from "dayjs";
import PermissionRuntime from "../runtime/permission";

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
        .guard(
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
                .post('reset-password', async ({ user, body, cookie: { auth } }) => {
                    try {
                        const me = await user.fetch(auth.toString() || '');
                        if (me) {
                            const resetResult = await user.resetPassword(body.tokenId, me.id, body.newPasswordHash);
                            if (resetResult) {
                                return {
                                    success: true,
                                    data: resetResult,
                                } as ApiResponse<User>;
                            } else {
                                throw "Reset password failed";
                            }
                        }
                        throw "User not found";
                    } catch (e) {
                        return {
                            success: false,
                            error: e,
                        } as ApiResponse;
                    }
                }, {
                    body: t.Object({
                        tokenId: t.String(),
                        newPasswordHash: t.String()
                    })
                })
        )
    )
