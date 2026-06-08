import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";
import { getStartOfWeekWIB, getStartOfDayWIB } from "../lib/dateUtils.js";

/**
 * GET /api/dashboard
 * BFF endpoint — returns all data the profile/dashboard page needs in one request.
 * This reduces network round-trips and keeps the frontend from orchestrating multiple calls.
 */
export const getDashboard = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId!;

    // Run all queries in parallel for maximum efficiency
    const [
      user,
      reportsCount,
      badgesCount,
      weeklyReports,
      recentBadges,
      recentNotifications,
    ] = await Promise.all([
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
          profile_pic: true,
          is_edited: true,
          total_poin: true,
          created_at: true,
          last_seen_level: true,
          last_seen_badge_count: true,
          current_login_streak: true,
          last_login_date: true,
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
            gte: getStartOfWeekWIB(),
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
      const count = weeklyReports.filter(
        (r: (typeof weeklyReports)[number]) => {
          // Shift created_at to WIB by adding 7 hours
          const wibTime = new Date(r.created_at.getTime() + 7 * 60 * 60 * 1000);
          const reportDay = wibTime.getUTCDay();
          // JS getUTCDay(): 0=Sun, 1=Mon ... 6=Sat → remap to Mon=0 ... Sun=6
          const mappedDay = reportDay === 0 ? 6 : reportDay - 1;
          return mappedDay === index;
        },
      ).length;
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

    let currentLevel: {
      level_number: number;
      nama_level: string;
      syarat_poin: number;
    } | null = null;
    let nextLevel: {
      level_number: number;
      nama_level: string;
      syarat_poin: number;
    } | null = null;

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

    // ── Update Login Streak ──
    const now = new Date();
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const todayStr = wibNow.toISOString().split("T")[0]; // YYYY-MM-DD
    // Prisma @db.Date maps to UTC midnight. We store the WIB date string as UTC midnight.
    const todayDateToStore = new Date(`${todayStr}T00:00:00.000Z`);

    let streakUpdated = false;
    let newStreak: number = Number(user.current_login_streak) || 0;

    const lastLoginStr = user.last_login_date
      ? user.last_login_date.toISOString().split("T")[0]
      : null;

    if (!lastLoginStr) {
      // First login ever
      newStreak = 1;
      streakUpdated = true;
    } else if (lastLoginStr !== todayStr) {
      const yesterdayWib = new Date(wibNow.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayStr = yesterdayWib.toISOString().split("T")[0];

      if (lastLoginStr === yesterdayStr) {
        // Logged in yesterday
        newStreak += 1;
        streakUpdated = true;
      } else {
        // Missed a day
        newStreak = 1;
        streakUpdated = true;
      }
    }

    let displayStreak = streakUpdated ? newStreak : (Number(user.current_login_streak) || 0);
    let displayLastLogin: Date | null = streakUpdated 
      ? todayDateToStore 
      : (user.last_login_date ? new Date(user.last_login_date) : null);

    if (streakUpdated) {
      await prisma.users.update({
        where: { user_id: userId },
        data: {
          current_login_streak: newStreak,
          last_login_date: todayDateToStore,
        },
      });

      // Also trigger daily challenge for login_streak
      const reqSimulated = { ...req, body: { action: "login_streak" } } as any;
      const resSimulated = { status: () => ({ json: () => {} }) } as any;
      import("./dailyChallengeController.js").then(({ trackAction }) => {
        trackAction(reqSimulated, resSimulated).catch(console.error);
      });
    }

    let admin_stats = undefined;
    if (user.role.replace(/['"]+/g, "").toLowerCase() === "admin") {
      const [total_users, active_challenges, reports_resolved, points_agg] =
        await Promise.all([
          prisma.users.count(),
          prisma.daily_challenges.count({ where: { is_active: true } }),
          prisma.waste_reports.count({
            where: { status_validasi: "approved" },
          }),
          prisma.waste_reports.aggregate({
            where: { status_validasi: "approved" },
            _sum: { poin_didapat: true },
          }),
        ]);
      admin_stats = {
        total_users,
        active_challenges,
        reports_resolved,
        points_distributed: Number(points_agg._sum.poin_didapat || 0),
      };
    }

    res.status(200).json({
      user: {
        ...user,
        fakultas: user.fakultas || "",
        profile_pic: Number(user.profile_pic),
        is_edited: user.is_edited,
        total_poin: Number(user.total_poin),
        last_seen_level: user.last_seen_level,
        last_seen_badge_count: user.last_seen_badge_count,
        current_login_streak: displayStreak,
        last_login_date: displayLastLogin,
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
      recent_achievements: recentBadges.map(
        (ub: (typeof recentBadges)[number]) => ({
          badges_id: ub.badges.badges_id,
          nama_badge: ub.badges.nama_badge,
          deskripsi: ub.badges.deskripsi,
          syarat_poin: Number(ub.badges.syarat_poin),
          earned_at: ub.earned_at,
        }),
      ),
      recent_updates: recentNotifications,
      admin_stats,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/dashboard/seen
 * Updates the last seen level and badge count for the user.
 */
export const updateSeenAchievements = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { seen_level, seen_badge_count } = req.body;

    await prisma.users.update({
      where: { user_id: userId },
      data: {
        ...(seen_level !== undefined && {
          last_seen_level: Number(seen_level),
        }),
        ...(seen_badge_count !== undefined && {
          last_seen_badge_count: Number(seen_badge_count),
        }),
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("updateSeenAchievements error:", error);
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

export default { getDashboard, updateSeenAchievements };
