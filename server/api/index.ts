import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";

// Define __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { registerRoutes } from "../routes.js";
import { PostgresStorage } from "../storage.js";

const app = express();
const storage = new PostgresStorage();

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
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
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

// Register routes
export default async function handler(req: Request, res: Response) {
  // Set up routes
  await registerRoutes(app);
  
  // Handle the request
  app(req, res, () => {
    res.status(404).send('Not Found');
  });
}
