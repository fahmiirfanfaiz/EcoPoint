import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase";

const AI_SERVICE_URL =
  process.env.AI_SERVICE_URL ??
  process.env.NEXT_PUBLIC_AI_SERVICE_URL ??
  "http://localhost:8000";
const AI_SERVICE_API_KEY = process.env.AI_SERVICE_API_KEY ?? "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const STORAGE_BUCKET = "AI-Service";

export const runtime = "nodejs";

const normalizeMimeType = (type: string | null | undefined): string => {
  if (!type) return "image/jpeg";
  return type.toLowerCase();
};

const extensionFromMime = (type: string): string => {
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("heic")) return "heic";
  return "jpg";
};

const normalizeAuthorizationHeader = (authorization: string): string => {
  const token = authorization
    .replace(/^Bearer\s+/i, "")
    .replace(/^"+|"+$/g, "")
    .trim();

  const extractedJwt =
    token.match(/[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/)?.[0] ?? token;

  return extractedJwt ? `Bearer ${extractedJwt}` : "";
};

const getUserIdFromAuthorization = (authorization: string): string => {
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Unauthorized");
  }

  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as { userId?: string; user_id?: string };

    return payload.userId ?? payload.user_id ?? "";
  } catch {
    throw new Error("Unauthorized");
  }
};

const isUnauthorizedError = (error: unknown): boolean => {
  return error instanceof Error && error.message === "Unauthorized";
};

const buildStorageObjectUrl = (objectPath: string): string => {
  if (!SUPABASE_URL) return objectPath;
  return `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${objectPath}`;
};

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

export async function POST(request: Request) {
  try {
    if (!isSupabaseAdminConfigured) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Supabase admin belum dikonfigurasi. Set SUPABASE_SECRET_KEY atau SUPABASE_SERVICE_ROLE_KEY di env frontend.",
        },
        { status: 500 },
      );
    }

    const authorization = normalizeAuthorizationHeader(
      request.headers.get("authorization") ?? "",
    );

    if (!authorization.startsWith("Bearer ")) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const userId = getUserIdFromAuthorization(authorization);

    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

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

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          message: "File gambar sebelum dibersihkan wajib diunggah",
        },
        { status: 400 },
      );
    }

    const classifyResult = payload?.result as
      | {
          category?: string;
        }
      | undefined;

    const inserted = await supabaseAdmin
      .from("waste_reports")
      .insert({
        user_id: userId,
        foto_url: "",
        kategori_user: classifyResult?.category ?? "residu yang dibungkus",
        kategori_ai: classifyResult?.category ?? null,
      })
      .select("report_id")
      .single();

    if (inserted.error || !inserted.data?.report_id) {
      return NextResponse.json(
        {
          ok: false,
          message: inserted.error?.message ?? "Failed to create waste report",
        },
        { status: 500 },
      );
    }

    const reportId = String(inserted.data.report_id);
    const mimeType = normalizeMimeType(file.type);
    const fileExt = extensionFromMime(mimeType);
    const beforePath = `reports/${userId}/${reportId}/before/original.${fileExt}`;
    const beforeBytes = Buffer.from(await file.arrayBuffer());

    const uploadBefore = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(beforePath, beforeBytes, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadBefore.error) {
      await supabaseAdmin
        .from("waste_reports")
        .delete()
        .eq("user_id", userId)
        .eq("report_id", Number(reportId));

      return NextResponse.json(
        {
          ok: false,
          message: uploadBefore.error.message,
        },
        { status: 500 },
      );
    }

    const beforeUrl = buildStorageObjectUrl(beforePath);
    const fotoUrlPayload = JSON.stringify({ before: beforeUrl });

    const updated = await supabaseAdmin
      .from("waste_reports")
      .update({ foto_url: fotoUrlPayload })
      .eq("user_id", userId)
      .eq("report_id", Number(reportId));

    if (updated.error) {
      return NextResponse.json(
        {
          ok: false,
          message: updated.error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ...payload,
        report_id: reportId,
        before_image_url: beforeUrl,
      },
      { status: response.status },
    );
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

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
