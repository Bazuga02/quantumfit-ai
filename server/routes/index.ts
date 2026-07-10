import express, { type Express, type RequestHandler } from "express";
import path from "path";
import { setupAuth } from "../auth.js";
import { attachUser } from "../middleware/attach-user.js";
import { userRouter } from "./user.js";
import { measurementsRouter } from "./measurements.js";
import { exercisesRouter } from "./exercises.js";
import { foodsRouter } from "./foods.js";
import { workoutPlansRouter } from "./workout-plans.js";
import { mealsRouter } from "./meals.js";
import { aiRouter } from "./ai.js";
import { waterRouter } from "./water.js";
import { nutritionSummaryRouter } from "./nutrition-summary.js";
import { progressRouter } from "./progress.js";
import { scheduleGuestCleanup } from "../guest-cleanup.js";

const runAttachUser: RequestHandler = (req, res, next) => {
  void attachUser(req, res, next);
};

/** Registers HTTP routes and static `/uploads` on `app`. Does not create an HTTP server. */
export async function registerRoutes(app: Express): Promise<void> {
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  setupAuth(app);

  app.use("/api", runAttachUser);

  const api = express.Router();
  api.use(userRouter);
  api.use(measurementsRouter);
  api.use(exercisesRouter);
  api.use(foodsRouter);
  api.use(workoutPlansRouter);
  api.use(mealsRouter);
  api.use(aiRouter);
  api.use(waterRouter);
  api.use(nutritionSummaryRouter);
  api.use(progressRouter);

  app.use("/api", api);

  scheduleGuestCleanup();
}
