# EnvXSync Backend

## Development

1. Enter `test` directory and run `docker compose up -d` to start local development db.
2. Create local `.env.development.local` file based on [`.env.example`](./.env.example).
3. Run `bun run dev` to start the development server. 
4. Open `http://localhost:6001` by default to see the server running. 
5. Open `http://localhost:6001/swagger` to see the API documentation.

> `/test` api would only appear when variable `ENV` is set to `development`.
> It is only for some local test purpose.
> **DO NOT** use it in production.
