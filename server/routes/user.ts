import { Router } from "express";
import { storage as dbStorage } from "../storage.js";
import { toAuthUser } from "../types/auth.js";
import { requireAuth } from "../middleware/require-auth.js";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/user", async (req, res) => {
  try {
    const fresh = await dbStorage.getUser(req.user!.id);
    if (!fresh) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.json(toAuthUser(fresh));
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

userRouter.patch("/user", async (req, res) => {
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

    if (typeof req.body.name === "string") updateData.name = req.body.name;
    if (typeof req.body.email === "string") updateData.email = req.body.email;
    if (typeof req.body.waterIntakeGoal === "number") updateData.waterIntakeGoal = req.body.waterIntakeGoal;
    if (typeof req.body.calorieGoal === "number") updateData.calorieGoal = req.body.calorieGoal;
    if (
      req.body.macros &&
      typeof req.body.macros.protein === "number" &&
      typeof req.body.macros.carbs === "number" &&
      typeof req.body.macros.fats === "number"
    ) {
      updateData.macros = req.body.macros;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedUser = await dbStorage.updateUser(req.user!.id, updateData);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(toAuthUser(updatedUser));
  } catch (error) {
    res.status(500).json({ message: "Failed to update user" });
  }
});
