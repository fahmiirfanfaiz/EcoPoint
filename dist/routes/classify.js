"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const classifier_1 = require("../classifier");
const router = (0, express_1.Router)();
// Store file in memory (buffer), not on disk
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
    fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error("Only JPEG, PNG, WEBP, or GIF images are allowed"));
        }
    },
});
/**
 * POST /api/classify
 *
 * Accepts multipart/form-data with a single field named "image".
 * Returns a JSON classification result.
 *
 * Example with fetch:
 *   const form = new FormData();
 *   form.append("image", file);
 *   const res = await fetch("/api/classify", { method: "POST", body: form });
 */
router.post("/", upload.single("image"), async (req, res) => {
    if (!req.file) {
        res.status(400).json({ success: false, error: "No image file provided. Use field name 'image'." });
        return;
    }
    try {
        const imageBase64 = req.file.buffer.toString("base64");
        const mimeType = req.file.mimetype;
        const result = await (0, classifier_1.classifyTrashImage)(imageBase64, mimeType);
        res.status(200).json({ success: true, data: result });
    }
    catch (err) {
        console.error("[classify] Error:", err);
        const message = err instanceof Error ? err.message : "Classification failed";
        res.status(500).json({ success: false, error: message });
    }
});
exports.default = router;
