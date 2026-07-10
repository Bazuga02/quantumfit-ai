# Technical overview — QuantumFit AI

Companion to [ARCHITECTURE.md](./ARCHITECTURE.md). Focus: **how requests flow** and **where code lives**.

---

## Monorepo layout

| Path | Role |
|------|------|
| `client/` | React SPA (Vite); own `package.json` |
| `server/` | Express API, auth, storage, AI |
| `api/` | Vercel serverless handler (`vercel.json` rewrites `/api/*` here) |
| `shared/schema.ts` | Drizzle tables, Zod insert schemas, shared TS types |
| `drizzle/` | Generated SQL migrations (`drizzle-kit`) |
| `scripts/` | `push-db.ts` (seed), `update-password.ts`, `clear-and-seed-foods.ts` |
| `swagger/openapi.yaml` | API docs at `/api-doc` (local dev only) |

**Dependencies:** Root `package.json` holds **server** deps; `client/package.json` holds **frontend** deps.

---

## Local dev request lifecycle

1. **`npm run dev`** → `server/index.ts` on port **3001**
2. **`load-env.js`** loads `.env` / `.env.local`
3. Express: JSON body parsers → Swagger UI → **CORS** (with credentials) → request logging
4. **`registerRoutes(app)`** from `server/routes/index.ts`:
   - Auth routes (`/api/register`, `/api/login`, `/api/guest-login`, `/api/logout`)
   - **`attachUser`** on `/api/*` (cookie or Bearer → `req.user`)
   - Feature routers under `/api`
5. **Development:** Vite middleware via `server/vite.ts` (same origin as API)
6. **Production Node:** `serveStatic` serves `client/dist`

---

## Vercel production

- **`vercel.json`:** `/api/*` → `api/index.ts`; everything else → `client/dist/index.html`
- **`api/index.ts`:** Lazy `registerRoutes` once per cold start; same Express app as local

---

## Authentication (summary)

- Login/register/guest → **httpOnly `auth_token` cookie** (JWT inside)
- Client: `credentials: "include"` in `client/src/lib/queryClient.ts`
- Protected routers use **`requireAuth`** middleware
- Details: [AUTHENTICATION.md](./AUTHENTICATION.md)

---

## Database

- **`server/db.ts`** — Neon HTTP driver + Drizzle
- **`server/storage.ts`** — `PostgresStorage` class; exported **`storage`** singleton
- Schema changes: `npm run db:push` or `drizzle-kit generate`

---

## Key route modules

| Router | Prefix examples |
|--------|-----------------|
| `user.ts` | `GET/PATCH /api/user` |
| `workout-plans.ts` | `/api/workout-plans` |
| `meals.ts` | `/api/meals`, `/api/meal-plans` |
| `foods.ts`, `exercises.ts` | Public read catalogs |
| `water.ts` | `/api/water-intake` |
| `measurements.ts` | `/api/measurements` |
| `progress.ts` | `/api/progress-photos`, `/api/cloudinary-signature`, trained body parts |
| `nutrition-summary.ts` | `/api/nutrition-summary` |
| `ai.ts` | `/api/ai/*` (Groq via `server/openai.ts`) |

---

## Environment variables

See [`.env.example`](./.env.example). Required for production:

- `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (progress photos)
- Optional: `GUEST_NAME`, rate-limit vars, `API_DEBUG`

---

## NPM scripts

| Script | Action |
|--------|--------|
| `npm run dev` | Express + Vite on :3001 |
| `npm run build` | Build client → `client/dist` |
| `npm run check` | Root TypeScript check |
| `npm run db:push` | Drizzle schema push |
| `npm run db:seed` | Seed via `scripts/push-db.ts` |
| `npm run db:update-password` | `tsx scripts/update-password.ts <email> <password>` |

---

*For interview-depth backend/frontend guides see [BACKEND.md](./BACKEND.md) and [FRONTEND.md](./FRONTEND.md).*
