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

// Register routes
export default async function handler(req: Request, res: Response) {
  // Set up routes
  await registerRoutes(app);
  
  // Handle the request
  app(req, res, () => {
    res.status(404).send('Not Found');
  });
}
