# QuantumFit AI

QuantumFit AI is a full-stack, AI-powered fitness web application. Users can track workouts, nutrition, hydration, and body progress, and get personalized coaching from an LLM-backed AI coach.

## Features

- **AI Coach** — Personalized workout plans, nutrition plans, and progress analysis (Groq / Llama 3.1)
- **Workouts** — Exercise library, custom workout plans, and session tracking
- **Nutrition** — Food search, meal logging, macro charts, and daily summaries
- **Water intake** — Daily hydration logging and progress
- **Progress** — Body measurements, progress photos (Cloudinary), and trained body-part history
- **Dashboard** — Unified view of calories, workouts, water, and saved AI recommendations
- **Auth** — Email/password with bcrypt; optional per-session guest demo login
- **UI** — Responsive React SPA with dark/light theme, Framer Motion, and Recharts

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Radix UI, TanStack Query, Wouter |
| **Backend** | Node.js, Express, REST API, Swagger at `/api-doc` (local dev) |
| **Database** | Neon Serverless Postgres, Drizzle ORM |
| **AI** | Groq SDK (`llama-3.1-8b-instant`), Zod-validated JSON responses |
| **Deploy** | Vercel (static SPA + serverless API) |

## Project structure

```
quantumfit-ai/
├── client/          # React SPA (own package.json)
├── server/          # Express API, auth, storage, AI
├── api/             # Vercel serverless entry
├── shared/          # Drizzle schema + Zod types
├── drizzle/         # Generated SQL migrations
├── scripts/         # DB seed & maintenance scripts
└── swagger/         # OpenAPI spec
```

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/Bazuga02/quantumfit-ai.git
cd quantumfit-ai
npm install
cd client && npm install && cd ..
```

### 2. Environment variables

Copy `.env.example` to `.env` or `.env.local` at the **repo root** and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `JWT_SECRET` | Yes (prod) | Long random string for signing auth cookies |
| `GROQ_API_KEY` | Yes | Groq API key for AI Coach |
| `GUEST_NAME` | No | Enables guest demo login (e.g. `Guest`) |
| `CLOUDINARY_*` | For photos | Cloud name, API key, and secret for signed uploads |

See [`.env.example`](./.env.example) for optional rate-limit knobs.

### 3. Database

```bash
npm run db:push    # sync schema to Neon
npm run db:seed    # optional: seed data
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). In development, Express serves the Vite app on the same origin (cookies work without extra CORS setup).

### 5. Deploy (Vercel)

Set the same environment variables in **Project Settings → Environment Variables**. The build runs `npm run build` (client only); `/api/*` is handled by `api/index.ts`.

## Documentation

| Doc | Contents |
|-----|----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data model, deployment |
| [AUTHENTICATION.md](./AUTHENTICATION.md) | Cookie auth, guest login, security |
| [BACKEND.md](./BACKEND.md) | API routes, storage layer, AI pipeline |
| [FRONTEND.md](./FRONTEND.md) | React app, routing, data fetching |
| [Technical.md](./Technical.md) | Request lifecycle and file map |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Express + Vite on port 3001 |
| `npm run build` | Build client to `client/dist` |
| `npm run check` | TypeScript check (root) |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run db:seed` | Run seed script |
| `npm run db:update-password` | `tsx scripts/update-password.ts <email> <password>` |

## Contributing

Pull requests are welcome. For major changes, open an issue first.

---

**QuantumFit AI** — Your smart fitness companion.
