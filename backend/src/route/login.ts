import {Elysia, t} from "elysia";
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
                    return {
                        success: false,
                        error: 'Token expired or invalid',
                    } as ApiResponse;
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
        .use(
            rateLimit({
                duration: 60_000,
                max: 5,
                scoping: 'scoped',
                errorResponse: new Response(JSON.stringify({success: false, error: 'Too many requests, please try again later.'}), {
                    status: 200,
                    headers: {'Content-Type': 'application/json'}
                })
            })
        )
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
                return {
                    success: true,
                    data: newUser,
                } as ApiResponse<User>;
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
    )
    .group('login', (app) => app
        .use(
            rateLimit({
                duration: 60_000,
                max: 1,
                scoping: 'scoped',
                errorResponse: new Response(JSON.stringify({success: false, error: 'Too many requests, please try again later.'}), {
                    status: 200,
                    headers: {'Content-Type': 'application/json'}
                })
            })
        )
        .post('reset-password', async ({ jwt, body }) => {
            // TODO: Implement password reset via email
        })
    )
