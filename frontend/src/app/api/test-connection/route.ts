import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!url || url === "your-supabase-project-url") {
      return NextResponse.json({
        success: false,
        message: "NEXT_PUBLIC_SUPABASE_URL belum dikonfigurasi",
        details: "Isi URL di file .env",
      });
    }

    if (!secretKey || secretKey === "your-supabase-service-role-secret-key") {
      return NextResponse.json({
        success: false,
        message: "Secret key belum dikonfigurasi",
        details: "Isi SUPABASE_SECRET_KEY di file .env",
      });
    }

    const startTime = performance.now();
    const { error } = await supabaseAdmin
      .from("_test_connection")
      .select("*")
      .limit(1);
    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    if (error && error.message.includes("Invalid API key")) {
      return NextResponse.json({
        success: false,
        message: "Secret key tidak valid",
        details: error.message,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Koneksi berhasil via Secret Key! (${responseTime}ms)`,
      details: `Terhubung ke: ${url} (RLS bypassed)`,
      timestamp: new Date().toLocaleString("id-ID"),
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: "Koneksi gagal",
      details: err instanceof Error ? err.message : "Unknown error",
    });
  }
}
