import { prisma } from "../lib/prisma.js";

/**
 * Service to evaluate and award achievements for a user based on dynamic rules.
 * This should be called whenever a user's stats change (e.g. after a report is verified).
 */
export const evaluateUserAchievements = async (userId: string) => {
  try {
    // 1. Get user's current stats
    const user = await prisma.users.findUnique({
      where: { user_id: userId },
      select: {
        total_poin: true,
      },
    });

    if (!user) return;

    // Get total approved reports
    const totalReports = await prisma.waste_reports.count({
      where: {
        user_id: userId,
        status_validasi: "verified", // Assume badges count verified reports
      },
    });

    // 2. Identify earned badges
    const earnedBadges = await prisma.user_badges.findMany({
      where: { user_id: userId },
      select: { badges_id: true },
    });
    const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badges_id));

    // 3. Get all active badges the user hasn't earned yet
    const allBadges = await prisma.badges.findMany();
    const availableBadges = allBadges.filter(
      (b) => !earnedBadgeIds.has(b.badges_id)
    );

    // 4. Evaluate rules
    const newAchievements: any[] = [];

    for (const badge of availableBadges) {
      let isEligible = false;
      const nilaiSyarat = Number(badge.nilai_syarat);

      // We remove the single quotes since Supabase default might have saved it as "'TOTAL_POIN'"
      const ruleType = badge.jenis_syarat.replace(/'/g, ""); 

      switch (ruleType) {
        case "TOTAL_POIN":
          if (Number(user.total_poin) >= nilaiSyarat) isEligible = true;
          break;
        case "TOTAL_REPORT":
          if (totalReports >= nilaiSyarat) isEligible = true;
          break;
        // You can easily add STREAK_HARI etc. here when streak tracking is implemented
      }

      if (isEligible) {
        newAchievements.push(badge);
      }
    }

    // 5. Grant badges
    for (const badge of newAchievements) {
      // Create user_badges relation
      await prisma.user_badges.create({
        data: {
          user_id: userId,
          badges_id: badge.badges_id,
        },
      });
      
      console.log(`Awarded badge "${badge.nama_badge}" to user ${userId}`);
    }

    return newAchievements;
  } catch (error) {
    console.error("Achievement evaluation failed:", error);
  }
};
