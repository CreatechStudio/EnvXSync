set windows-shell := ["powershell.exe", "-c"]

@default:
	just --list

@frontend:
	cd frontend; \
	just; \

@backend:
	cd backend; \
	just; \
