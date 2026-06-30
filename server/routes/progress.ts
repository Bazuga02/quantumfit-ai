import { Router } from "express";
import { storage as dbStorage } from "../storage.js";

export const progressRouter = Router();

progressRouter.get("/progress-photos", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const photos = await dbStorage.getProgressPhotos(req.user.id);
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch progress photos" });
  }
});

progressRouter.post("/progress-photos", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { url, body_part, note } = req.body;
    if (!url || !body_part) return res.status(400).json({ message: "Missing fields" });
    const photo = await dbStorage.addProgressPhoto({
      userId: req.user.id,
      url,
      bodyPart: body_part,
      note,
    });
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: "Failed to save progress photo" });
  }
});

progressRouter.get("/trained-body-parts", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user.id;
    const { from } = req.query;
    if (from) {
      const fromDate = new Date(from as string);
      fromDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const parts = await dbStorage.getTrainedBodyPartsInRange(userId, fromDate, today);
      res.json(parts);
    } else {
      const today = new Date();
      const parts = await dbStorage.getTrainedBodyParts(userId, today);
      res.json(parts);
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch trained body parts" });
  }
});

progressRouter.post("/trained-body-parts", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { body_part } = req.body;
    if (!body_part) return res.status(400).json({ message: "Missing body_part" });
    const entry = await dbStorage.addTrainedBodyPart({
      userId: req.user.id,
      bodyPart: body_part,
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: "Failed to log trained body part" });
  }
});
