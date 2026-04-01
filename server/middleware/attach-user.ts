import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage.js";
import type { JwtPayload } from "../types/auth.js";
import { toAuthUser } from "../types/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "quantumfit-jwt-secret-key";

/**
 * Sets `req.user` (no password) from session or Bearer JWT.
 * JWT path loads the full row from DB so `req.user` matches `AuthUser`.
 */
export async function attachUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (req.session?.user?.id != null) {
      req.user = req.session.user;
      next();
      return;
    }

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
      /* invalid token — leave req.user unset */
    }

    next();
  } catch (err) {
    next(err);
  }
}
