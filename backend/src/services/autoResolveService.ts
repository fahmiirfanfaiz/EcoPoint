import { prisma } from "../lib/prisma.js";
import { createNotification } from "./notificationService.js";

const FALLBACK_HOURS = 24;

interface VerifyResult {
  status: string;
  confidence: number;
  explanation: string;
  reward_eligible: boolean;
}

interface FotoData {
  before?: string;
  after?: string;
  classify_result?: {
    category: string;
    confidence: number;
    explanation: string;
  };
  verify_result?: VerifyResult;
}

/**
 * Parses the foto_url JSON field of a waste_report.
 * Returns an empty object if the field is not valid JSON.
 */
function parseFotoData(fotoUrl: string): FotoData {
  try {
    return JSON.parse(fotoUrl) as FotoData;
  } catch {
    return {};
  }
}

/**
 * Auto-resolves a single pending report if it has been pending for more than
 * FALLBACK_HOURS without admin action.
 *
 * Resolution logic:
 *   - verify_result.reward_eligible = true  → status: "auto_approved", poin added
 *   - verify_result.reward_eligible = false → status: "auto_rejected", no poin
 *   - No verify_result present              → status: "auto_rejected" (cannot confirm cleanup)
 *
 * Returns the new status string, or null if the report was not eligible for resolution.
 */
export async function resolveSingleReportIfExpired(
  reportId: bigint | number,
  userId: string,
): Promise<string | null> {
  const reportIdBigInt = BigInt(reportId);

  const report = await prisma.waste_reports.findFirst({
    where: {
      report_id: reportIdBigInt,
      user_id: userId,
    },
  });

  if (!report) return null;

  // Only act on pending reports
  const normalizedStatus = report.status_validasi.replace(/'/g, "").trim();
  if (normalizedStatus !== "pending") return null;

  // Check if 24 hours have elapsed
  const ageMs = Date.now() - new Date(report.created_at).getTime();
  const ageLimitMs = FALLBACK_HOURS * 60 * 60 * 1000;
  if (ageMs < ageLimitMs) return null;

  return applyAutoResolve(report.report_id, report.user_id, report.foto_url, Number(report.poin_didapat));
}

/**
 * Batch-resolves ALL pending reports that have exceeded the FALLBACK_HOURS limit.
 * Intended to be called by a cron/scheduled endpoint.
 *
 * Returns a summary: { resolved: number; approved: number; rejected: number }
 */
export async function resolveExpiredReports(): Promise<{
  resolved: number;
  approved: number;
  rejected: number;
}> {
  const cutoff = new Date(Date.now() - FALLBACK_HOURS * 60 * 60 * 1000);

  const expiredReports = await prisma.waste_reports.findMany({
    where: {
      status_validasi: "pending",
      created_at: { lt: cutoff },
    },
    select: {
      report_id: true,
      user_id: true,
      foto_url: true,
      poin_didapat: true,
    },
  });

  let approved = 0;
  let rejected = 0;

  for (const report of expiredReports) {
    try {
      const newStatus = await applyAutoResolve(
        report.report_id,
        report.user_id,
        report.foto_url,
        Number(report.poin_didapat),
      );

      if (newStatus === "auto_approved") approved++;
      else if (newStatus === "auto_rejected") rejected++;
    } catch (err) {
      console.error(
        `autoResolveService: error resolving report ${report.report_id}:`,
        err,
      );
    }
  }

  return { resolved: approved + rejected, approved, rejected };
}

/**
 * Core resolution logic. Determines outcome from AI verify_result and
 * writes the DB update + notification atomically.
 *
 * @returns The final status string applied to the report.
 */
async function applyAutoResolve(
  reportId: bigint,
  userId: string,
  fotoUrl: string,
  defaultPoin: number,
): Promise<string> {
  const fotoData = parseFotoData(fotoUrl);
  const rewardEligible = fotoData.verify_result?.reward_eligible ?? false;

  if (rewardEligible) {
    // Auto-approve: add points
    await prisma.$transaction([
      prisma.waste_reports.update({
        where: {
          report_id_user_id: { report_id: reportId, user_id: userId },
        },
        data: {
          status_validasi: "auto_approved",
          poin_didapat: defaultPoin,
        },
      }),
      prisma.users.update({
        where: { user_id: userId },
        data: { total_poin: { increment: defaultPoin } },
      }),
    ]);

    // Trigger achievement evaluation (non-blocking)
    import("./achievementService.js")
      .then(({ evaluateUserAchievements }) => {
        evaluateUserAchievements(userId).catch(console.error);
      })
      .catch(console.error);

    await createNotification(
      userId,
      `Laporan sampah kamu telah diverifikasi secara otomatis oleh AI (admin belum merespons dalam 24 jam). +${defaultPoin} poin ditambahkan! ✅`,
    );

    return "auto_approved";
  } else {
    // Auto-reject: no points
    await prisma.waste_reports.update({
      where: {
        report_id_user_id: { report_id: reportId, user_id: userId },
      },
      data: { status_validasi: "auto_rejected" },
    });

    await createNotification(
      userId,
      `Laporan sampah kamu tidak dapat diverifikasi secara otomatis oleh AI (admin belum merespons dalam 24 jam). Laporan ditolak karena bukti kebersihan tidak memadai. ❌`,
    );

    return "auto_rejected";
  }
}
