import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoute.js";
import dashboardRoutes from "./routes/dashboardRoute.js";
import leaderboardRoutes from "./routes/leaderboardRoute.js";
import rewardsRoutes from "./routes/rewardsRoute.js";
import rewardAdminRoutes from "./routes/rewardAdminRoute.js";
import badgeRoutes from "./routes/badgeRoute.js";
import dailyChallengeRoutes from "./routes/dailyChallengeRoute.js";
import levelRoutes from "./routes/levelRoute.js";
import usersRoutes from "./routes/usersRoute.js";
import wasteReportRoutes from "./routes/wasteReportRoute.js";
import { notificationUserRoutes, notificationAdminRoutes } from "./routes/notificationRoute.js";

const app = express();
const productionFrontendOrigin = "https://ecopoint-client.vercel.app";
const localOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
const allowedOrigins = [...localOrigins, productionFrontendOrigin];

// ── Middleware ──────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json());

// ── Lightweight public responses for deployment health checks ─
app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", service: "EcoPoint API" });
});

app.get(["/favicon.ico", "/favicon.png"], (_req, res) => {
  res.status(204).end();
});

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/admin/rewards", rewardAdminRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/daily-challenges", dailyChallengeRoutes);
app.use("/api/levels", levelRoutes);
app.use("/api/admin/users", usersRoutes);
app.use("/api/admin/waste-reports", wasteReportRoutes);
app.use("/api/notifications", notificationUserRoutes);
app.use("/api/admin/notifications", notificationAdminRoutes);

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
