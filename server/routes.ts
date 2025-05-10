import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertMeasurementSchema,
  insertWorkoutPlanSchema,
  insertWorkoutPlanExerciseSchema,
  insertMealPlanSchema,
  insertMealSchema,
  insertMealFoodSchema,
  User
} from "@shared/schema";
import {
  getWorkoutRecommendation,
  getNutritionRecommendation,
  getProgressAnalysis
} from "./openai";
import { z } from "zod";
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { FileFilterCallback } from 'multer';
import fs from 'fs';
import express from 'express';
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'progress-photos');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Import JWT/session middleware
const JWT_SECRET = process.env.JWT_SECRET || "quantumfit-jwt-secret-key";

// Middleware to extract user from JWT or session for all /api routes
function attachUser(req: Request, res: Response, next: NextFunction) {
  // Try session first
  if ((req.session as any) && (req.session as any).user) {
    req.user = (req.session as any).user;
    return next();
  }
  // Try JWT
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded as any;
    } catch (err) {
      // Invalid token, do not set req.user
    }
  }
  next();
}

// Configure multer for file upload
const uploadStorage = multer.diskStorage({
  destination: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    cb(null, uploadsDir);
  },
  filename: function (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: uploadStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPG, JPEG, and PNG files are allowed!'));
    }
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from uploads directory with proper path
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Set up authentication routes
  setupAuth(app);

  // Attach user for all /api routes
  app.use('/api', attachUser);

  // Measurements routes
  app.get("/api/measurements", async (req, res) => {
    try {
      const measurements = await dbStorage.getMeasurements(req.user!.id);
      res.json(measurements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch measurements" });
    }
  });

  app.post("/api/measurements", async (req, res) => {
    try {
      const data = insertMeasurementSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const measurement = await dbStorage.addMeasurement(data);
      res.status(201).json(measurement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add measurement" });
    }
  });

  // Exercises routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const { query, muscleGroup } = req.query;
      let exercises = await dbStorage.getExercises();
      
      // If there's a search query, filter the exercises
      if (query) {
        exercises = exercises.filter(exercise => 
          exercise.name.toLowerCase().includes(query.toString().toLowerCase())
        );
      }

      // If there's a muscle group filter, apply it
      if (muscleGroup) {
        exercises = exercises.filter(exercise => {
          // Handle both string and array formats
          const muscleGroups = Array.isArray(exercise.muscleGroups) 
            ? exercise.muscleGroups 
            : JSON.parse(exercise.muscleGroups as string);
          return muscleGroups.includes(muscleGroup);
        });
      }

      // Format the response to ensure muscle groups and equipment are arrays
      const formattedExercises = exercises.map(exercise => ({
        ...exercise,
        muscleGroups: Array.isArray(exercise.muscleGroups) 
          ? exercise.muscleGroups 
          : JSON.parse(exercise.muscleGroups as string),
        equipment: exercise.equipment 
          ? (Array.isArray(exercise.equipment) 
              ? exercise.equipment 
              : JSON.parse(exercise.equipment as string))
          : []
      }));

      res.json(formattedExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      res.status(500).json({ error: 'Failed to fetch exercises' });
    }
  });

  // Foods routes
  app.get("/api/foods", async (req, res) => {
    try {
      const { category } = req.query;
      const foods = await dbStorage.getFoods(category as string | undefined);
      res.json(foods);
    } catch (error) {
      console.error('Error fetching foods:', error);
      res.status(500).json({ error: 'Failed to fetch foods' });
    }
  });

  app.get("/api/foods/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }
      const foods = await dbStorage.searchFoods(query);
      res.json(foods);
    } catch (error) {
      console.error('Error searching foods:', error);
      res.status(500).json({ error: 'Failed to search foods' });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const exercise = await dbStorage.getExerciseById(parseInt(req.params.id));
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Get user's workout plans
  app.get("/api/workout-plans", async (req, res) => {
    try {
      const isTemplate = req.query.isTemplate === 'true' ? true : req.query.isTemplate === 'false' ? false : undefined;
      const userId = isTemplate ? undefined : req.user!.id;
      const plans = await dbStorage.getWorkoutPlans({ userId, isTemplate });
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  // Create a new workout plan
  app.post("/api/workout-plans", async (req, res) => {
    try {
      const data = insertWorkoutPlanSchema.parse(req.body);
      const plan = await dbStorage.createWorkoutPlan(data);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });

  // Add exercise to workout plan
  app.post("/api/workout-plans/:id/exercises", async (req, res) => {
    try {
      const data = insertWorkoutPlanExerciseSchema.parse({
        ...req.body,
        workoutPlanId: parseInt(req.params.id)
      });
      
      const exercise = await dbStorage.addExerciseToWorkoutPlan(data);
      res.status(201).json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add exercise to workout plan" });
    }
  });

  // Food and nutrition routes
  app.get("/api/foods", async (req, res) => {
    try {
      let foods;
      
      if (req.query.search) {
        foods = await dbStorage.searchFoods(req.query.search as string);
      } else if (req.query.category) {
        foods = await dbStorage.getFoods(req.query.category as string);
      } else {
        foods = await dbStorage.getFoods();
      }
      
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch foods" });
    }
  });

  app.get("/api/foods/:id", async (req, res) => {
    try {
      const food = await dbStorage.getFoodById(parseInt(req.params.id));
      
      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }
      
      res.json(food);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food" });
    }
  });

  // Meal plans routes
  app.get("/api/meal-plans", async (req, res) => {
    try {
      const plans = await dbStorage.getMealPlans(req.user!.id);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.get("/api/meal-plans/:id", async (req, res) => {
    try {
      const plan = await dbStorage.getMealPlanById(parseInt(req.params.id));
      
      if (!plan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      
      if (plan.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to this meal plan" });
      }
      
      const meals = await dbStorage.getMealsForPlan(plan.id);
      const mealsWithFoods = await Promise.all(
        meals.map(async (meal) => {
          const foods = await dbStorage.getMealFoods(meal.id);
          return {
            ...meal,
            foods
          };
        })
      );
      
      res.json({
        ...plan,
        meals: mealsWithFoods
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plan" });
    }
  });

  app.post("/api/meal-plans", async (req, res) => {
    try {
      const data = insertMealPlanSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const plan = await dbStorage.createMealPlan(data);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meal plan" });
    }
  });

  app.post("/api/meal-plans/:id/meals", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await dbStorage.getMealPlanById(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      
      if (plan.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to this meal plan" });
      }
      
      const data = insertMealSchema.parse({
        ...req.body,
        mealPlanId: planId
      });
      
      const meal = await dbStorage.createMeal(data);
      res.status(201).json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add meal to meal plan" });
    }
  });

  app.post("/api/meals/:id/foods", async (req, res) => {
    try {
      const data = insertMealFoodSchema.parse({
        ...req.body,
        mealId: parseInt(req.params.id)
      });
      
      const mealFood = await dbStorage.addFoodToMeal(data);
      res.status(201).json(mealFood);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add food to meal" });
    }
  });
  
  // Direct meal logging route for standalone meals
  app.post("/api/meals", async (req, res) => {
    try {
      // Create a meal first
      const { name, time, date, foods } = req.body;
      
      // Create a meal without a meal plan
      const mealData = insertMealSchema.parse({
        name,
        time,
        date: date || new Date().toISOString().split('T')[0],
        userId: req.user!.id
      });
      
      const meal = await dbStorage.createMeal(mealData);
      
      // Add foods to the meal
      if (Array.isArray(foods) && foods.length > 0) {
        for (const food of foods) {
          const foodData = insertMealFoodSchema.parse({
            foodId: food.foodId,
            servings: food.servings,
            mealId: meal.id
          });
          
          await dbStorage.addFoodToMeal(foodData);
        }
      }
      
      res.status(200).json({ message: "Meal logged successfully", meal });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      console.error("Error logging meal:", error);
      res.status(500).json({ message: "Failed to log meal" });
    }
  });

  // AI recommendation routes
  app.post("/api/ai/workout-recommendation", async (req, res) => {
    try {
      const { goals, fitnessLevel, limitations, preferredExercises } = req.body;
      
      if (!goals || !fitnessLevel) {
        return res.status(400).json({ message: "Goals and fitness level are required" });
      }
      
      const recommendation = await getWorkoutRecommendation({
        goals,
        fitnessLevel,
        limitations,
        preferredExercises
      });
      
      res.json(recommendation);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate workout recommendation" });
    }
  });

  app.post("/api/ai/nutrition-recommendation", async (req, res) => {
    try {
      const { goals, dietaryRestrictions, currentIntake } = req.body;
      
      if (!goals) {
        return res.status(400).json({ message: "Goals are required" });
      }
      
      const recommendation = await getNutritionRecommendation({
        goals,
        dietaryRestrictions,
        currentIntake
      });
      
      res.json(recommendation);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate nutrition recommendation" });
    }
  });

  app.post("/api/ai/progress-analysis", async (req, res) => {
    try {
      const { startingStats, currentStats, goal, timeframe } = req.body;
      
      if (!startingStats || !currentStats || !goal || !timeframe) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      const analysis = await getProgressAnalysis({
        startingStats,
        currentStats,
        goal,
        timeframe
      });
      
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate progress analysis" });
    }
  });

  // User settings routes
  app.patch("/api/user", async (req, res) => {
    try {
      type UserUpdate = {
        name?: string;
        email?: string;
        waterIntakeGoal?: number;
        calorieGoal?: number;
        macros?: {
          protein: number;
          carbs: number;
          fats: number;
        };
      };
      
      const updateData: UserUpdate = {};
      
      if (typeof req.body.name === 'string') updateData.name = req.body.name;
      if (typeof req.body.email === 'string') updateData.email = req.body.email;
      if (typeof req.body.waterIntakeGoal === 'number') updateData.waterIntakeGoal = req.body.waterIntakeGoal;
      if (typeof req.body.calorieGoal === 'number') updateData.calorieGoal = req.body.calorieGoal;
      if (req.body.macros && 
          typeof req.body.macros.protein === 'number' &&
          typeof req.body.macros.carbs === 'number' &&
          typeof req.body.macros.fats === 'number') {
        updateData.macros = req.body.macros;
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const updatedUser = await dbStorage.updateUser(req.user!.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Add endpoint to start a workout plan
  app.post("/api/workout-plans/:id/start", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await dbStorage.getWorkoutPlanById(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }

      // Only allow if user owns the plan or it's a template
      if (!plan.isTemplate && plan.userId !== req.user!.id) {
        return res.status(403).json({ message: "Unauthorized access to this workout plan" });
      }

      const exercises = await dbStorage.getWorkoutPlanExercises(planId);
      
      if (!exercises || exercises.length === 0) {
        return res.status(400).json({ message: "Workout plan has no exercises" });
      }
      
      const workoutSession = {
        id: Date.now(), // Temporary ID until we implement proper session storage
        planId: plan.id,
        planName: plan.name,
        startTime: new Date().toISOString(),
        userId: req.user!.id,
        exercises: exercises,
        inProgress: true
      };
      
      res.status(200).json(workoutSession);
    } catch (error) {
      console.error('Error starting workout:', error);
      res.status(500).json({ message: "Failed to start workout" });
    }
  });

  // Water intake endpoints
  app.get("/api/water-intake", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const today = new Date();
      const intakes = await dbStorage.getWaterIntakes(req.user.id, today);
      const total = await dbStorage.getTotalWaterIntake(req.user.id, today);

      res.json({
        intakes,
        total,
      });
    } catch (error) {
      console.error("[water-intake] Error fetching water intake:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/water-intake", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { amount } = req.body;
      if (!amount || typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const intake = await dbStorage.addWaterIntake({
        userId: req.user.id,
        amount,
      });

      res.json(intake);
    } catch (error) {
      console.error("Error adding water intake:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Nutrition summary endpoint
  app.get("/api/nutrition-summary", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const userId = req.user.id;
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];

      // Get all meals for today for this user
      const meals = await dbStorage.getMealsForUserOnDate(userId, todayStr);
      let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
      const mealSummaries = [];

      for (const meal of meals) {
        const mealFoods = await dbStorage.getMealFoods(meal.id);
        let mealCalories = 0, mealProtein = 0, mealCarbs = 0, mealFats = 0;
        for (const mf of mealFoods) {
          mealCalories += mf.food.calories * mf.servings;
          mealProtein += mf.food.protein * mf.servings;
          mealCarbs += mf.food.carbs * mf.servings;
          mealFats += mf.food.fats * mf.servings;
        }
        totalCalories += mealCalories;
        totalProtein += mealProtein;
        totalCarbs += mealCarbs;
        totalFats += mealFats;
        mealSummaries.push({
          type: meal.name,
          name: mealFoods.map(mf => mf.food.name).join(", "),
          calories: Math.round(mealCalories)
        });
      }

      // Get user goals
      const user = await dbStorage.getUser(userId);
      const calorieGoal = user?.calorieGoal || 2700;
      const macros = user?.macros || { protein: 150, carbs: 270, fats: 60 };

      res.json({
        calories: {
          consumed: Math.round(totalCalories),
          goal: calorieGoal,
          remaining: Math.max(0, calorieGoal - Math.round(totalCalories))
        },
        macros: {
          protein: { consumed: Math.round(totalProtein), goal: macros.protein },
          carbs: { consumed: Math.round(totalCarbs), goal: macros.carbs },
          fats: { consumed: Math.round(totalFats), goal: macros.fats }
        },
        meals: mealSummaries
      });
    } catch (error) {
      console.error("[nutrition-summary] Error:", error);
      res.status(500).json({ message: "Failed to fetch nutrition summary" });
    }
  });

  // Progress Photos routes
  app.get("/api/progress-photos", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const photos = await dbStorage.getProgressPhotos(req.user.id);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch progress photos" });
    }
  });

  app.post("/api/progress-photos", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { url, body_part, note } = req.body;
      if (!url || !body_part) return res.status(400).json({ message: "Missing fields" });
      const photo = await dbStorage.addProgressPhoto({
        userId: req.user.id,
        url,
        bodyPart: body_part,
        note
      });
      res.status(201).json(photo);
    } catch (error) {
      res.status(500).json({ message: "Failed to save progress photo" });
    }
  });

  // Cloudinary signature endpoint for signed uploads
  app.post("/api/cloudinary-signature", express.json(), (req, res) => {
    const { timestamp, upload_preset } = req.body;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) return res.status(500).json({ error: "Missing Cloudinary API secret" });
    const paramsToSign = `timestamp=${timestamp}&upload_preset=${upload_preset}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");
    res.json({ signature });
  });

  // Trained Body Parts routes
  app.get("/api/trained-body-parts", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const userId = req.user.id;
      const { from } = req.query;
      if (from) {
        // Fetch all trained body parts from 'from' date to today
        const fromDate = new Date(from as string);
        fromDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const parts = await dbStorage.getTrainedBodyPartsInRange(userId, fromDate, today);
        res.json(parts);
      } else {
        // Only fetch for today
        const today = new Date();
        const parts = await dbStorage.getTrainedBodyParts(userId, today);
        res.json(parts);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trained body parts" });
    }
  });

  app.post("/api/trained-body-parts", async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      const { body_part } = req.body;
      if (!body_part) return res.status(400).json({ message: "Missing body_part" });
      const entry = await dbStorage.addTrainedBodyPart({
        userId: req.user.id,
        bodyPart: body_part
      });
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({ message: "Failed to log trained body part" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
