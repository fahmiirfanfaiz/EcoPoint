import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

/**
 * GET /api/leaderboard
 * Public endpoint — returns top users ranked by total_poin.
 * Query params:
 *   - limit (default: 10, max: 50)
 *   - period ("weekly" | "all-time", default: "all-time")
 */
export const getLeaderboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);

    const users = await prisma.users.findMany({
      where: {
        role: { not: "admin" }, // Exclude admins from leaderboard
      },
      select: {
        user_id: true,
        nama: true,
        nim: true,
        total_poin: true,
        _count: {
          select: {
            user_badges: true,
            waste_reports: true,
          },
        },
      },
      orderBy: { total_poin: "desc" },
      take: limit,
    });

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      user_id: user.user_id,
      nama: user.nama,
      nim: user.nim,
      total_poin: Number(user.total_poin),
      badges_count: user._count.user_badges,
      reports_count: user._count.waste_reports,
    }));

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { getLeaderboard };
