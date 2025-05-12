import 'dotenv/config';
import { createServer } from "http";
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from "url";
// Define __filename and __dirname FIRST!
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Swagger UI Express setup ---
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger/openapi.yaml'));
// --------------------------------
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { PostgresStorage } from "./storage";
const app = express();
const storage = new PostgresStorage();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve Swagger UI at /api-doc
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Add CORS headers in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
}

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

async function main() {
  // Create HTTP server
  const httpServer = createServer(app);

  // Set up routes first
  const server = await registerRoutes(app);

  // Then set up Vite dev server in development
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, httpServer);
  } else {
    // Serve static files in production
    serveStatic(app);
  }

  // Start server
  const port = process.env.PORT || 3001;
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

main().catch(console.error);
