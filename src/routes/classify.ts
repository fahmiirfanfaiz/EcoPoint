import { Router, Request, Response } from "express";
import multer from "multer";
import { classifyTrashImage } from "../classifier";
import { ClassifyResponse, ErrorResponse } from "../types";

const router = Router();

// Store file in memory (buffer), not on disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WEBP, or GIF images are allowed"));
    }
  },
});

/**
 * POST /api/classify
 *
 * Accepts multipart/form-data with a single field named "image".
 * Returns a JSON classification result.
 *
 * Example with fetch:
 *   const form = new FormData();
 *   form.append("image", file);
 *   const res = await fetch("/api/classify", { method: "POST", body: form });
 */
router.post(
  "/",
  upload.single("image"),
  async (
    req: Request,
    res: Response<ClassifyResponse | ErrorResponse>
  ): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No image file provided. Use field name 'image'." });
      return;
    }

    try {
      const imageBase64 = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype as
        | "image/jpeg"
        | "image/png"
        | "image/webp"
        | "image/gif";

      const result = await classifyTrashImage(imageBase64, mimeType);

      res.status(200).json({ success: true, data: result });
    } catch (err) {
      console.error("[classify] Error:", err);
      const message = err instanceof Error ? err.message : "Classification failed";
      res.status(500).json({ success: false, error: message });
    }
  }
);

export default router;
