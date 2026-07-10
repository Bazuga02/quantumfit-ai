import { Router } from "express";
import { z } from "zod";
import { insertMeasurementSchema } from "../../shared/schema.js";
import { storage as dbStorage } from "../storage.js";
import { requireAuth } from "../middleware/require-auth.js";

export const measurementsRouter = Router();

measurementsRouter.use(requireAuth);

measurementsRouter.get("/measurements", async (req, res) => {
  try {
    const measurements = await dbStorage.getMeasurements(req.user!.id);
    res.json(measurements);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch measurements" });
  }
});

measurementsRouter.post("/measurements", async (req, res) => {
  try {
    const data = insertMeasurementSchema.parse({
      ...req.body,
      userId: req.user!.id,
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
