import 'dotenv/config';
import express, { type Request, Response } from "express";
import { registerRoutes } from "../server/routes";

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Register routes once (cached for serverless)
let routesInitialized = false;
async function ensureRoutes() {
  if (!routesInitialized) {
    console.log('[api] Initializing routes (first request)...');
    await registerRoutes(app);
    routesInitialized = true;
    console.log('[api] Routes initialized');
  }
}

// Vercel serverless handler
export default async function handler(req: Request, res: Response) {
  console.log('[api] Request:', req.method, req.url, '| DATABASE_URL:', !!process.env.DATABASE_URL);
  try {
    await ensureRoutes();
    app(req, res);
  } catch (err) {
    console.error('[api] Handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error', debug: String(err) });
    }
  }
}
