import type { Request, Response, NextFunction } from "express";

const PRODUCTION_ORIGINS = [
  "https://quantumfit-ai.vercel.app",
  "https://quantumfit-ai.pages.dev",
] as const;

const DEV_ORIGINS = [
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:4173",
] as const;

export const ALL_KNOWN_ORIGINS = [...PRODUCTION_ORIGINS, ...DEV_ORIGINS] as const;

export function isAllowedCorsOrigin(origin: string): boolean {
  return (
    (ALL_KNOWN_ORIGINS as readonly string[]).includes(origin) ||
    origin.endsWith(".vercel.app")
  );
}

/**
 * CORS for browser clients (JWT via Authorization header). Same rules for local Express and Vercel `api/index.ts`.
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  if (typeof origin === "string" && isAllowedCorsOrigin(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }

  next();
}
