import { GoogleGenerativeAI } from "@google/generative-ai";
import { ClassificationResult, TrashCategory } from "./types";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const CATEGORIES: TrashCategory[] = [
  "Plastic",
  "Glass",
  "Metal",
  "Paper/Cardboard",
  "Organic/Food",
  "E-Waste",
  "Hazardous",
  "General Waste",
];

const PROMPT = `You are a trash classification expert. Analyze this image and classify the waste shown.

Respond ONLY in this exact JSON format (no markdown, no extra text):
{
  "category": "<one of: ${CATEGORIES.join(", ")}>",
  "confidence": <number 0-100>,
  "item_detected": "<specific item name, e.g. 'plastic water bottle'>",
  "disposal_tip": "<one short, practical disposal tip under 20 words>",
  "top_alternatives": [
    { "category": "<category name>", "confidence": <number 0-100> },
    { "category": "<category name>", "confidence": <number 0-100> }
  ]
}

If no trash is clearly visible, use "General Waste" and explain in disposal_tip.`;

export async function classifyTrashImage(
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"
): Promise<ClassificationResult> {
  const message = await model.generateContent([
    {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType,
      },
    },
    PROMPT,
  ]);

  const textBlock = message.response.text();
  if (!textBlock) {
    throw new Error("No text response from Gemini");
  }

  const clean = textBlock.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean) as ClassificationResult;

  // Validate category is one of the known types
  if (!CATEGORIES.includes(parsed.category)) {
    parsed.category = "General Waste";
  }

  // Clamp confidence values 0-100
  parsed.confidence = Math.min(100, Math.max(0, parsed.confidence));
  parsed.top_alternatives = parsed.top_alternatives.map((alt) => ({
    ...alt,
    confidence: Math.min(100, Math.max(0, alt.confidence)),
  }));

  return parsed;
}
