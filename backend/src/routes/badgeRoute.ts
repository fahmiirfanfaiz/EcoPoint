import express from "express";
import badgeController from "../controllers/badgeController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ── Public ──────────────────────────────────────────────────
router.get("/", badgeController.getBadges);

// ── Admin ───────────────────────────────────────────────────
router.get("/admin/all", authMiddleware, adminMiddleware, badgeController.getAllBadgesAdmin);
router.post("/admin", authMiddleware, adminMiddleware, badgeController.createBadge);
router.put("/admin/:id", authMiddleware, adminMiddleware, badgeController.updateBadge);
router.delete("/admin/:id", authMiddleware, adminMiddleware, badgeController.deleteBadge);

export default router;
