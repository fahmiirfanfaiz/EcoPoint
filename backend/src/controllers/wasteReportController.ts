import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";

/**
 * GET /api/admin/waste-reports
 * List waste reports, optionally filtered by status.
 * Query params: ?status=pending|approved|rejected (default: all)
 */
export const listWasteReports = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const statusFilter = req.query.status as string | undefined;

    const where: Record<string, unknown> = {};
    if (statusFilter) {
      where.status_validasi = statusFilter;
    }

    const reports = await prisma.waste_reports.findMany({
      where,
      include: {
        users: {
          select: {
            user_id: true,
            nama: true,
            nim: true,
            email: true,
            fakultas: true,
            profile_pic: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const formatted = reports.map((r: (typeof reports)[number]) => ({
      report_id: Number(r.report_id),
      user_id: r.user_id,
      foto_url: r.foto_url,
      kategori_user: r.kategori_user,
      kategori_ai: r.kategori_ai,
      status_validasi: r.status_validasi,
      poin_didapat: Number(r.poin_didapat),
      created_at: r.created_at,
      user: {
        ...r.users,
        profile_pic: Number(r.users.profile_pic),
      },
    }));

    res.status(200).json({ reports: formatted });
  } catch (error) {
    console.error("listWasteReports error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/admin/waste-reports/:id
 * Get a single waste report by report_id.
 */
export const getReportDetail = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const reportId = Number(req.params.id);
    if (!Number.isFinite(reportId)) {
      res.status(400).json({ message: "report_id tidak valid" });
      return;
    }

    const report = await prisma.waste_reports.findFirst({
      where: { report_id: reportId },
      include: {
        users: {
          select: {
            user_id: true,
            nama: true,
            nim: true,
            email: true,
            fakultas: true,
            profile_pic: true,
          },
        },
      },
    });

    if (!report) {
      res.status(404).json({ message: "Laporan tidak ditemukan" });
      return;
    }

    res.status(200).json({
      report: {
        report_id: Number(report.report_id),
        user_id: report.user_id,
        foto_url: report.foto_url,
        kategori_user: report.kategori_user,
        kategori_ai: report.kategori_ai,
        status_validasi: report.status_validasi,
        poin_didapat: Number(report.poin_didapat),
        created_at: report.created_at,
        user: {
          ...report.users,
          profile_pic: Number(report.users.profile_pic),
        },
      },
    });
  } catch (error) {
    console.error("getReportDetail error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/admin/waste-reports/:id/approve
 * Approve a pending report and add points to the user.
 * Body (optional): { poin?: number } — override the default poin_didapat
 */
export const approveReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const reportId = Number(req.params.id);
    if (!Number.isFinite(reportId)) {
      res.status(400).json({ message: "report_id tidak valid" });
      return;
    }

    // Find the report
    const report = await prisma.waste_reports.findFirst({
      where: { report_id: reportId },
    });

    if (!report) {
      res.status(404).json({ message: "Laporan tidak ditemukan" });
      return;
    }

    if (report.status_validasi === "approved") {
      res.status(400).json({ message: "Laporan sudah diapprove sebelumnya" });
      return;
    }

    // Admin can override the points amount
    const customPoin = req.body?.poin;
    const pointsToAdd =
      typeof customPoin === "number" && Number.isFinite(customPoin) && customPoin >= 0
        ? customPoin
        : Number(report.poin_didapat);

    // Update report status + poin, and add points to user in a transaction
    await prisma.$transaction([
      prisma.waste_reports.update({
        where: {
          report_id_user_id: {
            report_id: report.report_id,
            user_id: report.user_id,
          },
        },
        data: {
          status_validasi: "approved",
          poin_didapat: pointsToAdd,
        },
      }),
      prisma.users.update({
        where: { user_id: report.user_id },
        data: {
          total_poin: { increment: pointsToAdd },
        },
      }),
    ]);

    // Check for new achievements (badges) for the user
    import("../services/achievementService.js").then(({ evaluateUserAchievements }) => {
      evaluateUserAchievements(report.user_id).catch(console.error);
    });

    res.status(200).json({
      success: true,
      message: `Laporan diapprove. +${pointsToAdd} poin ditambahkan ke user.`,
      poin_didapat: pointsToAdd,
    });
  } catch (error) {
    console.error("approveReport error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/admin/waste-reports/:id/reject
 * Reject a pending report. No points are added.
 */
export const rejectReport = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const reportId = Number(req.params.id);
    if (!Number.isFinite(reportId)) {
      res.status(400).json({ message: "report_id tidak valid" });
      return;
    }

    const report = await prisma.waste_reports.findFirst({
      where: { report_id: reportId },
    });

    if (!report) {
      res.status(404).json({ message: "Laporan tidak ditemukan" });
      return;
    }

    if (report.status_validasi === "rejected") {
      res.status(400).json({ message: "Laporan sudah direject sebelumnya" });
      return;
    }

    await prisma.waste_reports.update({
      where: {
        report_id_user_id: {
          report_id: report.report_id,
          user_id: report.user_id,
        },
      },
      data: { status_validasi: "rejected" },
    });

    res.status(200).json({
      success: true,
      message: "Laporan ditolak.",
    });
  } catch (error) {
    console.error("rejectReport error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/admin/waste-reports/my-reports
 * Get all reports for the currently logged-in user.
 */
export const getMyReports = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    const reports = await prisma.waste_reports.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });

    const formatted = reports.map((r: (typeof reports)[number]) => ({
      report_id: Number(r.report_id),
      user_id: r.user_id,
      foto_url: r.foto_url,
      kategori_user: r.kategori_user,
      kategori_ai: r.kategori_ai,
      status_validasi: r.status_validasi,
      poin_didapat: Number(r.poin_didapat),
      created_at: r.created_at,
    }));

    res.status(200).json({ reports: formatted });
  } catch (error) {
    console.error("getMyReports error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  listWasteReports,
  getReportDetail,
  approveReport,
  rejectReport,
  getMyReports,
};
