import express from "express";
import rewardsController from "../controllers/rewardsController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  rewardsController.getAllRewardsAdmin,
);
router.get(
  "/:id",
  authMiddleware,
  adminMiddleware,
  rewardsController.getRewardAdminDetail,
);
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  rewardsController.createReward,
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  rewardsController.updateReward,
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  rewardsController.deleteReward,
);

export default router;
