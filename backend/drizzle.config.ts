import 'dotenv/config';
import {defineConfig} from "drizzle-kit";
import {configDotenv} from "dotenv";

configDotenv({
    path: '.env.development.local'
});

// https://orm.drizzle.team/docs/get-started/postgresql-new

// merge changes
// bun run drizzle-kit push

export default defineConfig({
    out: './drizzle',
    schema: [
        './src/db/user.ts',
    ],
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    }
});
