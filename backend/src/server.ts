import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoute.js";
import dashboardRoutes from "./routes/dashboardRoute.js";
import leaderboardRoutes from "./routes/leaderboardRoute.js";
import rewardsRoutes from "./routes/rewardsRoute.js";
import badgeRoutes from "./routes/badgeRoute.js";
import dailyChallengeRoutes from "./routes/dailyChallengeRoute.js";

const app = express();
const port = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/daily-challenges", dailyChallengeRoutes);

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
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
);

// ── Start ──────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🌿 EcoPoint API running on http://localhost:${port}`);
  console.log(`   Routes:`);
  console.log(`   - POST   /api/auth/register`);
  console.log(`   - POST   /api/auth/login`);
  console.log(`   - GET    /api/auth/me`);
  console.log(`   - GET    /api/dashboard`);
  console.log(`   - GET    /api/leaderboard`);
  console.log(`   - GET    /api/rewards`);
  console.log(`   - POST   /api/rewards/redeem`);
  console.log(`   - GET    /api/rewards/history`);
  console.log(`   - GET    /api/badges`);
  console.log(`   - GET    /api/badges/admin/all`);
  console.log(`   - POST   /api/badges/admin`);
  console.log(`   - PUT    /api/badges/admin/:id`);
  console.log(`   - DELETE /api/badges/admin/:id`);
  console.log(`   - GET    /api/daily-challenges/today`);
  console.log(`   - POST   /api/daily-challenges/progress`);
  console.log(`   - POST   /api/daily-challenges/claim`);
  console.log(`   - GET    /api/daily-challenges/admin/all`);
  console.log(`   - GET    /api/daily-challenges/admin/today`);
  console.log(`   - POST   /api/daily-challenges/admin`);
  console.log(`   - PUT    /api/daily-challenges/admin/:id`);
  console.log(`   - DELETE /api/daily-challenges/admin/:id`);
  console.log(`   - GET    /api/health`);
});