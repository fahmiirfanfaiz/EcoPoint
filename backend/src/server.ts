import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoute.js";
import dashboardRoutes from "./routes/dashboardRoute.js";
import leaderboardRoutes from "./routes/leaderboardRoute.js";
import rewardsRoutes from "./routes/rewardsRoute.js";

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
  console.log(`   - GET    /api/health`);
});