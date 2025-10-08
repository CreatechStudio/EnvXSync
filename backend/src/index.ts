import 'dotenv/config';
import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import {TestRoute} from "./route/test";

const app = new Elysia()
    .use(swagger())
    .get("/", () => "Hello Elysia");

if (process.env.ENV === "development") {
    app.use(TestRoute);
}

app.listen(process.env.PORT ?? 6001);

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
