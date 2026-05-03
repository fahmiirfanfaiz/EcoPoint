import express from "express";
import levelController from "../controllers/levelController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ── Public ──────────────────────────────────────────────────
router.get("/", levelController.getLevels);

// ── Admin ───────────────────────────────────────────────────
router.post("/admin", authMiddleware, adminMiddleware, levelController.createLevel);
router.put("/admin/:id", authMiddleware, adminMiddleware, levelController.updateLevel);
router.delete("/admin/:id", authMiddleware, adminMiddleware, levelController.deleteLevel);

export default router;
