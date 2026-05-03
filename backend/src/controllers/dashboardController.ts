import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";

/**
 * GET /api/dashboard
 * BFF endpoint — returns all data the profile/dashboard page needs in one request.
 * This reduces network round-trips and keeps the frontend from orchestrating multiple calls.
 */
export const getDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    // Run all queries in parallel for maximum efficiency
    const [user, reportsCount, badgesCount, weeklyReports, recentBadges, recentNotifications] =
      await Promise.all([
        // 1. User profile
        prisma.users.findUnique({
          where: { user_id: userId },
          select: {
            user_id: true,
            nama: true,
            nim: true,
            email: true,
            role: true,
            fakultas: true,
            total_poin: true,
            created_at: true,
          },
        }),

        // 2. Total reports submitted
        prisma.waste_reports.count({
          where: { user_id: userId },
        }),

        // 3. Total badges earned
        prisma.user_badges.count({
          where: { user_id: userId },
        }),

        // 4. Reports from last 7 days (for weekly activity chart)
        prisma.waste_reports.findMany({
          where: {
            user_id: userId,
            created_at: {
              gte: getStartOfWeek(),
            },
          },
          select: {
            created_at: true,
          },
          orderBy: { created_at: "asc" },
        }),

        // 5. Recent badges (latest 4)
        prisma.user_badges.findMany({
          where: { user_id: userId },
          include: {
            badges: {
              select: {
                badges_id: true,
                nama_badge: true,
                deskripsi: true,
                syarat_poin: true,
              },
            },
          },
          orderBy: { earned_at: "desc" },
          take: 4,
        }),

        // 6. Recent notifications (latest 5)
        prisma.notifications.findMany({
          where: { user_id: userId },
          select: {
            notifications_id: true,
            pesan: true,
            is_read: true,
            created_at: true,
          },
          orderBy: { created_at: "desc" },
          take: 5,
        }),
      ]);

    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    // Aggregate weekly activity by day of week (Mon=0 ... Sun=6)
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyActivity = dayNames.map((day, index) => {
      const count = weeklyReports.filter((r) => {
        const reportDay = r.created_at.getDay();
        // JS getDay(): 0=Sun, 1=Mon ... 6=Sat → remap to Mon=0 ... Sun=6
        const mappedDay = reportDay === 0 ? 6 : reportDay - 1;
        return mappedDay === index;
      }).length;
      return { day, count };
    });

    // ── Compute lifetime points (total earned, ignoring redemptions) ──
    const redemptionAgg = await prisma.redemptions.aggregate({
      where: { user_id: userId },
      _sum: { poin_digunakan: true },
    });
    const pointsSpent = Number(redemptionAgg._sum.poin_digunakan || 0);
    const lifetimePoints = Number(user.total_poin) + pointsSpent;

    // ── Resolve current level ──
    const allLevels = await prisma.levels.findMany({
      orderBy: { syarat_poin: "asc" },
    });

    let currentLevel: { level_number: number; nama_level: string; syarat_poin: number } | null = null;
    let nextLevel: { level_number: number; nama_level: string; syarat_poin: number } | null = null;

    for (let i = 0; i < allLevels.length; i++) {
      const lvl = allLevels[i];
      if (lifetimePoints >= Number(lvl.syarat_poin)) {
        currentLevel = {
          level_number: lvl.level_number,
          nama_level: lvl.nama_level,
          syarat_poin: Number(lvl.syarat_poin),
        };
        // Next level is the one after this
        if (i + 1 < allLevels.length) {
          const nxt = allLevels[i + 1];
          nextLevel = {
            level_number: nxt.level_number,
            nama_level: nxt.nama_level,
            syarat_poin: Number(nxt.syarat_poin),
          };
        } else {
          nextLevel = null; // Max level reached
        }
      }
    }

    res.status(200).json({
      user: {
        ...user,
        fakultas: user.fakultas || "",
        total_poin: Number(user.total_poin),
      },
      stats: {
        total_poin: Number(user.total_poin),
        lifetime_poin: lifetimePoints,
        reports_submitted: reportsCount,
        badges_earned: badgesCount,
      },
      level: {
        current: currentLevel,
        next: nextLevel,
        lifetime_poin: lifetimePoints,
      },
      weekly_activity: weeklyActivity,
      recent_achievements: recentBadges.map((ub) => ({
        badges_id: ub.badges.badges_id,
        nama_badge: ub.badges.nama_badge,
        deskripsi: ub.badges.deskripsi,
        syarat_poin: Number(ub.badges.syarat_poin),
        earned_at: ub.earned_at,
      })),
      recent_updates: recentNotifications,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Returns the start of the current week (Monday 00:00:00).
 */
function getStartOfWeek(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const diff = day === 0 ? 6 : day - 1; // Days since Monday
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export default { getDashboard };
