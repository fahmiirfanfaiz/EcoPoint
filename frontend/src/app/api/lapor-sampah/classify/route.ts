import { NextResponse } from "next/server";

const DEFAULT_AI_SERVICE_URL =
  "https://ecopoint-ai-dqfhgxbbb6f8fafv.southeastasia-01.azurewebsites.net/";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? DEFAULT_AI_SERVICE_URL;
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY ?? "";

export const runtime = "nodejs";

const withTimeout = (url: string, init: RequestInit, timeoutMs = 20000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    ...init,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
};

const getAiServiceUrls = () => {
  const normalized = AI_SERVICE_URL.replace(/\/$/, "");
  const alternatives = new Set<string>([normalized]);

  if (normalized.includes("localhost")) {
    alternatives.add(normalized.replace("localhost", "127.0.0.1"));
  }

  if (normalized.includes("127.0.0.1")) {
    alternatives.add(normalized.replace("127.0.0.1", "localhost"));
  }

  return [...alternatives];
};

const postToAiService = async (path: string, body: FormData) => {
  let lastError: unknown = null;

  for (const baseUrl of getAiServiceUrls()) {
    try {
      const response = await withTimeout(`${baseUrl}${path}`, {
        method: "POST",
        headers: AI_SERVICE_API_KEY
          ? { "X-API-Key": AI_SERVICE_API_KEY }
          : undefined,
        body,
      });

      return response;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("AI service unavailable");
};

/**
 * POST /api/lapor-sampah/classify
 *
 * Pure proxy to the AI service /classify endpoint.
 * Does NOT create any DB records or upload to storage.
 * Returns the AI classification result to the client for preview.
 */
export async function POST(request: Request) {
  try {
    const incomingFormData = await request.formData();
    const description = incomingFormData.get("description");
    const file = incomingFormData.get("file");

    const forwardFormData = new FormData();

    if (typeof description === "string" && description.trim()) {
      forwardFormData.append("description", description.trim());
    }

    if (file instanceof File) {
      forwardFormData.append("file", file, file.name);
    }

    if (!forwardFormData.has("description") && !forwardFormData.has("file")) {
      return NextResponse.json(
        { ok: false, message: "Provide description or upload an image file" },
        { status: 400 },
      );
    }

    const response = await postToAiService("/classify", forwardFormData);

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          message:
            payload?.message ??
            payload?.detail ??
            payload?.result?.explanation ??
            "AI service classification failed",
        },
        { status: response.status },
      );
    }

    // Return only the AI result — no DB operations
    return NextResponse.json(
      {
        ok: true,
        result: payload?.result ?? null,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "AI service timeout. Pastikan service Python di port 8000 sedang berjalan.",
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? `Gagal memproses classify: ${error.message}`
            : "Gagal memproses classify",
      },
      { status: 500 },
    );
  }
}
