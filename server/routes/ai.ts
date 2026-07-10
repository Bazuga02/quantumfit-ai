import { Router } from "express";
import {
  getWorkoutRecommendation,
  getNutritionRecommendation,
  getProgressAnalysis,
} from "../openai.js";
import { storage as dbStorage } from "../storage.js";
import { aiGenerateLimiter } from "../middleware/rate-limit.js";
import { GroqRateLimitError } from "../groq-rate-limiter.js";
import { requireAuth } from "../middleware/require-auth.js";

function handleAiError(res: import("express").Response, error: unknown, fallback: string) {
  if (error instanceof GroqRateLimitError) {
    return res.status(429).json({ message: error.message });
  }

  console.error(fallback, error);
  const body: { message: string; error?: string } = { message: fallback };
  if (process.env.API_DEBUG === "1" && error instanceof Error) {
    body.error = error.message;
  }
  return res.status(500).json(body);
}

export const aiRouter = Router();

aiRouter.use(requireAuth);

aiRouter.get("/ai/workout-recommendations", async (req, res) => {
  try {
    const list = await dbStorage.getAiWorkoutRecommendations(req.user!.id);
    res.json(list);
  } catch (error) {
    console.error("List workout recommendations error:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

aiRouter.get("/ai/nutrition-recommendations", async (req, res) => {
  try {
    const list = await dbStorage.getAiNutritionRecommendations(req.user!.id);
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
    handleAiError(res, error, "Failed to generate workout recommendation");
  }
});

aiRouter.post("/ai/workout-recommendation/save", async (req, res) => {
  try {
    const { title, description, exercises } = req.body;
    if (!title || !description || !Array.isArray(exercises)) {
      return res.status(400).json({ message: "title, description, and exercises are required" });
    }
    const saved = await dbStorage.saveAiWorkoutRecommendation(req.user!.id, {
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
    handleAiError(res, error, "Failed to generate nutrition recommendation");
  }
});

aiRouter.post("/ai/nutrition-recommendation/save", async (req, res) => {
  try {
    const { title, description, meals, dailyTotals } = req.body;
    if (!title || !description || !Array.isArray(meals) || !dailyTotals) {
      return res.status(400).json({ message: "title, description, meals, and dailyTotals are required" });
    }
    const saved = await dbStorage.saveAiNutritionRecommendation(req.user!.id, {
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
    handleAiError(res, error, "Failed to generate progress analysis");
  }
});
