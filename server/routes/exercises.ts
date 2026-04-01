import { Router } from "express";
import { storage as dbStorage } from "../storage.js";

export const exercisesRouter = Router();

exercisesRouter.get("/exercises", async (req, res) => {
  try {
    const { query, muscleGroup } = req.query;
    let exercises = await dbStorage.getExercises();

    if (query) {
      exercises = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(query.toString().toLowerCase())
      );
    }

    if (muscleGroup) {
      exercises = exercises.filter((exercise) => {
        const muscleGroups = Array.isArray(exercise.muscleGroups)
          ? exercise.muscleGroups
          : JSON.parse(exercise.muscleGroups as string);
        return muscleGroups.includes(muscleGroup);
      });
    }

    const formattedExercises = exercises.map((exercise) => ({
      ...exercise,
      muscleGroups: Array.isArray(exercise.muscleGroups)
        ? exercise.muscleGroups
        : JSON.parse(exercise.muscleGroups as string),
      equipment: exercise.equipment
        ? Array.isArray(exercise.equipment)
          ? exercise.equipment
          : JSON.parse(exercise.equipment as string)
        : [],
    }));

    res.json(formattedExercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ error: "Failed to fetch exercises" });
  }
});

exercisesRouter.get("/exercises/:id", async (req, res) => {
  try {
    const exercise = await dbStorage.getExerciseById(parseInt(req.params.id, 10));

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch exercise" });
  }
});
