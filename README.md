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
