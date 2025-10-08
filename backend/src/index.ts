import 'dotenv/config'
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import {drizzle} from "drizzle-orm/node-postgres";

const db = drizzle(process.env.DATABSE_URL!);

const app = new Elysia()
    .use(swagger())
    .get("/", () => "Hello Elysia")
    .listen(6001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
