import { Router } from "express";
import {
  getWorkoutRecommendation,
  getNutritionRecommendation,
  getProgressAnalysis,
} from "../openai.js";
import { storage as dbStorage } from "../storage.js";
import { aiGenerateLimiter } from "../middleware/rate-limit.js";

export const aiRouter = Router();

aiRouter.get("/ai/workout-recommendations", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const list = await dbStorage.getAiWorkoutRecommendations(req.user.id);
    res.json(list);
  } catch (error) {
    console.error("List workout recommendations error:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

aiRouter.get("/ai/nutrition-recommendations", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const list = await dbStorage.getAiNutritionRecommendations(req.user.id);
    res.json(list);
  } catch (error) {
    console.error("List nutrition recommendations error:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

aiRouter.post("/ai/workout-recommendation", aiGenerateLimiter, async (req, res) => {
  try {
    const { goals, fitnessLevel, limitations, preferredExercises } = req.body;

    if (!goals || !fitnessLevel) {
      return res.status(400).json({ message: "Goals and fitness level are required" });
    }

    const recommendation = await getWorkoutRecommendation({
      goals: String(goals),
      fitnessLevel: String(fitnessLevel),
      limitations: limitations != null ? String(limitations) : undefined,
      preferredExercises: Array.isArray(preferredExercises) ? preferredExercises : undefined,
    });

    res.json(recommendation);
  } catch (error) {
    console.error("Workout recommendation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate workout recommendation";
    res.status(500).json({ message: "Failed to generate workout recommendation", error: message });
  }
});

aiRouter.post("/ai/workout-recommendation/save", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "You must be logged in to save" });
    }
    const { title, description, exercises } = req.body;
    if (!title || !description || !Array.isArray(exercises)) {
      return res.status(400).json({ message: "title, description, and exercises are required" });
    }
    const saved = await dbStorage.saveAiWorkoutRecommendation(req.user.id, {
      title,
      description,
      exercises,
    });
    res.json(saved);
  } catch (error) {
    console.error("Save workout recommendation error:", error);
    res.status(500).json({ message: "Failed to save workout recommendation" });
  }
});

aiRouter.post("/ai/nutrition-recommendation", aiGenerateLimiter, async (req, res) => {
  try {
    const { goals, dietaryRestrictions, currentIntake } = req.body;

    if (!goals) {
      return res.status(400).json({ message: "Goals are required" });
    }

    const recommendation = await getNutritionRecommendation({
      goals,
      dietaryRestrictions,
      currentIntake,
    });

    res.json(recommendation);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate nutrition recommendation" });
  }
});

aiRouter.post("/ai/nutrition-recommendation/save", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "You must be logged in to save" });
    }
    const { title, description, meals, dailyTotals } = req.body;
    if (!title || !description || !Array.isArray(meals) || !dailyTotals) {
      return res.status(400).json({ message: "title, description, meals, and dailyTotals are required" });
    }
    const saved = await dbStorage.saveAiNutritionRecommendation(req.user.id, {
      title,
      description,
      meals,
      dailyTotals,
    });
    res.json(saved);
  } catch (error) {
    console.error("Save nutrition recommendation error:", error);
    res.status(500).json({ message: "Failed to save nutrition recommendation" });
  }
});

aiRouter.post("/ai/progress-analysis", aiGenerateLimiter, async (req, res) => {
  try {
    const { startingStats, currentStats, goal, timeframe } = req.body;

    if (!startingStats || !currentStats || !goal || !timeframe) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const analysis = await getProgressAnalysis({
      startingStats,
      currentStats,
      goal,
      timeframe,
    });

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: "Failed to generate progress analysis" });
  }
});
