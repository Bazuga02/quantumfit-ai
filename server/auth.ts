import type { Express, RequestHandler } from "express";
import { randomUUID } from "crypto";
import { storage } from "./storage.js";
import { insertUserSchema, loginUserSchema } from "../shared/schema.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt, { type SignOptions } from "jsonwebtoken";
import { toAuthUser } from "./types/auth.js";
import { authRouteLimiter } from "./middleware/rate-limit.js";
import {
  getGuestDisplayName,
  GUEST_JWT_EXPIRES_IN,
  isGuestEmail,
  isGuestLoginEnabled,
} from "./guest-config.js";
import type { User } from "../shared/schema.js";
import { getJwtSecret } from "./jwt-secret.js";
import { clearAuthCookie, setAuthCookie } from "./auth-cookie.js";

const JWT_EXPIRES_IN = "7d";

function sendAuthResponse(
  user: User,
  res: Parameters<RequestHandler>[1],
  status = 200,
  options?: { jwtExpiresIn?: string }
) {
  const expiresIn = (options?.jwtExpiresIn ?? JWT_EXPIRES_IN) as SignOptions["expiresIn"];
  const token = jwt.sign(
    { id: user.id, email: user.email },
    getJwtSecret(),
    { expiresIn }
  );

  const authUser = toAuthUser(user);
  setAuthCookie(res, token);

  res.status(status).json({
    user: authUser,
    isGuest: isGuestEmail(user.email),
  });
}

export function setupAuth(app: Express): void {
  const register: RequestHandler = async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      sendAuthResponse(user, res, 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  };

  const login: RequestHandler = async (req, res) => {
    try {
      const { email, password } = loginUserSchema.parse(req.body);

      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      sendAuthResponse(user, res);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Login error:", error);
      const body: { message: string; debug?: string } = { message: "Login failed" };
      if (process.env.NODE_ENV === "development") body.debug = String(error);
      res.status(500).json(body);
    }
  };

  const guestLogin: RequestHandler = async (req, res) => {
    try {
      if (!isGuestLoginEnabled()) {
        return res.status(503).json({ message: "Guest login is not configured" });
      }

      const guestEmail = `guest-${randomUUID()}@guest.quantumfit.local`;
      const guestPassword = randomUUID();
      const hashedPassword = await bcrypt.hash(guestPassword, 10);

      const user = await storage.createUser({
        name: getGuestDisplayName(),
        email: guestEmail,
        password: hashedPassword,
      });

      sendAuthResponse(user, res, 200, { jwtExpiresIn: GUEST_JWT_EXPIRES_IN });
    } catch (error) {
      console.error("Guest login error:", error);
      res.status(500).json({ message: "Guest login failed" });
    }
  };

  const logout: RequestHandler = async (req, res) => {
    const guestUserId =
      req.user && isGuestEmail(req.user.email) ? req.user.id : undefined;

    clearAuthCookie(res);

    if (guestUserId !== undefined) {
      try {
        await storage.deleteGuestUser(guestUserId);
      } catch (error) {
        console.error("Guest cleanup on logout failed:", error);
      }
    }

    res.status(200).json({ message: "Logged out" });
  };

  app.post("/api/register", authRouteLimiter, register);
  app.post("/api/login", authRouteLimiter, login);
  app.post("/api/guest-login", authRouteLimiter, guestLogin);
  app.post("/api/logout", logout);
}
