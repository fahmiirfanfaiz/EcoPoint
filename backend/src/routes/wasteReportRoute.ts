import express from "express";
import wasteReportController from "../controllers/wasteReportController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// User route — get own reports
router.get("/my-reports", authMiddleware, wasteReportController.getMyReports);

// All routes below require auth + admin
router.get("/", authMiddleware, adminMiddleware, wasteReportController.listWasteReports);
router.get("/:id", authMiddleware, adminMiddleware, wasteReportController.getReportDetail);
router.post("/:id/approve", authMiddleware, adminMiddleware, wasteReportController.approveReport);
router.post("/:id/reject", authMiddleware, adminMiddleware, wasteReportController.rejectReport);

export default router;
