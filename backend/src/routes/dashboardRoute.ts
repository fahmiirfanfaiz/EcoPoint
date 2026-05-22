import express from "express";
import dashboardController from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, dashboardController.getDashboard);
router.post("/seen", authMiddleware, dashboardController.updateSeenAchievements);

export default router;
