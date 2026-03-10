// TOP LEVEL LOG - This should always appear
console.log('=== API MODULE LOADING START ===');

import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

import express, { type Request, Response } from "express";
import { registerRoutes } from "../server/routes.js";

const timestamp = new Date().toISOString();
console.log(`[${timestamp}] [api] ===== MODULE INITIALIZATION =====`);
console.log(`[${timestamp}] [api] Starting API module import...`);
console.log(`[${timestamp}] [api] Environment check:`, {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: !!process.env.DATABASE_URL,
  JWT_SECRET: !!process.env.JWT_SECRET,
  SESSION_SECRET: !!process.env.SESSION_SECRET
});

// Declare variables outside try block
let app: express.Express;
let routesInitialized = false;

try {
  console.log(`[${timestamp}] [api] Creating Express app...`);
  app = express();

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // CORS: with credentials, browser requires a specific origin (not '*')
  const ALLOWED_ORIGINS = [
    'https://quantumfit-ai.vercel.app',
    'https://quantumfit-ai.pages.dev',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:4173',
  ];
  const isAllowedOrigin = (origin: string) =>
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith('.vercel.app'); // allow all Vercel preview/production URLs
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (typeof origin === 'string' && isAllowedOrigin(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  console.log(`[${timestamp}] [api] Module initialization completed successfully`);

} catch (initError) {
  console.error(`[${timestamp}] [api] ===== INITIALIZATION ERROR =====`);
  console.error(`[${timestamp}] [api] Module initialization failed:`, initError);
  console.error(`[${timestamp}] [api] Error stack:`, initError instanceof Error ? initError.stack : 'No stack');
  throw initError;
}

// Register routes once (cached for serverless)
async function ensureRoutes() {
  if (!routesInitialized) {
    const currentTimestamp = new Date().toISOString();
    console.log(`[${currentTimestamp}] [api] Registering application routes...`);
    console.log(`[${currentTimestamp}] [api] registerRoutes function:`, typeof registerRoutes);
    console.log(`[${currentTimestamp}] [api] app object:`, typeof app);
    
    const result = await registerRoutes(app);
    console.log(`[${currentTimestamp}] [api] registerRoutes result:`, result);
    
    routesInitialized = true;
    console.log(`[${currentTimestamp}] [api] Routes initialized`);
  } else {
    console.log(`[${timestamp}] [api] Routes already initialized, skipping...`);
  }
}

console.log('=== API MODULE LOADING COMPLETE ===');

// Vercel serverless handler
export default async function handler(req: Request, res: Response) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [api] ===== NEW REQUEST =====`);
  console.log(`[${timestamp}] [api] Method: ${req.method}`);
  console.log(`[${timestamp}] [api] URL: ${req.url}`);
  console.log(`[${timestamp}] [api] Headers:`, JSON.stringify(req.headers, null, 2));
  console.log(`[${timestamp}] [api] DATABASE_URL present:`, !!process.env.DATABASE_URL);
  console.log(`[${timestamp}] [api] JWT_SECRET present:`, !!process.env.JWT_SECRET);
  console.log(`[${timestamp}] [api] SESSION_SECRET present:`, !!process.env.SESSION_SECRET);
  console.log(`[${timestamp}] [api] NODE_ENV:`, process.env.NODE_ENV);
  
  try {
    await ensureRoutes();
    console.log(`[${timestamp}] [api] Routes ensured, forwarding to app handler`);
    console.log(`[${timestamp}] [api] About to call app(${req.method}, ${req.url})`);
    
    app(req, res);
    
    console.log(`[${timestamp}] [api] app handler completed`);
  } catch (err) {
    console.error(`[${timestamp}] [api] ===== HANDLER ERROR =====`);
    console.error(`[${timestamp}] [api] Error:`, err);
    console.error(`[${timestamp}] [api] Error stack:`, err instanceof Error ? err.stack : 'No stack trace');
    console.error(`[${timestamp}] [api] Error type:`, typeof err);
    
    if (!res.headersSent) {
      console.log(`[${timestamp}] [api] Sending 500 response to client`);
      res.status(500).json({ 
        message: 'Internal server error', 
        debug: String(err),
        timestamp,
        url: req.url
      });
    } else {
      console.log(`[${timestamp}] [api] Headers already sent, cannot send error response`);
    }
  }
}
