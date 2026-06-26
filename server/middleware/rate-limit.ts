import rateLimit from "express-rate-limit";
import type { Request } from "express";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** Prefer authenticated user id; fall back to IP for anonymous traffic. */
function aiRateLimitKey(req: Request): string {
  if (req.user?.id != null) return `user:${req.user.id}`;
  return req.ip ?? "unknown";
}

/** Login / register — burst-safe burndown. */
export const authRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts; try again later." },
});

/** Groq-backed generation endpoints — per user/IP, env-configurable. */
export const aiGenerateLimiter = rateLimit({
  windowMs: parsePositiveInt(process.env.AI_ROUTE_RATE_LIMIT_WINDOW_MS, 60_000),
  max: parsePositiveInt(process.env.AI_ROUTE_RATE_LIMIT_MAX, 10),
  keyGenerator: aiRateLimitKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI requests; try again in a minute." },
});
