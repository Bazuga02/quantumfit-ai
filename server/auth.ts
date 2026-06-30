import type { Express, RequestHandler } from "express";
import { storage } from "./storage.js";
import { insertUserSchema, loginUserSchema } from "../shared/schema.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { toAuthUser } from "./types/auth.js";
import { authRouteLimiter } from "./middleware/rate-limit.js";
import { ensureGuestUser } from "./ensure-guest-user.js";
import { getGuestConfigOrNull, isGuestEmail } from "./guest-config.js";
import type { User } from "../shared/schema.js";

const JWT_SECRET = process.env.JWT_SECRET || "quantumfit-jwt-secret-key";
const JWT_EXPIRES_IN = "7d";

function sendAuthResponse(
  user: User,
  res: Parameters<RequestHandler>[1],
  status = 200
) {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const authUser = toAuthUser(user);

  res.status(status).json({
    user: authUser,
    token,
    isGuest: isGuestEmail(user.email),
  });
}

export function setupAuth(app: Express): void {
  void ensureGuestUser();

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
      const config = getGuestConfigOrNull();
      if (!config) {
        return res.status(503).json({ message: "Guest login is not configured" });
      }

      const { email, password } = config;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(503).json({ message: "Guest account is not available" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(503).json({ message: "Guest account is not available" });
      }

      sendAuthResponse(user, res);
    } catch (error) {
      console.error("Guest login error:", error);
      res.status(500).json({ message: "Guest login failed" });
    }
  };

  app.post("/api/register", authRouteLimiter, register);
  app.post("/api/login", authRouteLimiter, login);
  app.post("/api/guest-login", authRouteLimiter, guestLogin);

  // JWT is stateless — logout is handled client-side by clearing the token.
  app.post("/api/logout", (_req, res) => {
    res.sendStatus(200);
  });
}
