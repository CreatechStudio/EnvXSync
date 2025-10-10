import {Elysia, t} from "elysia";
import {ApiResponse} from "../../../lib/types/api";
import jwt from "@elysiajs/jwt";
import {UserRuntime} from "../runtime/user";
import {User} from "../../../lib/types/user";
import dotenv from "dotenv";
import {randomUUID} from "crypto";

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
        .post('verify', async ({ jwt, body }) => {
            try {
                let verifyAnswer = await jwt.verify(body.cookie.toString() || '') as Boolean;
                if (verifyAnswer) {
                    return {
                        success: true,
                        data: verifyAnswer,
                    } as ApiResponse<Boolean>;
                } else {
                    return {
                        success: false,
                        error: 'Invalid token',
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
        .post('login', async ({ user, jwt, cookie: { auth } ,body: {email, passwordHash}}) => {
            try {
                let authorizeAnswer = await user.doLogin(email, passwordHash);
                if (authorizeAnswer) {
                    auth.set({
                        value: await jwt.sign({id: authorizeAnswer.id, email: authorizeAnswer.email}),
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
        .get('logout', ({ cookie: { auth } }) => {
            auth.remove();
        })
    )