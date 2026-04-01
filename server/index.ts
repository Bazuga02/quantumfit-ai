import "./load-env.js";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import express from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger/openapi.yaml"));

import { registerRoutes } from "./routes/index.js";
import { setupVite, serveStatic, log } from "./vite.js";
import { corsMiddleware } from "./middleware/cors-config.js";

const app = express();
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(corsMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined;

  const originalResJson = res.json.bind(res) as typeof res.json;
  res.json = function (bodyJson?: unknown) {
    if (bodyJson !== undefined && typeof bodyJson === "object" && bodyJson !== null) {
      capturedJsonResponse = bodyJson as Record<string, unknown>;
    }
    return originalResJson(bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
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

async function main() {
  const httpServer = createServer(app);

  await registerRoutes(app);

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, httpServer);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 3001;
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

main().catch(console.error);
