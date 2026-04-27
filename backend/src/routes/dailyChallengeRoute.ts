import express from "express";
import dailyChallengeController from "../controllers/dailyChallengeController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ── User Endpoints ─────────────────────────────────────────
// Get today's challenge (works for both guests and logged-in users)
router.get("/today", authMiddleware, dailyChallengeController.getTodayChallenge);

// Update progress on today's challenge
router.post("/progress", authMiddleware, dailyChallengeController.updateProgress);

// Claim points for completed challenge
router.post("/claim", authMiddleware, dailyChallengeController.claimPoints);

// ── Admin Endpoints ────────────────────────────────────────
// List ALL challenges (including inactive)
router.get("/admin/all", authMiddleware, adminMiddleware, dailyChallengeController.getAllChallenges);

// Create a new challenge template
router.post("/admin", authMiddleware, adminMiddleware, dailyChallengeController.createChallenge);

// Update a challenge
router.put("/admin/:id", authMiddleware, adminMiddleware, dailyChallengeController.updateChallenge);

// Delete a challenge
router.delete("/admin/:id", authMiddleware, adminMiddleware, dailyChallengeController.deleteChallenge);

export default router;
