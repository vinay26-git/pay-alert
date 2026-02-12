# Backend architecture for Pay Alert

This repository now includes a production-friendly backend in `backend/` using:

- **Node.js + Express + TypeScript** for fast development and compatibility with your Vite frontend.
- **Prisma ORM + PostgreSQL** for typed database access and easy migrations.
- **JWT auth** with **short-lived access tokens** and **httpOnly refresh cookies**.

## Why this stack

- Works well with your existing TypeScript frontend.
- Keeps authentication explicit and framework-agnostic.
- Prisma gives you schema-driven models for users, payments, and budgets.

## API overview

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Payments and budgets (authenticated)

- `GET/POST/PUT/DELETE /api/payments`
- `GET/PUT /api/budgets`

## Security best practices already applied

1. **Passwords are hashed** with `bcryptjs` (cost 12).
2. **Access token and refresh token are split**.
3. **Refresh token is stored in httpOnly cookie** to reduce XSS token theft.
4. **Refresh tokens are hashed before DB storage**.
5. **Strict CORS** is enabled for your frontend origin only.
6. **Helmet** hardens default HTTP headers.
7. **Per-user record ownership** is enforced on payment/budget CRUD.
8. **Schema validation** is done with `zod` on incoming payloads.

## Quick start

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Then in frontend `.env`:

```bash
VITE_API_URL=http://localhost:4000
```

## Frontend integration pattern

Use the included `src/lib/backend-api.ts` class:

- Stores access token in memory.
- Automatically sends cookies with `credentials: "include"`.
- Retries once after calling `/api/auth/refresh` when access token expires.

## Optional next steps for production

- Add rate limiting (`express-rate-limit`) for `/login` and `/refresh`.
- Add audit logs for auth events.
- Add background jobs for payment reminders.
- Use managed secrets and DB (AWS/GCP/Render/Fly.io).
- Add integration tests with a test database.
