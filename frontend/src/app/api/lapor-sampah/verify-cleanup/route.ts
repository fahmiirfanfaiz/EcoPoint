import { NextResponse } from "next/server";

const DEFAULT_AI_SERVICE_URL =
  "https://ecopoint-ai-dqfhgxbbb6f8fafv.southeastasia-01.azurewebsites.net/";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? DEFAULT_AI_SERVICE_URL;
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY ?? "";

export const runtime = "nodejs";

const withTimeout = (url: string, init: RequestInit, timeoutMs = 60000) => {
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
 * POST /api/lapor-sampah/verify-cleanup
 *
 * Pure proxy to the AI service /verify-cleanup endpoint.
 * Does NOT create any DB records or upload to storage.
 * Returns the AI verification result to the client for preview.
 */
export async function POST(request: Request) {
  try {
    const incomingFormData = await request.formData();
    const beforeImage = incomingFormData.get("before_image");
    const afterImage = incomingFormData.get("after_image");
    const location = incomingFormData.get("location");

    if (!(beforeImage instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "File before_image wajib diunggah" },
        { status: 400 },
      );
    }

    if (!(afterImage instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "File after_image wajib diunggah" },
        { status: 400 },
      );
    }

    const verifyFormData = new FormData();
    verifyFormData.append(
      "before_image",
      beforeImage,
      beforeImage.name || "before.jpg",
    );
    verifyFormData.append(
      "after_image",
      afterImage,
      afterImage.name || "after.jpg",
    );

    if (typeof location === "string" && location.trim()) {
      verifyFormData.append("location", location.trim());
    }

    const verifyResponse = await postToAiService(
      "/verify-cleanup",
      verifyFormData,
    );

    const verifyPayload = await verifyResponse.json().catch(() => null);

    if (!verifyResponse.ok || !verifyPayload?.result) {
      return NextResponse.json(
        {
          ok: false,
          message:
            verifyPayload?.message ??
            verifyPayload?.detail ??
            "AI service verification failed",
        },
        { status: verifyResponse.status || 500 },
      );
    }

    // Return only the AI result — no DB operations
    return NextResponse.json(
      {
        ok: true,
        result: verifyPayload.result,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return NextResponse.json(
        {
          ok: false,
          message:
            "AI service timeout. Service AI mungkin sedang cold-start atau terlalu sibuk, silakan coba lagi dalam beberapa detik.",
        },
        { status: 504 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? `Gagal memproses verifikasi: ${error.message}`
            : "Gagal memproses verifikasi",
      },
      { status: 500 },
    );
  }
}
