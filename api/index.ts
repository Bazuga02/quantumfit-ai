import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

import express, { type Request, Response } from "express";
import { registerRoutes } from "../server/routes/index.js";
import { corsMiddleware } from "../server/middleware/cors-config.js";

const apiDebug = process.env.API_DEBUG === "1";

let app: express.Express;
let routesInitialized = false;

try {
  app = express();
  app.set("trust proxy", 1);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(corsMiddleware);
} catch (initError) {
  console.error("[api] Module initialization failed:", initError);
  throw initError;
}

async function ensureRoutes() {
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }
}

export default async function handler(req: Request, res: Response) {
  const timestamp = new Date().toISOString();

  if (apiDebug) {
    console.log(`[api] ${req.method} ${req.url}`);
  }

  try {
    await ensureRoutes();
    app(req, res);
  } catch (err) {
    console.error("[api] Handler error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error",
        ...(apiDebug && { debug: String(err), timestamp, url: req.url }),
      });
    }
  }
}
