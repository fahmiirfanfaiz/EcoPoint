import express from "express";
import badgeController from "../controllers/badgeController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", badgeController.getBadges);

// Protected endpoint to add badges (Ideally we'd check for admin role here)
router.post("/", authMiddleware, badgeController.createBadge);

export default router;
