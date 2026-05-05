"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const classify_1 = __importDefault(require("./routes/classify"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Allow requests from your friend's frontend origin
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_ORIGIN || "*",
    methods: ["POST"],
}));
app.use(express_1.default.json());
// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "trash-ai-wrapper" });
});
// AI classification endpoint
app.use("/api/classify", classify_1.default);
app.listen(PORT, () => {
    console.log(`Trash AI wrapper running on http://localhost:${PORT}`);
});
