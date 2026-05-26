import { Router } from "express";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendBroadcast,
  listBroadcasts,
  deleteBroadcast,
} from "../controllers/notificationController.js";

// ─── User routes: /api/notifications ───────────────────────
const userRouter = Router();
userRouter.get("/", authMiddleware, getNotifications);
userRouter.patch("/read-all", authMiddleware, markAllAsRead);
userRouter.patch("/:id/read", authMiddleware, markAsRead);

// ─── Admin routes: /api/admin/notifications ────────────────
const adminRouter = Router();
adminRouter.get("/", authMiddleware, adminMiddleware, listBroadcasts);
adminRouter.post("/", authMiddleware, adminMiddleware, sendBroadcast);
adminRouter.delete("/:id", authMiddleware, adminMiddleware, deleteBroadcast);

export { userRouter as notificationUserRoutes, adminRouter as notificationAdminRoutes };
