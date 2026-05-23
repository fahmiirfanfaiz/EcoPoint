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

const withTimeout = (url: string, init: RequestInit, timeoutMs = 25000) => {
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

const extractBeforeUrl = (stored: string): string | null => {
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored) as { before?: string };
    if (parsed.before) return parsed.before;
  } catch {
    // Fallback to plain string URL stored in legacy rows.
  }

  return stored;
};

const extractObjectPathFromUrl = (urlValue: string): string | null => {
  const marker = `/storage/v1/object/${STORAGE_BUCKET}/`;
  const markerPublic = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

  const directIndex = urlValue.indexOf(marker);
  if (directIndex >= 0) {
    return urlValue.slice(directIndex + marker.length);
  }

  const publicIndex = urlValue.indexOf(markerPublic);
  if (publicIndex >= 0) {
    return urlValue.slice(publicIndex + markerPublic.length);
  }

  if (urlValue.startsWith("reports/")) {
    return urlValue;
  }

  return null;
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
    const reportIdRaw = incomingFormData.get("report_id");
    const location = incomingFormData.get("location");
    const afterImage = incomingFormData.get("after_image");

    if (!(afterImage instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "File after_image wajib diunggah" },
        { status: 400 },
      );
    }

    if (typeof reportIdRaw !== "string" || !reportIdRaw.trim()) {
      return NextResponse.json(
        { ok: false, message: "report_id wajib diisi" },
        { status: 400 },
      );
    }

    const reportId = Number(reportIdRaw);
    if (!Number.isFinite(reportId)) {
      return NextResponse.json(
        { ok: false, message: "report_id tidak valid" },
        { status: 400 },
      );
    }

    const reportQuery = await supabaseAdmin
      .from("waste_reports")
      .select("foto_url")
      .eq("user_id", userId)
      .eq("report_id", reportId)
      .single();

    if (reportQuery.error || !reportQuery.data) {
      return NextResponse.json(
        { ok: false, message: "Laporan tidak ditemukan" },
        { status: 404 },
      );
    }

    const beforeUrl = extractBeforeUrl(reportQuery.data.foto_url);
    if (!beforeUrl) {
      return NextResponse.json(
        { ok: false, message: "URL gambar sebelum tidak ditemukan" },
        { status: 400 },
      );
    }

    const beforePath = extractObjectPathFromUrl(beforeUrl);
    if (!beforePath) {
      return NextResponse.json(
        { ok: false, message: "Path gambar sebelum tidak valid" },
        { status: 400 },
      );
    }

    const beforeDownload = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .download(beforePath);

    if (beforeDownload.error || !beforeDownload.data) {
      return NextResponse.json(
        {
          ok: false,
          message:
            beforeDownload.error?.message ?? "Gagal membaca gambar before",
        },
        { status: 500 },
      );
    }

    const beforeMime = normalizeMimeType(beforeDownload.data.type);
    const afterMime = normalizeMimeType(afterImage.type);
    const afterExt = extensionFromMime(afterMime);
    const afterPath = `reports/${userId}/${reportId}/after/original.${afterExt}`;

    const afterBuffer = Buffer.from(await afterImage.arrayBuffer());
    const afterUpload = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(afterPath, afterBuffer, {
        contentType: afterMime,
        upsert: true,
      });

    if (afterUpload.error) {
      return NextResponse.json(
        { ok: false, message: afterUpload.error.message },
        { status: 500 },
      );
    }

    const verifyFormData = new FormData();
    verifyFormData.append(
      "before_image",
      new Blob([await beforeDownload.data.arrayBuffer()], { type: beforeMime }),
      "before.jpg",
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

    const verifyPayload = (await verifyResponse.json().catch(() => null)) as {
      message?: string;
      detail?: string;
      result?: {
        status?: string;
        confidence?: number;
        explanation?: string;
        reward_eligible?: boolean;
      };
    } | null;

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

    const afterUrl = buildStorageObjectUrl(afterPath);
    const statusValidasi = verifyPayload.result.reward_eligible
      ? "eligible"
      : "not_eligible";

    const updateReport = await supabaseAdmin
      .from("waste_reports")
      .update({
        foto_url: JSON.stringify({ before: beforeUrl, after: afterUrl }),
        status_validasi: statusValidasi,
      })
      .eq("user_id", userId)
      .eq("report_id", reportId);

    if (updateReport.error) {
      return NextResponse.json(
        { ok: false, message: updateReport.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        report_id: String(reportId),
        before_image_url: beforeUrl,
        after_image_url: afterUrl,
        status_validasi: statusValidasi,
        result: verifyPayload.result,
      },
      { status: 200 },
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
            ? `Gagal memproses verifikasi: ${error.message}`
            : "Gagal memproses verifikasi",
      },
      { status: 500 },
    );
  }
}
