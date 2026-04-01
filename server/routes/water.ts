import { Router } from "express";
import { storage as dbStorage } from "../storage.js";

export const waterRouter = Router();

waterRouter.get("/water-intake", async (req, res) => {
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

waterRouter.post("/water-intake", async (req, res) => {
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
