import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage.js";
import { insertUserSchema, loginUserSchema } from "../shared/schema.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { toAuthUser } from "./types/auth.js";
import { authRouteLimiter } from "./middleware/rate-limit.js";

const JWT_SECRET = process.env.JWT_SECRET || "quantumfit-jwt-secret-key";
const JWT_EXPIRES_IN = "7d";

export function setupAuth(app: Express): void {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "quantumfit-super-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    },
  };

  app.use(session(sessionSettings));

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

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const authUser = toAuthUser(user);
      req.session.user = authUser;

      res.status(201).json({
        user: authUser,
        token,
      });
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

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const authUser = toAuthUser(user);
      req.session.user = authUser;

      res.json({
        user: authUser,
        token,
      });
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

  app.post("/api/register", authRouteLimiter, register);
  app.post("/api/login", authRouteLimiter, login);

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.sendStatus(200);
    });
  });
}
