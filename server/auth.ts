import { Express } from "express";
import session from "express-session";
import { storage } from "./storage.js";
import { insertUserSchema, loginUserSchema, User as SelectUser } from "../shared/schema.js";
import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

declare module 'express-session' {
  interface Session {
    user?: any;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "quantumfit-jwt-secret-key";
const JWT_EXPIRES_IN = "7d";

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "quantumfit-super-secret-key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax',
      httpOnly: true,
      path: '/', // Ensure cookie is available across all paths
    }
  };

  app.use(session(sessionSettings));

  // Middleware to verify JWT token
  const verifyToken = (req: any, res: any, next: any) => {
    try {
      // First check session
      if (req.session?.user) {
        req.user = req.session.user;
        return next();
      }

      // If no session, check JWT token
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      // Set user in session for future requests
      req.session.user = decoded;
      req.user = decoded;
      next();
    } catch (error) {
      console.error('[auth] verifyToken error:', error);
      return res.status(401).json({ message: "Invalid token", debug: String(error) });
    }
  };

  // Register endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create new user with hashed password
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Set user in session
      req.session.user = user;

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [auth] ===== LOGIN ATTEMPT =====`);
    console.log(`[${timestamp}] [auth] Request body keys:`, req.body ? Object.keys(req.body) : 'none');
    console.log(`[${timestamp}] [auth] Content-Type:`, req.headers['content-type']);
    
    try {
      const { email, password } = loginUserSchema.parse(req.body);
      console.log(`[${timestamp}] [auth] Parsed credentials for email:`, email);
      
      // Find user by email
      console.log(`[${timestamp}] [auth] Looking up user in database...`);
      const user = await storage.getUserByEmail(email);
      console.log(`[${timestamp}] [auth] User lookup result:`, user ? 'found' : 'not found');
      
      if (!user) {
        console.log(`[${timestamp}] [auth] Login failed: User not found for email:`, email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed passwords
      console.log(`[${timestamp}] [auth] Comparing passwords...`);
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(`[${timestamp}] [auth] Password match result:`, passwordMatch);
      
      if (!passwordMatch) {
        console.log(`[${timestamp}] [auth] Login failed: Invalid password for email:`, email);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      console.log(`[${timestamp}] [auth] Generating JWT token...`);
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
      console.log(`[${timestamp}] [auth] JWT token generated successfully`);

      // Set user in session
      console.log(`[${timestamp}] [auth] Setting user in session...`);
      req.session.user = user;
      console.log(`[${timestamp}] [auth] User session set successfully`);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      console.log(`[${timestamp}] [auth] Login successful for email:`, email);
      
      res.json({
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error(`[${timestamp}] [auth] ===== LOGIN ERROR =====`);
      if (error instanceof z.ZodError) {
        console.error(`[${timestamp}] [auth] Validation error:`, error.errors);
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error(`[${timestamp}] [auth] Login error:`, error);
      console.error(`[${timestamp}] [auth] Error stack:`, error instanceof Error ? error.stack : 'No stack');
      res.status(500).json({ message: "Login failed", debug: String(error) });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.sendStatus(200);
    });
  });

  // Get current user endpoint (supports both session and JWT)
  app.get("/api/user", verifyToken, (req, res) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [auth] ===== GET USER REQUEST =====`);
    console.log(`[${timestamp}] [auth] Session exists:`, !!req.session);
    console.log(`[${timestamp}] [auth] Session user:`, !!req.session?.user);
    console.log(`[${timestamp}] [auth] Request user:`, !!req.user);
    console.log(`[${timestamp}] [auth] Authorization header:`, req.headers.authorization ? 'present' : 'missing');
    
    if (!req.session?.user && !req.user) {
      console.log(`[${timestamp}] [auth] Get user failed: No authentication found`);
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = req.session?.user || req.user;
    console.log(`[${timestamp}] [auth] Get user successful for user ID:`, user.id);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
}
