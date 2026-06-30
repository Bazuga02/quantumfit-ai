import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage.js";
import type { JwtPayload } from "../types/auth.js";
import { toAuthUser } from "../types/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "quantumfit-jwt-secret-key";

/**
 * Sets `req.user` (no password) from Bearer JWT.
 * Loads the full user row from DB so `req.user` matches `AuthUser`.
 */
export async function attachUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      next();
      return;
    }

    const token = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
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
