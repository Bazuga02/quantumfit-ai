import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage.js";
import type { JwtPayload } from "../types/auth.js";
import { toAuthUser } from "../types/auth.js";
import { getJwtSecret } from "../jwt-secret.js";
import { readAuthCookie } from "../auth-cookie.js";

/**
 * Sets `req.user` from httpOnly auth cookie or Bearer JWT.
 * Loads the full user row from DB so `req.user` matches `AuthUser`.
 */
export async function attachUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cookieToken = readAuthCookie(req.headers.cookie);
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;
    const token = cookieToken ?? bearerToken;

    if (!token) {
      next();
      return;
    }

    try {
      const payload = jwt.verify(token, getJwtSecret()) as JwtPayload;
      const user = await storage.getUser(payload.id);
      if (user) req.user = toAuthUser(user);
    } catch {
      /* invalid or expired token — leave req.user unset */
    }

    next();
  } catch (err) {
    next(err);
  }
}
