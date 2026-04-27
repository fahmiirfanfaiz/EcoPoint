import express from "express";
import rewardsController from "../controllers/rewardsController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/", rewardsController.getRewards);

// Protected
router.post("/redeem", authMiddleware, rewardsController.redeemReward);
router.get("/history", authMiddleware, rewardsController.getRedemptionHistory);

export default router;
