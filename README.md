# Pay Alert (Frontend + Backend)

This project contains:

- A Lovable-generated React frontend (`/src`)
- A new TypeScript backend (`/backend`) for auth + persistent data

## Frontend (existing)

```bash
npm install
npm run dev
```

## Backend (new)

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Backend runs on `http://localhost:4000` by default.

## Environment variables

Frontend (`.env`):

```bash
VITE_API_URL=http://localhost:4000
```

Backend (`backend/.env`):

- `DATABASE_URL`
- `FRONTEND_ORIGIN`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- token TTL and port values

See `backend/.env.example`.

## Documentation

See [BACKEND.md](./BACKEND.md) for:

- architecture decisions
- authentication flow
- security best practices
- API endpoints and integration guidance

## How to add these backend files to your repo

If your local branch already has the backend files and you want to push them to GitHub:

```bash
git add BACKEND.md backend src/lib/backend-api.ts README.md
git commit -m "Add backend auth and database scaffold"
git push origin <your-branch-name>
```

If you want to open a pull request after pushing:

```bash
# GitHub CLI example
gh pr create --title "Add backend auth and database scaffold" --body "Adds Express + Prisma backend with JWT auth and integration docs."
```

If the files are not present locally yet, first copy/create them, then run `git add`, `git commit`, and `git push` as above.
