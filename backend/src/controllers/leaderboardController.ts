import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

/**
 * GET /api/leaderboard
 * Public endpoint — returns top users ranked by points.
 * Query params:
 *   - limit (default: 10, max: 50)
 *   - period ("mingguan" | "sepanjang-waktu", default: "sepanjang-waktu")
 */
export const getLeaderboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const period = req.query.period === "mingguan" ? "mingguan" : "sepanjang-waktu";

    const users = await prisma.users.findMany({
      where: {
        role: { not: "admin" }, // Exclude admins from leaderboard
      },
      select: {
        user_id: true,
        nama: true,
        nim: true,
        fakultas: true,
        total_poin: true,
        _count: {
          select: {
            user_badges: true,
            waste_reports: true,
          },
        },
      },
    });

    // Calculate lifetime points by adding back the points spent on redemptions
    const redemptions = await prisma.redemptions.groupBy({
      by: ["user_id"],
      _sum: { poin_digunakan: true },
    });

    const redemptionsMap = new Map<string, number>();
    for (const r of redemptions) {
      redemptionsMap.set(r.user_id, Number(r._sum.poin_digunakan || 0));
    }

    let leaderboardData = users.map((user) => {
      const lifetimePts = Number(user.total_poin) + (redemptionsMap.get(user.user_id) || 0);
      return {
        user_id: user.user_id,
        nama: user.nama,
        nim: user.nim,
        fakultas: user.fakultas || "-",
        total_poin: lifetimePts, // For leaderboard, 'total_poin' is actually lifetime points
        badges_count: user._count.user_badges,
        reports_count: user._count.waste_reports,
        points_to_sort: lifetimePts, // default to all-time (lifetime points)
      };
    });

    if (period === "mingguan") {
      const now = new Date();
      // Start of current week (Sunday)
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);

      // 1. Get weekly waste report points
      const weeklyReports = await prisma.waste_reports.groupBy({
        by: ["user_id"],
        where: {
          created_at: { gte: startOfWeek },
          status_validasi: "approved",
        },
        _sum: { poin_didapat: true },
      });

      const reportPointsMap = new Map<string, number>();
      for (const r of weeklyReports) {
        reportPointsMap.set(r.user_id, Number(r._sum.poin_didapat || 0));
      }

      // 2. Get weekly challenge points
      const weeklyChallenges = await prisma.user_daily_challenges.findMany({
        where: {
          claimed_at: { gte: startOfWeek },
          is_points_claimed: true,
        },
        include: {
          challenge_of_the_day: {
            include: { daily_challenges: true },
          },
        },
      });

      const challengePointsMap = new Map<string, number>();
      for (const c of weeklyChallenges) {
        const pts = Number(c.challenge_of_the_day.daily_challenges.poin_hadiah || 0);
        challengePointsMap.set(c.user_id, (challengePointsMap.get(c.user_id) || 0) + pts);
      }

      // 3. Update points_to_sort
      leaderboardData = leaderboardData.map((u) => {
        const weeklyPts =
          (reportPointsMap.get(u.user_id) || 0) +
          (challengePointsMap.get(u.user_id) || 0);
        return { ...u, points_to_sort: weeklyPts };
      });
    }

    // Sort by points_to_sort descending
    leaderboardData.sort((a, b) => b.points_to_sort - a.points_to_sort);

    // Apply limit and rank
    const leaderboard = leaderboardData.slice(0, limit).map((user, index) => ({
      rank: index + 1,
      user_id: user.user_id,
      nama: user.nama,
      nim: user.nim,
      fakultas: user.fakultas,
      total_poin: user.points_to_sort, // For the UI, we return the sorted points as total_poin
      badges_count: user.badges_count,
      reports_count: user.reports_count,
    }));

    res.status(200).json({ leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { getLeaderboard };
