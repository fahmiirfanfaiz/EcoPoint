import "dotenv/config";
import express from "express";
import cors from "cors";
import classifyRouter from "./routes/classify";

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from your friend's frontend origin
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "*",
    methods: ["POST"],
  })
);

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "trash-ai-wrapper" });
});

// AI classification endpoint
app.use("/api/classify", classifyRouter);

app.listen(PORT, () => {
  console.log(`Trash AI wrapper running on http://localhost:${PORT}`);
});
