import { Router } from "express";
import { z } from "zod";
import { insertWorkoutPlanSchema, insertWorkoutPlanExerciseSchema } from "../../shared/schema.js";
import { storage as dbStorage } from "../storage.js";

export const workoutPlansRouter = Router();

workoutPlansRouter.get("/workout-plans", async (req, res) => {
  try {
    const isTemplate =
      req.query.isTemplate === "true" ? true : req.query.isTemplate === "false" ? false : undefined;
    const userId = isTemplate ? undefined : req.user!.id;
    const plans = await dbStorage.getWorkoutPlans({ userId, isTemplate });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch workout plans" });
  }
});

workoutPlansRouter.post("/workout-plans", async (req, res) => {
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

workoutPlansRouter.post("/workout-plans/:id/exercises", async (req, res) => {
  try {
    const data = insertWorkoutPlanExerciseSchema.parse({
      ...req.body,
      workoutPlanId: parseInt(req.params.id, 10),
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

workoutPlansRouter.post("/workout-plans/:id/start", async (req, res) => {
  try {
    const planId = parseInt(req.params.id, 10);
    const plan = await dbStorage.getWorkoutPlanById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }

    if (!plan.isTemplate && plan.userId !== req.user!.id) {
      return res.status(403).json({ message: "Unauthorized access to this workout plan" });
    }

    const exercises = await dbStorage.getWorkoutPlanExercises(planId);

    if (!exercises || exercises.length === 0) {
      return res.status(400).json({ message: "Workout plan has no exercises" });
    }

    const workoutSession = {
      id: Date.now(),
      planId: plan.id,
      planName: plan.name,
      startTime: new Date().toISOString(),
      userId: req.user!.id,
      exercises,
      inProgress: true,
    };

    res.status(200).json(workoutSession);
  } catch (error) {
    console.error("Error starting workout:", error);
    res.status(500).json({ message: "Failed to start workout" });
  }
});
