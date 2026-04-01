import rateLimit from "express-rate-limit";

/** Login / register — burst-safe burndown. */
export const authRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts; try again later." },
});

/** Groq-backed generation endpoints (cost/latency). */
export const aiGenerateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many AI requests; try again in a minute." },
});
