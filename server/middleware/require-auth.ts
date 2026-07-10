import type { Request, Response, NextFunction } from "express";

/** Rejects unauthenticated requests before route handlers run. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.user?.id) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  next();
}
