/** In-process limiter for outbound Groq (Llama) API calls — protects quota per server instance. */

type GroqLimiterConfig = {
  maxRequests: number;
  windowMs: number;
  maxConcurrent: number;
};

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getGroqLimiterConfig(): GroqLimiterConfig {
  return {
    maxRequests: parsePositiveInt(process.env.GROQ_RATE_LIMIT_MAX, 10),
    windowMs: parsePositiveInt(process.env.GROQ_RATE_LIMIT_WINDOW_MS, 60_000),
    maxConcurrent: parsePositiveInt(process.env.GROQ_RATE_LIMIT_CONCURRENT, 2),
  };
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

class GroqRateLimiter {
  private requestTimestamps: number[] = [];
  private activeCalls = 0;
  private waitQueue: Array<() => void> = [];

  private pruneWindow(now: number, windowMs: number) {
    this.requestTimestamps = this.requestTimestamps.filter((t) => now - t < windowMs);
  }

  private releaseSlot() {
    this.activeCalls = Math.max(0, this.activeCalls - 1);
    const next = this.waitQueue.shift();
    next?.();
  }

  async acquire(): Promise<void> {
    const { maxRequests, windowMs, maxConcurrent } = getGroqLimiterConfig();

    while (this.activeCalls >= maxConcurrent) {
      await new Promise<void>((resolve) => this.waitQueue.push(resolve));
    }

    const now = Date.now();
    this.pruneWindow(now, windowMs);

    if (this.requestTimestamps.length >= maxRequests) {
      const oldest = this.requestTimestamps[0]!;
      const waitMs = windowMs - (now - oldest) + 50;
      await sleep(waitMs);
      return this.acquire();
    }

    this.activeCalls++;
    this.requestTimestamps.push(Date.now());
  }

  release() {
    this.releaseSlot();
  }
}

const limiter = new GroqRateLimiter();

export class GroqRateLimitError extends Error {
  constructor(message = "AI service is busy. Please try again shortly.") {
    super(message);
    this.name = "GroqRateLimitError";
  }
}

export async function withGroqRateLimit<T>(fn: () => Promise<T>): Promise<T> {
  await limiter.acquire();
  try {
    return await fn();
  } finally {
    limiter.release();
  }
}

function isGroqRateLimitError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const status = (error as { status?: number }).status;
  return status === 429;
}

export async function callGroqWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let attempt = 0;

  while (true) {
    try {
      return await withGroqRateLimit(fn);
    } catch (error) {
      if (!isGroqRateLimitError(error) || attempt >= maxRetries) {
        if (isGroqRateLimitError(error)) {
          throw new GroqRateLimitError();
        }
        throw error;
      }

      const backoffMs = Math.min(1000 * 2 ** attempt, 8000);
      await sleep(backoffMs);
      attempt++;
    }
  }
}
