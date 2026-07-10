import { Router } from "express";
import { storage as dbStorage } from "../storage.js";
import { requireAuth } from "../middleware/require-auth.js";
import {
  createCloudinaryUploadSignature,
  getCloudinaryConfig,
  isAllowedProgressPhotoUrl,
} from "../cloudinary.js";

export const progressRouter = Router();

progressRouter.use(requireAuth);

progressRouter.post("/cloudinary-signature", (req, res) => {
  try {
    const config = getCloudinaryConfig();
    if (!config) {
      return res.status(503).json({ message: "Cloudinary is not configured" });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const payload = createCloudinaryUploadSignature(timestamp);
    res.json(payload);
  } catch (error) {
    console.error("Cloudinary signature error:", error);
    res.status(500).json({ message: "Failed to create upload signature" });
  }
});

progressRouter.get("/progress-photos", async (req, res) => {
  try {
    const photos = await dbStorage.getProgressPhotos(req.user!.id);
    res.json(photos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch progress photos" });
  }
});

progressRouter.post("/progress-photos", async (req, res) => {
  try {
    const { url, body_part, note } = req.body;
    if (!url || !body_part) return res.status(400).json({ message: "Missing fields" });

    if (!isAllowedProgressPhotoUrl(String(url))) {
      return res.status(400).json({ message: "Photo URL must be a valid Cloudinary image URL" });
    }

    const photo = await dbStorage.addProgressPhoto({
      userId: req.user!.id,
      url: String(url),
      bodyPart: String(body_part),
      note: note != null ? String(note) : undefined,
    });
    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: "Failed to save progress photo" });
  }
});

progressRouter.get("/trained-body-parts", async (req, res) => {
  try {
    const userId = req.user!.id;
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
    const { body_part } = req.body;
    if (!body_part) return res.status(400).json({ message: "Missing body_part" });
    const entry = await dbStorage.addTrainedBodyPart({
      userId: req.user!.id,
      bodyPart: String(body_part),
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: "Failed to log trained body part" });
  }
});
