import 'dotenv/config';
import express, { type Request, Response } from "express";
import { registerRoutes } from "../server/routes";
import { PostgresStorage } from "../server/storage";

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

// Register all routes
export default async function handler(req: Request, res: Response) {
  await registerRoutes(app);
  
  // Handle the request through the Express app
  app(req, res);
}
