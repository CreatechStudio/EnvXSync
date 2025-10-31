set windows-shell := ["powershell.exe", "-c"]

default:
	just --list

dev-frontend:
	cd frontend; \
	pnpm i; \
	pnpm run dev; \

dev-backend:
	cd compose; \
	docker compose -f ./backend.test.yml up -d; \
	cd ../backend; \
	bun i; \
	bun run dev; \
