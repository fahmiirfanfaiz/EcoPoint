import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const BACKEND_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api-ecopoint.vercel.app/api";
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

/**
 * POST /api/lapor-sampah/submit
 *
 * Final submission of a waste report. This is the ONLY endpoint that creates
 * a DB record and uploads images to Supabase Storage.
 *
 * Body (multipart):
 *  - before_image: File (required)
 *  - after_image: File (required)
 *  - kategori_user: string (user-confirmed category)
 *  - kategori_ai: string (original AI classification)
 */
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

    const formData = await request.formData();
    const beforeImage = formData.get("before_image");
    const afterImage = formData.get("after_image");
    const kategoriUser = formData.get("kategori_user");
    const kategoriAi = formData.get("kategori_ai");
    const classifyResultRaw = formData.get("classify_result");
    const verifyResultRaw = formData.get("verify_result");

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

    const kategoriUserStr =
      typeof kategoriUser === "string" && kategoriUser.trim()
        ? kategoriUser.trim()
        : "residu yang dibungkus";

    const kategoriAiStr =
      typeof kategoriAi === "string" && kategoriAi.trim()
        ? kategoriAi.trim()
        : null;

    // 1. Create waste_report record with status pending
    const inserted = await supabaseAdmin
      .from("waste_reports")
      .insert({
        user_id: userId,
        foto_url: "",
        kategori_user: kategoriUserStr,
        kategori_ai: kategoriAiStr,
        status_validasi: "pending",
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

    // 2. Upload before image
    const beforeMime = normalizeMimeType(beforeImage.type);
    const beforeExt = extensionFromMime(beforeMime);
    const beforePath = `reports/${userId}/${reportId}/before/original.${beforeExt}`;
    const beforeBytes = Buffer.from(await beforeImage.arrayBuffer());

    const uploadBefore = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(beforePath, beforeBytes, {
        contentType: beforeMime,
        upsert: true,
      });

    if (uploadBefore.error) {
      // Cleanup: delete the report row
      await supabaseAdmin
        .from("waste_reports")
        .delete()
        .eq("user_id", userId)
        .eq("report_id", Number(reportId));

      return NextResponse.json(
        { ok: false, message: uploadBefore.error.message },
        { status: 500 },
      );
    }

    // 3. Upload after image
    const afterMime = normalizeMimeType(afterImage.type);
    const afterExt = extensionFromMime(afterMime);
    const afterPath = `reports/${userId}/${reportId}/after/original.${afterExt}`;
    const afterBytes = Buffer.from(await afterImage.arrayBuffer());

    const uploadAfter = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(afterPath, afterBytes, {
        contentType: afterMime,
        upsert: true,
      });

    if (uploadAfter.error) {
      // Cleanup: delete storage + report row
      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([beforePath]);
      await supabaseAdmin
        .from("waste_reports")
        .delete()
        .eq("user_id", userId)
        .eq("report_id", Number(reportId));

      return NextResponse.json(
        { ok: false, message: uploadAfter.error.message },
        { status: 500 },
      );
    }

    // 4. Update the report with image URLs + AI analysis results
    const beforeUrl = buildStorageObjectUrl(beforePath);
    const afterUrl = buildStorageObjectUrl(afterPath);

    // Parse AI analysis results to include in foto_url JSON
    let classifyResult = null;
    let verifyResult = null;
    try {
      if (typeof classifyResultRaw === "string" && classifyResultRaw) {
        classifyResult = JSON.parse(classifyResultRaw);
      }
    } catch {
      /* ignore */
    }
    try {
      if (typeof verifyResultRaw === "string" && verifyResultRaw) {
        verifyResult = JSON.parse(verifyResultRaw);
      }
    } catch {
      /* ignore */
    }

    const fotoData: Record<string, unknown> = {
      before: beforeUrl,
      after: afterUrl,
    };
    if (classifyResult) fotoData.classify_result = classifyResult;
    if (verifyResult) fotoData.verify_result = verifyResult;

    const updated = await supabaseAdmin
      .from("waste_reports")
      .update({
        foto_url: JSON.stringify(fotoData),
      })
      .eq("user_id", userId)
      .eq("report_id", Number(reportId));

    if (updated.error) {
      return NextResponse.json(
        { ok: false, message: updated.error.message },
        { status: 500 },
      );
    }

    // Call backend to track daily challenge progress for "waste_report"
    try {
      await fetch(`${BACKEND_API_BASE_URL}/daily-challenges/track-action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authorization.replace(/^Bearer\s+/i, "").trim()}`,
        },
        body: JSON.stringify({ action: "waste_report" }),
      });
    } catch (e) {
      console.error("Failed to track waste_report action:", e);
      // Non-fatal, continue
    }

    // Create notification for the user
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: userId,
        pesan: `Laporan sampah (${kategoriUserStr}) berhasil dikirim! Menunggu validasi admin.`,
        tipe: "system",
      });
    } catch (e) {
      console.error("Failed to create notification:", e);
      // Non-fatal, continue
    }

    return NextResponse.json(
      {
        ok: true,
        report_id: reportId,
        message: "Laporan berhasil dikirim! Menunggu validasi admin.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (isUnauthorizedError(error)) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? `Gagal mengirim laporan: ${error.message}`
            : "Gagal mengirim laporan",
      },
      { status: 500 },
    );
  }
}
