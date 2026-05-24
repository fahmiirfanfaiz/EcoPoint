import { NextResponse } from "next/server";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase";

const STORAGE_BUCKET = "AI-Service";

export const runtime = "nodejs";

/**
 * GET /api/lapor-sampah/image?path=reports/userId/reportId/before/original.jpg
 *
 * Generates a signed URL for a private Supabase Storage image.
 * This allows the browser to load images from private buckets
 * without exposing the secret key.
 */
export async function GET(request: Request) {
  try {
    if (!isSupabaseAdminConfigured) {
      return NextResponse.json(
        { ok: false, message: "Supabase admin not configured" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const objectPath = searchParams.get("path");

    if (!objectPath) {
      return NextResponse.json(
        { ok: false, message: "Missing 'path' query parameter" },
        { status: 400 },
      );
    }

    // Generate a signed URL valid for 1 hour (3600 seconds)
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(objectPath, 3600);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { ok: false, message: error?.message ?? "Failed to generate signed URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      signedUrl: data.signedUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "Failed to generate signed URL",
      },
      { status: 500 },
    );
  }
}
