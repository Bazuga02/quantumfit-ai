import type { AuthUser } from "./auth.js";

declare module "express-session" {
  interface SessionData {
    user?: AuthUser;
  }
}

export {};
