import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoute.js";
import dashboardRoutes from "./routes/dashboardRoute.js";
import leaderboardRoutes from "./routes/leaderboardRoute.js";
import rewardsRoutes from "./routes/rewardsRoute.js";
import badgeRoutes from "./routes/badgeRoute.js";
import dailyChallengeRoutes from "./routes/dailyChallengeRoute.js";
import levelRoutes from "./routes/levelRoute.js";
import usersRoutes from "./routes/usersRoute.js";
import wasteReportRoutes from "./routes/wasteReportRoute.js";

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  }),
);
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/daily-challenges", dailyChallengeRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/admin/users", usersRoutes);
app.use("/api/admin/waste-reports", wasteReportRoutes);

// ── Health check ───────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Global error handler ───────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  },
);

export default app;
