import { getGuestSessionMaxAgeMs } from "./guest-config.js";
import { storage } from "./storage.js";

export async function runGuestCleanup(): Promise<number> {
  const cutoff = new Date(Date.now() - getGuestSessionMaxAgeMs());
  const deleted = await storage.deleteStaleGuestUsers(cutoff);
  if (deleted > 0) {
    console.log(`[guest-cleanup] Removed ${deleted} stale guest account(s)`);
  }
  return deleted;
}

const CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000;

let cleanupInterval: ReturnType<typeof setInterval> | undefined;

/** Run once at startup and on a fixed interval (long-running Node only). */
export function scheduleGuestCleanup(): void {
  void runGuestCleanup().catch((error) => {
    console.error("[guest-cleanup] Startup cleanup failed:", error);
  });

  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    void runGuestCleanup().catch((error) => {
      console.error("[guest-cleanup] Scheduled cleanup failed:", error);
    });
  }, CLEANUP_INTERVAL_MS);

  cleanupInterval.unref?.();
}
