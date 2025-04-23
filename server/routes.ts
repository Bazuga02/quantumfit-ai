import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import {
  insertWaterIntakeLogSchema,
  insertMeasurementSchema,
  insertWorkoutPlanSchema,
  insertWorkoutPlanExerciseSchema,
  insertMealPlanSchema,
  insertMealSchema,
  insertMealFoodSchema
} from "@shared/schema";
import {
  getWorkoutRecommendation,
  getNutritionRecommendation,
  getProgressAnalysis
} from "./openai";
import { z } from "zod";

// Middleware to ensure user is authenticated
function ensureAuthenticated(req: Request, res: Response, next: Function) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Water intake tracking routes
  app.get("/api/water-intake", ensureAuthenticated, async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const logs = await storage.getWaterIntakeLogs(req.user.id, date);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch water intake logs" });
    }
  });

  app.post("/api/water-intake", ensureAuthenticated, async (req, res) => {
    try {
      const data = insertWaterIntakeLogSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const log = await storage.addWaterIntake(data);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add water intake" });
    }
  });

  // Measurements routes
  app.get("/api/measurements", ensureAuthenticated, async (req, res) => {
    try {
      const measurements = await storage.getMeasurements(req.user.id);
      res.json(measurements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch measurements" });
    }
  });

  app.post("/api/measurements", ensureAuthenticated, async (req, res) => {
    try {
      const data = insertMeasurementSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const measurement = await storage.addMeasurement(data);
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
      let exercises;
      
      if (req.query.search) {
        const muscleGroup = req.query.muscleGroup as string | undefined;
        exercises = await storage.searchExercises(req.query.search as string, muscleGroup);
      } else {
        exercises = await storage.getExercises();
      }
      
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const exercise = await storage.getExerciseById(parseInt(req.params.id));
      
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      
      res.json(exercise);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise" });
    }
  });

  // Workout plans routes
  app.get("/api/workout-plans", ensureAuthenticated, async (req, res) => {
    try {
      let plans = await storage.getWorkoutPlans(req.user.id);
      
      // If no workout plans exist for the user, create default ones
      if (plans.length === 0) {
        // Get exercise data for reference
        const allExercises = await storage.getExercises();
        
        // Create default workout plans
        const defaultPlans = [
          {
            name: "Upper Body Strength",
            description: "Focus on chest, shoulders and triceps with progressive overload.",
            difficulty: "intermediate",
            duration: 45,
            userId: req.user.id
          },
          {
            name: "Lower Body Power",
            description: "Leg day focusing on strength and power development.",
            difficulty: "advanced",
            duration: 50,
            userId: req.user.id
          },
          {
            name: "Core Stability",
            description: "Core-focused workout to improve stability and strength.",
            difficulty: "beginner",
            duration: 30,
            userId: req.user.id
          }
        ];
        
        // Add default plans to database
        for (const planData of defaultPlans) {
          const plan = await storage.createWorkoutPlan(planData);
          
          // Add exercises to each plan
          if (plan.name === "Upper Body Strength" && allExercises.length >= 3) {
            await storage.addExerciseToWorkoutPlan({
              workoutPlanId: plan.id,
              exerciseId: allExercises[0].id, // Bench Press
              sets: 4,
              reps: 10,
              restTime: 60,
              order: 1
            });
            await storage.addExerciseToWorkoutPlan({
              workoutPlanId: plan.id,
              exerciseId: allExercises[1].id, // Shoulder Press
              sets: 3,
              reps: 12,
              restTime: 60,
              order: 2
            });
            await storage.addExerciseToWorkoutPlan({
              workoutPlanId: plan.id,
              exerciseId: allExercises[3].id, // Tricep Extensions
              sets: 3,
              reps: 15,
              restTime: 60,
              order: 3
            });
          } else if (plan.name === "Lower Body Power" && allExercises.length >= 6) {
            await storage.addExerciseToWorkoutPlan({
              workoutPlanId: plan.id,
              exerciseId: allExercises[4].id, // Squats
              sets: 4,
              reps: 8,
              restTime: 90,
              order: 1
            });
            await storage.addExerciseToWorkoutPlan({
              workoutPlanId: plan.id,
              exerciseId: allExercises[5].id, // Deadlifts
              sets: 3,
              reps: 8,
              restTime: 90,
              order: 2
            });
            await storage.addExerciseToWorkoutPlan({
              workoutPlanId: plan.id,
              exerciseId: allExercises[6].id, // Lunges
              sets: 3,
              reps: 12,
              restTime: 60,
              order: 3
            });
          } else if (plan.name === "Core Stability" && allExercises.length >= 9) {
            await storage.addExerciseToWorkoutPlan({
              workoutPlanId: plan.id,
              exerciseId: allExercises[7].id, // Planks
              sets: 3,
              reps: 1,
              duration: 60,
              restTime: 45,
              order: 1
            });
            await storage.addExerciseToWorkoutPlan({
              workoutPlanId: plan.id,
              exerciseId: allExercises[8].id, // Russian Twists
              sets: 3,
              reps: 20,
              restTime: 45,
              order: 2
            });
            await storage.addExerciseToWorkoutPlan({
              workoutPlanId: plan.id,
              exerciseId: allExercises[9].id, // Mountain Climbers
              sets: 3,
              reps: 1,
              duration: 45,
              restTime: 30,
              order: 3
            });
          }
        }
        
        // Fetch the created plans
        plans = await storage.getWorkoutPlans(req.user.id);
      }
      
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plans" });
    }
  });

  app.get("/api/workout-plans/:id", ensureAuthenticated, async (req, res) => {
    try {
      const plan = await storage.getWorkoutPlanById(parseInt(req.params.id));
      
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      
      if (plan.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this workout plan" });
      }
      
      const exercises = await storage.getWorkoutPlanExercises(plan.id);
      
      res.json({
        ...plan,
        exercises
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout plan" });
    }
  });

  app.post("/api/workout-plans", ensureAuthenticated, async (req, res) => {
    try {
      const data = insertWorkoutPlanSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const plan = await storage.createWorkoutPlan(data);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });

  app.post("/api/workout-plans/:id/exercises", ensureAuthenticated, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getWorkoutPlanById(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      
      if (plan.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this workout plan" });
      }
      
      const data = insertWorkoutPlanExerciseSchema.parse({
        ...req.body,
        workoutPlanId: planId
      });
      
      const exercise = await storage.addExerciseToWorkoutPlan(data);
      res.status(201).json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add exercise to workout plan" });
    }
  });
  
  // Start a workout session
  app.post("/api/workout-plans/:id/start", ensureAuthenticated, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getWorkoutPlanById(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Workout plan not found" });
      }
      
      if (plan.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this workout plan" });
      }
      
      // Get all exercises in this workout plan
      const exercises = await storage.getWorkoutPlanExercises(planId);
      
      // Create a workout session object with detailed exercise information
      const workoutSession = {
        id: Date.now(), // Generate a temporary ID for the session
        planId,
        planName: plan.name,
        startTime: new Date().toISOString(),
        userId: req.user.id,
        exercises: exercises,
        inProgress: true
      };
      
      res.status(200).json(workoutSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to start workout session" });
    }
  });

  // Food and nutrition routes
  app.get("/api/foods", async (req, res) => {
    try {
      let foods;
      
      if (req.query.search) {
        foods = await storage.searchFoods(req.query.search as string);
      } else if (req.query.category) {
        foods = await storage.getFoods(req.query.category as string);
      } else {
        foods = await storage.getFoods();
      }
      
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch foods" });
    }
  });

  app.get("/api/foods/:id", async (req, res) => {
    try {
      const food = await storage.getFoodById(parseInt(req.params.id));
      
      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }
      
      res.json(food);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food" });
    }
  });

  // Meal plans routes
  app.get("/api/meal-plans", ensureAuthenticated, async (req, res) => {
    try {
      const plans = await storage.getMealPlans(req.user.id);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.get("/api/meal-plans/:id", ensureAuthenticated, async (req, res) => {
    try {
      const plan = await storage.getMealPlanById(parseInt(req.params.id));
      
      if (!plan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      
      if (plan.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this meal plan" });
      }
      
      const meals = await storage.getMealsForPlan(plan.id);
      const mealsWithFoods = await Promise.all(
        meals.map(async (meal) => {
          const foods = await storage.getMealFoods(meal.id);
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

  app.post("/api/meal-plans", ensureAuthenticated, async (req, res) => {
    try {
      const data = insertMealPlanSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const plan = await storage.createMealPlan(data);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create meal plan" });
    }
  });

  app.post("/api/meal-plans/:id/meals", ensureAuthenticated, async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      const plan = await storage.getMealPlanById(planId);
      
      if (!plan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      
      if (plan.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized access to this meal plan" });
      }
      
      const data = insertMealSchema.parse({
        ...req.body,
        mealPlanId: planId
      });
      
      const meal = await storage.createMeal(data);
      res.status(201).json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add meal to meal plan" });
    }
  });

  app.post("/api/meals/:id/foods", ensureAuthenticated, async (req, res) => {
    try {
      const data = insertMealFoodSchema.parse({
        ...req.body,
        mealId: parseInt(req.params.id)
      });
      
      const mealFood = await storage.addFoodToMeal(data);
      res.status(201).json(mealFood);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add food to meal" });
    }
  });
  
  // Direct meal logging route for standalone meals
  app.post("/api/meals", ensureAuthenticated, async (req, res) => {
    try {
      // Create a meal first
      const { name, time, date, foods } = req.body;
      
      // Create a meal without a meal plan
      const mealData = insertMealSchema.parse({
        name,
        time,
        date: date || new Date().toISOString().split('T')[0],
        userId: req.user.id
      });
      
      const meal = await storage.createMeal(mealData);
      
      // Add foods to the meal
      if (Array.isArray(foods) && foods.length > 0) {
        for (const food of foods) {
          const foodData = insertMealFoodSchema.parse({
            foodId: food.foodId,
            servings: food.servings,
            mealId: meal.id
          });
          
          await storage.addFoodToMeal(foodData);
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
  app.post("/api/ai/workout-recommendation", ensureAuthenticated, async (req, res) => {
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

  app.post("/api/ai/nutrition-recommendation", ensureAuthenticated, async (req, res) => {
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

  app.post("/api/ai/progress-analysis", ensureAuthenticated, async (req, res) => {
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
  app.patch("/api/user/settings", ensureAuthenticated, async (req, res) => {
    try {
      const allowedFields = ["name", "waterIntakeGoal", "calorieGoal", "macros"];
      const updateData: Partial<typeof req.user> = {};
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      
      const updatedUser = await storage.updateUser(req.user.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
