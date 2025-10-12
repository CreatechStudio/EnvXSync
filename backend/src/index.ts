import {Elysia, t} from "elysia";
import { swagger } from "@elysiajs/swagger";
import {TestRoute} from "./route/test";
import cors from "@elysiajs/cors";
import {logger} from "@bogeychan/elysia-logger";
import dotenv from 'dotenv';
import {UserRoute} from "./route/user";
import {LoginRoute} from "./route/login";
import {TokenRoute} from "./route/token";
import {ip} from "elysia-ip";

dotenv.config()
export const BASE_URL = process.env.EXS_BASE_URL || "http://localhost:6000"
export const WEB_URL = process.env.EXS_WEB_URL || "http://localhost:3000"
export const SMTP_HOST = process.env.EXS_SMTP_HOST || ""
export const SMTP_PORT = process.env.EXS_SMTP_PORT ? parseInt(process.env.EXS_SMTP_PORT) : 465
export const SMTP_FROM = process.env.EXS_SMTP_FROM || ""
export const SMTP_USER = process.env.EXS_SMTP_USERNAME || ""
export const SMTP_PASSWORD = process.env.EXS_SMTP_PASSWORD || ""

const app = new Elysia()
    .use(ip())
    .use(swagger())
    .use(cors({
        origin: process.env.WEB_URL || 'http://localhost:3000',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Origin', 'Cookie', 'Accept']
    }))
    .use(logger({
        stream: process.stdout,
        level: "error",
    }))

    .use(UserRoute)
    .use(LoginRoute)
    .use(TokenRoute)

    .get('/ping', () => {return 'Pong!'})
    .get('/env/:prefix', async ({params: {prefix}}) => {
        let env: {[Keys: string]: string} = {};
        const localEnv = process.env;
        Object.keys(localEnv).forEach(key => {
            if (key.startsWith(prefix)) {
                env[key] = localEnv[key] || "";
            }
        });
        ['EXS_JWT_SECRET', 'EXS_SMTP_PASSWORD'].forEach(key => {
            if (key in env) {
                delete env[key];
            }
        });
        return env;
    }, {
        params: t.Object({
            prefix: t.String()
        })
    })
    .listen(process.env.PORT ?? 6001)


if (process.env.ENV === "development") {
    app.get("/", () => "Welcome to EnvXSync Backend!")
    app.use(TestRoute);
}

console.log(
    `🦊 EnvXSync Backend is running at http://${app.server?.hostname}:${app.server?.port} \n📚 Swagger UI: http://${app.server?.hostname}:${app.server?.port}/swagger`
);
