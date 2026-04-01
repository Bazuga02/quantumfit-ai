import type { AuthUser } from "./auth.js";

declare global {
  namespace Express {
    interface Request {
      /** Authenticated user without password; set by `attachUser` or login/register session. */
      user?: AuthUser;
    }
  }
}

export {};
