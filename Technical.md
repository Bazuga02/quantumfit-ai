### **Overview**

**QuantumFit** is a TypeScript monorepo with:

- **Backend**: Express + Drizzle ORM + Neon Postgres (server-side REST API).
- **Frontend**: React SPA built with Vite (client).
- **Shared**: Drizzle schema and types shared between server and scripts.
- **Infra/Deploy**: Vercel serverless entry (`api/index.ts`), local dev server (`server/index.ts`), Drizzle migrations, Vercel config.

Below is technical documentation focused on **how things work** end-to-end.

---

### **1. Project structure**

- **Root**
  - `package.json`: Monorepo scripts and shared dependencies.
  - `.env.local`: Backend env vars (at least `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`, Cloudinary/AI keys).
  - `tsconfig.json` / `tsconfig.server.json`: TypeScript config for shared + server build.
  - `drizzle.config.ts`: Drizzle config (schema path, migrations folder, `DATABASE_URL`).
  - `vercel.json`: Vercel build and routing config.
  - `PROJECT_SUMMARY.md`, `README.md`: Human docs.
  - `migrations/`, `drizzle/`: SQL and Drizzle migrations.

- **`client/`** – Vite + React SPA
  - `src/main.tsx`: React entry, mounts `App`.
  - `src/App.tsx`: Top-level routing, providers (React Query, theme, auth).
  - `src/pages/*.tsx`: Route-level screens (dashboard, workouts, nutrition, progress, AI coach, auth, settings, water).
  - `src/components/**`: UI components and feature modules (workout, nutrition, progress, water intake, layout).
  - `src/lib/api.ts`: Generic `fetch` wrapper to backend (`VITE_API_URL`) with `credentials: 'include'`.
  - `src/lib/queryClient.ts`: React Query setup.
  - `src/lib/theme-provider.tsx`: Dark/light theme management.
  - `src/lib/protected-route.tsx`, `src/hooks/use-auth.tsx`: Client-side auth helpers.

- **`server/`** – Express backend
  - `index.ts`: Main local dev / production server entry (Node HTTP server).
  - `api/index.ts`: Serverless-compatible Express handler (used by Vercel rewrite `/api/(.*)`).
  - `routes.ts`: Registers all API routes (auth, workouts, nutrition, progress, water, AI, etc.).
  - `db.ts`: Neon + Drizzle database connection.
  - `storage.ts`: `PostgresStorage` implementing all DB operations (CRUD for each feature area).
  - `db-storage.ts`: Alternative storage implementation (not normally used; legacy/alt).
  - `auth.ts`: Sets up authentication routes and session/JWT handling.
  - `openai.ts`: Integration with OpenAI / Gemini-like models for AI coach endpoints.
  - `vite.ts`: Helpers for dev mode (Vite dev server integration) and static file serving.

- **`shared/`**
  - `schema.ts`: Drizzle ORM table definitions, inferred types, and Zod schemas for validation.

- **`swagger/`**
  - `openapi.yaml`: API docs definition, served at `/api-doc` via Swagger UI.

- **`uploads/`**
  - Runtime directory for uploaded assets (e.g., progress photos).

- **`scripts/`**
  - `push-db.ts`: Applies Drizzle schema to the DB.
  - `clear-and-seed-foods.ts`, `update-password.ts`, etc.: One-off maintenance / seed scripts.

---

### **2. Backend: request lifecycle**

#### **2.1 Local dev server (`server/index.ts`)**

1. **Environment loading**  
   - `import 'dotenv/config'` loads `.env.local` / `.env` so `process.env` has `DATABASE_URL`, secrets, etc.

2. **Express app setup**
   - Creates `const app = express();`.
   - Adds **body parsers**: `express.json()`, `express.urlencoded()`.
   - Adds **CORS**:
     - In `development`: allows localhost ports `3001`, `5173`, `4173`.
     - In production: allows deployed frontends (`https://quantumfit-ai.vercel.app`, `https://quantumfit-ai.pages.dev`).
     - Sets `Access-Control-Allow-Credentials: true` to support cookie-based sessions.

3. **Swagger**
   - Loads `swagger/openapi.yaml`.
   - Mounts Swagger UI at `/api-doc`.

4. **Request logging**
   - Middleware tracks duration and JSON response body for `/api/*` paths.
   - Logs compact lines like: `POST /api/measurements 200 in 35ms :: { ... }`.

5. **Static files**
   - Serves `uploads` directory at `/uploads` (for progress photos, etc.).

6. **Route registration**
   - Calls `registerRoutes(app)` from `server/routes.ts`.
   - This sets up:
     - Auth endpoints (`/api/auth/...`).
     - Resources: measurements, workouts, nutrition, water, progress photos, trained body parts.
     - AI endpoints (coach, nutrition suggestions, analysis).
   - Uses a `PostgresStorage` instance which wraps Drizzle for DB operations.

7. **Dev vs prod frontend integration**
   - In **development**:
     - Uses `setupVite(app, httpServer)` to attach the Vite dev server.
     - Frontend served by Vite on `localhost:5173`, backend on `localhost:3001` with CORS.
   - In **production**:
     - `serveStatic(app)` serves pre-built `client/dist` as static assets.

8. **Server start**
   - `httpServer.listen(port)`; default port is `3001`.

#### **2.2 Vercel serverless (`api/index.ts` + `vercel.json`)**

- **`vercel.json`**:

  - Build command: `"npm run build"` → builds client and server.
  - Install command: `"npm install"`.
  - Output directory: `"client/dist"`.
  - **Rewrites**:
    - `/api/(.*)` → `/api/index` (hits `api/index.ts` handler).
    - `/(.*)` → `/index.html` (SPA routes handled by built client).

- **`api/index.ts` – Serverless handler**

  1. Logs detailed diagnostics at module load (env presence, etc.).
  2. Creates an Express app with:
     - `express.json()` and `express.urlencoded()`.
     - Custom CORS logic allowing:
       - `https://quantumfit-ai.vercel.app`
       - `https://quantumfit-ai.pages.dev`
       - Localhost dev origins.
       - Any `.vercel.app` subdomain.
  3. Defines `ensureRoutes()`:
     - Calls `registerRoutes(app)` once and caches `routesInitialized` flag.
  4. **Default export `handler(req, res)`**:
     - Logs request method, URL, headers, and env presence.
     - Ensures routes are registered.
     - Delegates the request to `app(req, res)`.
     - Handles and logs any errors and sends a 500 JSON response if headers not yet sent.

---

### **3. Database layer**

#### **3.1 Connection (`server/db.ts`)**

- Uses **Neon serverless client**:

  - `import { neon } from '@neondatabase/serverless';`
  - `import { drizzle } from 'drizzle-orm/neon-http';`

- Logic (conceptually):

  - Reads `DATABASE_URL` from `process.env.DATABASE_URL`.
  - Constructs a `sql` client: `const sql = neon(DATABASE_URL);`.
  - Instantiates the Drizzle ORM client:

    ```ts
    import * as schema from '../shared/schema.js';
    export const db = drizzle(sql, { schema, logger: true });
    ```

- This `db` object is used across the backend for all persistence.

#### **3.2 Schema (`shared/schema.ts`)**

- Defines **Postgres tables** via `pgTable` from `drizzle-orm/pg-core`, for example:

  - `users`
  - `measurements`
  - `exercises`
  - `workout_plans`
  - `workout_plan_exercises`
  - `foods`
  - `meal_plans`
  - `meals`
  - `meal_foods`
  - `water_intakes`
  - `progress_photos`
  - `trained_body_parts`

- Also defines:

  - **Relations/foreign keys** where needed (e.g., exercises in a workout plan).
  - **Zod insert schemas** `insertUserSchema`, etc., for validation.
  - **TypeScript types** (`User`, `WorkoutPlan`, etc.) inferred from schema.

- Drizzle uses these definitions both for:
  - Type-safe queries in code.
  - Generating migrations (`drizzle/0000_red_piledriver.sql` etc.).

#### **3.3 Storage layer (`server/storage.ts`)**

- Exports `PostgresStorage` which implements an `IStorage` interface.

- Responsibilities:

  - **User management**:
    - Create user, find by email/id, update profile, password update, etc.

  - **Measurements**:
    - CRUD for weight, body fat, measurements over time.

  - **Workout plans** and **exercises**:
    - Plans: create/update/delete, list by user.
    - Exercises: add/remove from plans, log workouts, track body parts trained.

  - **Nutrition**:
    - Foods: search/list, macros.
    - Meals: create/update meals and `meal_foods` join records.
    - Meal plans: group of meals, scheduled days, etc.

  - **Water intake**:
    - Record per-day/per-user water entries.

  - **Progress photos**:
    - Store metadata and relation to users; files themselves go to `uploads`.

  - **Trained body parts**:
    - Track which muscle groups are being trained over time.

- Internally:

  - Uses the shared `db` from `server/db.ts` and `schema` tables.
  - Provides a high-level API to `routes.ts` so route handlers don’t write SQL directly.

---

### **4. Auth & sessions**

#### **4.1 Auth server logic (`server/auth.ts`)**

- Sets up:

  - **Registration**: create user, hash password with `bcrypt`.
  - **Login**: verify credentials, create session/JWT.
  - **Session management**: leveraging `express-session` with a store (in-memory or PG-backed).
  - **Protected routes middleware**: attaches `req.user` based on session/JWT, used by other routes.

- Sessions:

  - Likely uses `connect-pg-simple` or similar with the Postgres DB (or a memory store) as session store.
  - Cookie-based, with `credentials: 'include'` on the frontend `fetch` calls.

#### **4.2 Frontend auth hooks**

- **`client/src/lib/api.ts`**:
  - Calls backend endpoints with `credentials: 'include'` to send cookies.
  - Centralizes base URL from `VITE_API_URL`.

- **`client/src/hooks/use-auth.tsx`**, **`client/src/lib/protected-route.tsx`**:
  - Keeps track of `currentUser` from an `/api/auth/me` endpoint.
  - Guard routes that require authentication; redirect to auth page if unauthenticated.

---

### **5. Frontend: routing and features**

#### **5.1 App shell (`client/src/App.tsx`)**

- Provides:

  - `QueryClientProvider` for React Query.
  - Theme provider (`ThemeProvider`) for dark/light mode.
  - Auth context provider.
  - Router (`wouter`) to page components:
    - `/` → Dashboard.
    - `/auth` → Auth page (login/register).
    - `/workouts` → Workouts page.
    - `/nutrition` → Nutrition page.
    - `/progress` → Progress page.
    - `/water` → Water page.
    - `/ai-coach` → AI coach.
    - `/settings` → Settings page.

- Uses shared UI components from `components/ui` (Radix UI wrappers, buttons, inputs, modals, charts, etc.).

#### **5.2 Feature modules**

- **Workouts** (`components/workouts/*`, `pages/workouts-page.tsx`):
  - Exercise library, workout detail, etc.
  - Calls REST endpoints like `/api/workout-plans`, `/api/exercises`.

- **Nutrition** (`components/nutrition/*`, `pages/nutrition-page.tsx`):
  - Food search, meal builder, meal plan view.
  - Uses `/api/foods`, `/api/meals`, `/api/meal-plans`.

- **Progress** (`components/progress/*`, `pages/progress.tsx`):
  - Graphs for measurements, trained body parts, photos gallery.
  - Uses `/api/measurements`, `/api/progress-photos`, `/api/trained-body-parts`.

- **Water intake** (`components/water-intake.tsx`, `pages/water.tsx`):
  - UI to log daily water intake and view history.
  - Calls `/api/water-intakes` endpoints.

- **AI coach** (`pages/ai-coach-page.tsx`):
  - Chat-like interface to call `/api/ai/...` endpoints, which are powered by `server/openai.ts` and your AI provider keys.

---

### **6. Migrations and data management**

- **Drizzle config (`drizzle.config.ts`)**:

  - Points to `./shared/schema.ts`.
  - Output: `./drizzle` for generated SQL.
  - Uses `DATABASE_URL` for target DB.

- **SQL migrations**:

  - `drizzle/0000_red_piledriver.sql`: Initial schema (Drizzle-generated).
  - `migrations/000x_*.sql`: Hand-written migrations (e.g., adding fitness fields, simplifying workout plans, adding water intake).

- **Scripts** (run via `npm run`):

  - `db:push`: `drizzle-kit push` – pushes current Drizzle schema to DB.
  - `db:seed`: `tsx scripts/push-db.ts` – seeds data.
  - `cleanup:exercises`, `db:update-password`, etc.: Utility maintenance tasks.

---

### **7. Environment configuration**

- **Root `.env.local`** (backend/server):

  - `DATABASE_URL` – Neon Postgres connection (used by `server/db.ts` + Drizzle).
  - `JWT_SECRET`, `SESSION_SECRET` – auth/session security.
  - Cloudinary keys – used in upload/asset endpoints.
  - OpenAI/Google GenAI keys – used in `server/openai.ts`.

- **`client/.env.local`** (frontend):

  - `VITE_API_URL` – base URL for API (e.g., `http://localhost:3001` or your Vercel function URL).
  - `VITE_CLOUDINARY_CLOUD_NAME`, etc. – frontend-only config for client-side uploads or image URLs.

---

### **8. Deployment model**

- **Local dev**:

  - Run backend: `npm run dev` → Express on `localhost:3001`.
  - Run frontend: `cd client && npm run dev` → Vite on `localhost:5173`.
  - CORS + `VITE_API_URL` are configured so the client talks to the server.

- **Production (Vercel)**:

  - `npm run build`:
    - Builds client (`cd client && npm run build` → `client/dist`).
    - Builds server (via TypeScript build / bundler for `api/index.ts`).
  - Vercel serves:
    - `/api/**` via `api/index.ts` serverless handler.
    - All other paths (`/(.*)`) via SPA `index.html` from `client/dist`.
  - Env vars are configured in Vercel dashboard, matching `.env.local` keys (but without committing secrets).

---

### **9. How Neon MCP fits in**

- Locally, you’ve added the **Neon MCP server** so the AI assistant can:

  - List projects (`list_projects`).
  - Inspect tables (`get_database_tables`).
  - Run SQL (`run_sql`) and help with migrations (`prepare_database_migration`, etc.).

- This doesn’t change the runtime architecture, but gives you a **conversational control plane** for the Neon DB layered on top of the Drizzle-based backend.

---

If you’d like, I can turn this into a **`TECHNICAL_OVERVIEW.md`** file in the repo (or expand any specific area, like “exact auth flow” or “detailed DB schema description per table”).