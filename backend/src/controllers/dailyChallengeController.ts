import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";

const MAX_DAILY = 3; // Maximum challenges per day
const MIN_DAILY = 2; // Minimum challenges per day (including permanent)

const getParamId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

// ═══════════════════════════════════════════════════════════
//  ADMIN ENDPOINTS — Manage Daily Challenges catalog
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/daily-challenges/admin/all
 * Admin — List all challenges (including inactive ones)
 */
export const getAllChallenges = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const challenges = await prisma.daily_challenges.findMany({
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      challenges: challenges.map((c: (typeof challenges)[number]) => ({
        ...c,
        poin_hadiah: Number(c.poin_hadiah),
        target_count: Number(c.target_count),
      })),
    });
  } catch (error) {
    console.error("Get all challenges error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/daily-challenges/admin/bonus
 * Admin — Get the global daily challenge completion bonus
 */
export const getBonusSetting = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const setting = await prisma.global_settings.findUnique({
      where: { setting_key: "DAILY_CHALLENGE_BONUS" },
    });
    res
      .status(200)
      .json({ bonus: setting ? Number(setting.setting_value) : 0 });
  } catch (error) {
    console.error("Get bonus setting error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/daily-challenges/admin/bonus
 * Admin — Update the global daily challenge completion bonus
 * Body: { bonus: number }
 */
export const updateBonusSetting = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { bonus } = req.body;
    if (bonus === undefined) {
      res.status(400).json({ message: "bonus wajib diisi" });
      return;
    }

    await prisma.global_settings.upsert({
      where: { setting_key: "DAILY_CHALLENGE_BONUS" },
      create: {
        setting_key: "DAILY_CHALLENGE_BONUS",
        setting_value: String(bonus),
      },
      update: { setting_value: String(bonus) },
    });

    res
      .status(200)
      .json({ message: "Bonus berhasil diupdate", bonus: Number(bonus) });
  } catch (error) {
    console.error("Update bonus setting error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/daily-challenges/admin
 * Admin — Create a new daily challenge template
 * Body: { nama_challenge, deskripsi, poin_hadiah, target_count, challenge_type, is_permanent }
 */
export const createChallenge = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      nama_challenge,
      deskripsi,
      poin_hadiah,
      target_count,
      challenge_type,
      is_permanent,
    } = req.body;

    if (!nama_challenge || !deskripsi || !challenge_type) {
      res.status(400).json({
        message: "nama_challenge, deskripsi, dan challenge_type wajib diisi",
      });
      return;
    }

    const challenge = await prisma.daily_challenges.create({
      data: {
        nama_challenge,
        deskripsi,
        poin_hadiah: BigInt(poin_hadiah ?? 0),
        target_count: BigInt(target_count ?? 1),
        challenge_type,
        is_active: true,
        is_permanent: is_permanent ?? false,
      },
    });

    res.status(201).json({
      message: "Challenge berhasil dibuat",
      challenge: {
        ...challenge,
        poin_hadiah: Number(challenge.poin_hadiah),
        target_count: Number(challenge.target_count),
      },
    });
  } catch (error) {
    console.error("Create challenge error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/daily-challenges/admin/:id
 * Admin — Update a challenge (name, description, status, etc.)
 */
export const updateChallenge = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    if (!id) {
      res.status(400).json({ message: "Invalid challenge id" });
      return;
    }
    const {
      nama_challenge,
      deskripsi,
      poin_hadiah,
      target_count,
      challenge_type,
      is_active,
      is_permanent,
    } = req.body;

    const existing = await prisma.daily_challenges.findUnique({
      where: { challenge_id: id },
    });

    if (!existing) {
      res.status(404).json({ message: "Challenge tidak ditemukan" });
      return;
    }

    const updated = await prisma.daily_challenges.update({
      where: { challenge_id: id },
      data: {
        ...(nama_challenge !== undefined && { nama_challenge }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(poin_hadiah !== undefined && { poin_hadiah: BigInt(poin_hadiah) }),
        ...(target_count !== undefined && {
          target_count: BigInt(target_count),
        }),
        ...(challenge_type !== undefined && { challenge_type }),
        ...(is_active !== undefined && { is_active }),
        ...(is_permanent !== undefined && { is_permanent }),
      },
    });

    res.status(200).json({
      message: "Challenge berhasil diupdate",
      challenge: {
        ...updated,
        poin_hadiah: Number(updated.poin_hadiah),
        target_count: Number(updated.target_count),
      },
    });
  } catch (error) {
    console.error("Update challenge error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /api/daily-challenges/admin/:id
 * Admin — Delete a challenge
 */
export const deleteChallenge = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = getParamId(req.params.id);
    if (!id) {
      res.status(400).json({ message: "Invalid challenge id" });
      return;
    }

    await prisma.daily_challenges.delete({
      where: { challenge_id: id },
    });

    res.status(200).json({ message: "Challenge berhasil dihapus" });
  } catch (error) {
    console.error("Delete challenge error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/daily-challenges/admin/today
 * Admin — View today's assigned challenges (multiple)
 */
export const getTodayAdmin = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const today = getTodayDate();

    const todayChallenges = await prisma.challenge_of_the_day.findMany({
      where: { tanggal: today },
      include: { daily_challenges: true },
    });

    if (todayChallenges.length === 0) {
      res.status(200).json({
        challenges: [],
        message: "Belum ada challenge untuk hari ini",
      });
      return;
    }

    res.status(200).json({
      challenges: todayChallenges.map(
        (tc: (typeof todayChallenges)[number]) => ({
          challenge_of_the_day_id: tc.id,
          tanggal: tc.tanggal,
          challenge_id: tc.daily_challenges.challenge_id,
          nama_challenge: tc.daily_challenges.nama_challenge,
          deskripsi: tc.daily_challenges.deskripsi,
          poin_hadiah: Number(tc.daily_challenges.poin_hadiah),
          target_count: Number(tc.daily_challenges.target_count),
          challenge_type: tc.daily_challenges.challenge_type,
          is_active: tc.daily_challenges.is_active,
          is_permanent: tc.daily_challenges.is_permanent,
        }),
      ),
    });
  } catch (error) {
    console.error("Get today admin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /api/daily-challenges/admin/reset-today
 * Admin — Reset today's challenge assignments.
 * Only allowed if NO user has started progress on any of today's challenges.
 */
export const resetTodayChallenges = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const today = getTodayDate();

    const todayChallenges = await prisma.challenge_of_the_day.findMany({
      where: { tanggal: today },
    });

    if (todayChallenges.length === 0) {
      res
        .status(400)
        .json({ message: "Tidak ada challenge hari ini untuk direset" });
      return;
    }

    // Check if any user has progress on any of today's challenges
    const todayIds = todayChallenges.map(
      (tc: (typeof todayChallenges)[number]) => tc.id,
    );
    const activeProgress = await prisma.user_daily_challenges.findFirst({
      where: {
        challenge_of_the_day_id: { in: todayIds },
      },
    });

    if (activeProgress) {
      res.status(409).json({
        message:
          "Tidak bisa reset karena ada user yang sedang berproses pada daily challenge hari ini.",
      });
      return;
    }

    // Safe to delete
    await prisma.challenge_of_the_day.deleteMany({
      where: { tanggal: today },
    });

    res.status(200).json({
      message:
        "Daily challenges hari ini berhasil direset. Challenge baru akan dipilih otomatis saat user mengakses.",
    });
  } catch (error) {
    console.error("Reset today challenges error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ═══════════════════════════════════════════════════════════
//  PUBLIC / USER ENDPOINTS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/daily-challenges/today
 * Public — Get today's challenges (2-3). If none exist yet for today,
 * the system will auto-assign: all active permanent challenges +
 * random active non-permanent challenges to fill up to MAX_DAILY.
 */
export const getTodayChallenge = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const today = getTodayDate();

    // Check if challenges have already been assigned for today
    let todayChallenges = await prisma.challenge_of_the_day.findMany({
      where: { tanggal: today },
      include: { daily_challenges: true },
    });

    // If no challenges for today → auto-pick
    if (todayChallenges.length === 0) {
      // 1. Get all active permanent challenges
      const permanentChallenges = await prisma.daily_challenges.findMany({
        where: { is_active: true, is_permanent: true },
      });

      // 2. Get all active non-permanent challenges
      const nonPermanentChallenges = await prisma.daily_challenges.findMany({
        where: { is_active: true, is_permanent: false },
      });

      if (
        permanentChallenges.length === 0 &&
        nonPermanentChallenges.length === 0
      ) {
        res.status(200).json({
          message: "Tidak ada challenge aktif saat ini",
          challenges: [],
        });
        return;
      }

      // 3. Calculate how many random slots we need
      const permanentCount = permanentChallenges.length;
      const randomSlotsNeeded = Math.max(
        0,
        Math.min(MAX_DAILY, MIN_DAILY + (MAX_DAILY - MIN_DAILY)) -
          permanentCount,
      );
      // Ensure we reach at least MIN_DAILY total
      const slotsToFill = Math.max(
        Math.max(0, MIN_DAILY - permanentCount),
        Math.min(randomSlotsNeeded, nonPermanentChallenges.length),
      );

      // 4. Shuffle and pick random non-permanent challenges
      const shuffled = nonPermanentChallenges.sort(() => Math.random() - 0.5);
      const pickedRandom = shuffled.slice(0, slotsToFill);

      // 5. Combine permanent + random picks
      const allPicked = [...permanentChallenges, ...pickedRandom];

      // 6. Create challenge_of_the_day entries for each
      for (const ch of allPicked) {
        await prisma.challenge_of_the_day.create({
          data: {
            challenge_id: ch.challenge_id,
            tanggal: today,
          },
        });
      }

      // Re-fetch with relations
      todayChallenges = await prisma.challenge_of_the_day.findMany({
        where: { tanggal: today },
        include: { daily_challenges: true },
      });
    }

    // If user is authenticated, include their progress for each challenge
    const challengesWithProgress = await Promise.all(
      todayChallenges.map(async (tc: (typeof todayChallenges)[number]) => {
        let userProgress = null;
        if (req.userId) {
          const progress = await prisma.user_daily_challenges.findUnique({
            where: {
              user_id_challenge_of_the_day_id: {
                user_id: req.userId,
                challenge_of_the_day_id: tc.id,
              },
            },
          });
          if (progress) {
            userProgress = {
              current_progress: Number(progress.current_progress),
              is_completed: progress.is_completed,
              is_points_claimed: progress.is_points_claimed,
              claimed_at: progress.claimed_at,
            };
          }
        }

        return {
          challenge_of_the_day_id: tc.id,
          tanggal: tc.tanggal,
          challenge_id: tc.daily_challenges.challenge_id,
          nama_challenge: tc.daily_challenges.nama_challenge,
          deskripsi: tc.daily_challenges.deskripsi,
          poin_hadiah: Number(tc.daily_challenges.poin_hadiah),
          target_count: Number(tc.daily_challenges.target_count),
          challenge_type: tc.daily_challenges.challenge_type,
          is_permanent: tc.daily_challenges.is_permanent,
          user_progress: userProgress,
        };
      }),
    );

    // Fetch global bonus points setting
    const bonusSetting = await prisma.global_settings.findUnique({
      where: { setting_key: "DAILY_CHALLENGE_BONUS" },
    });
    const globalBonusPoints = bonusSetting
      ? Number(bonusSetting.setting_value)
      : 300;

    res.status(200).json({
      challenges: challengesWithProgress,
      global_bonus_points: globalBonusPoints,
    });
  } catch (error) {
    console.error("Get today challenge error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/daily-challenges/progress
 * Protected — Increment user's progress on a specific today's challenge.
 * Automatically marks as completed when target is reached.
 * Body: { challenge_of_the_day_id, increment?: number }
 */
export const updateProgress = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { challenge_of_the_day_id } = req.body;
    const increment = Number(req.body.increment) || 1;
    const today = getTodayDate();

    if (!challenge_of_the_day_id) {
      res.status(400).json({ message: "challenge_of_the_day_id wajib diisi" });
      return;
    }

    // Get the specific challenge_of_the_day
    const todayChallenge = await prisma.challenge_of_the_day.findFirst({
      where: { id: challenge_of_the_day_id, tanggal: today },
      include: { daily_challenges: true },
    });

    if (!todayChallenge) {
      res
        .status(404)
        .json({ message: "Challenge tidak ditemukan untuk hari ini" });
      return;
    }

    // Upsert user progress
    const existing = await prisma.user_daily_challenges.findUnique({
      where: {
        user_id_challenge_of_the_day_id: {
          user_id: userId,
          challenge_of_the_day_id: todayChallenge.id,
        },
      },
    });

    if (existing?.is_completed) {
      res.status(400).json({ message: "Challenge sudah selesai" });
      return;
    }

    const currentProgress = Number(existing?.current_progress ?? 0) + increment;
    const targetCount = Number(todayChallenge.daily_challenges.target_count);
    const isCompleted = currentProgress >= targetCount;

    const progress = await prisma.user_daily_challenges.upsert({
      where: {
        user_id_challenge_of_the_day_id: {
          user_id: userId,
          challenge_of_the_day_id: todayChallenge.id,
        },
      },
      create: {
        user_id: userId,
        challenge_of_the_day_id: todayChallenge.id,
        current_progress: BigInt(currentProgress),
        is_completed: isCompleted,
      },
      update: {
        current_progress: BigInt(currentProgress),
        is_completed: isCompleted,
      },
    });

    res.status(200).json({
      message: isCompleted
        ? "Challenge selesai! Silakan claim poin."
        : "Progress terupdate",
      progress: {
        current_progress: Number(progress.current_progress),
        target_count: targetCount,
        is_completed: progress.is_completed,
        is_points_claimed: progress.is_points_claimed,
      },
    });
  } catch (error) {
    console.error("Update progress error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/daily-challenges/claim
 * Protected — Claim points for a completed daily challenge.
 * Uses a transaction to ensure atomicity.
 * Body: { challenge_of_the_day_id }
 */
export const claimPoints = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { challenge_of_the_day_id } = req.body;
    const today = getTodayDate();

    if (!challenge_of_the_day_id) {
      res.status(400).json({ message: "challenge_of_the_day_id wajib diisi" });
      return;
    }

    const todayChallenge = await prisma.challenge_of_the_day.findFirst({
      where: { id: challenge_of_the_day_id, tanggal: today },
      include: { daily_challenges: true },
    });

    if (!todayChallenge) {
      res
        .status(404)
        .json({ message: "Challenge tidak ditemukan untuk hari ini" });
      return;
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const userChallenge = await tx.user_daily_challenges.findUnique({
        where: {
          user_id_challenge_of_the_day_id: {
            user_id: userId,
            challenge_of_the_day_id: todayChallenge.id,
          },
        },
      });

      if (!userChallenge) {
        throw new Error("NOT_STARTED");
      }

      if (!userChallenge.is_completed) {
        throw new Error("NOT_COMPLETED");
      }

      if (userChallenge.is_points_claimed) {
        throw new Error("ALREADY_CLAIMED");
      }

      const poinHadiah = todayChallenge.daily_challenges.poin_hadiah;

      // Mark as claimed
      await tx.user_daily_challenges.update({
        where: {
          user_daily_challenges_id: userChallenge.user_daily_challenges_id,
        },
        data: {
          is_points_claimed: true,
          claimed_at: new Date(),
        },
      });

      // Add points and check for daily bonus
      let pointsToAdd = Number(poinHadiah);
      let bonusAwarded = false;
      let bonusAmount = 0;

      // Check if all today's challenges are completed
      const todayChallengesAll = await tx.challenge_of_the_day.findMany({
        where: { tanggal: today },
      });
      const todayIds = todayChallengesAll.map((tc: any) => tc.id);

      const allProgress = await tx.user_daily_challenges.findMany({
        where: {
          user_id: userId,
          challenge_of_the_day_id: { in: todayIds },
        },
      });

      const user = await tx.users.findUnique({
        where: { user_id: userId },
        select: { last_daily_bonus_claim: true },
      });

      const allCompleted = todayChallengesAll.every((tc: any) => {
        const p = allProgress.find(
          (up: any) => up.challenge_of_the_day_id === tc.id,
        );
        return p?.is_points_claimed;
      });

      const hasClaimedBonusToday =
        user?.last_daily_bonus_claim &&
        user.last_daily_bonus_claim.getTime() === today.getTime();

      if (allCompleted && !hasClaimedBonusToday) {
        const bonusSetting = await tx.global_settings.findUnique({
          where: { setting_key: "DAILY_CHALLENGE_BONUS" },
        });
        bonusAmount = bonusSetting ? Number(bonusSetting.setting_value) : 300;

        if (bonusAmount > 0) {
          pointsToAdd += bonusAmount;
          bonusAwarded = true;
          // Update last_daily_bonus_claim
          await tx.users.update({
            where: { user_id: userId },
            data: { last_daily_bonus_claim: today },
          });
        }
      }

      const updatedUser = await tx.users.update({
        where: { user_id: userId },
        data: {
          total_poin: { increment: pointsToAdd },
        },
        select: { total_poin: true },
      });

      return {
        poin_didapat: Number(poinHadiah),
        bonus_didapat: bonusAwarded ? bonusAmount : 0,
        bonus_awarded: bonusAwarded,
        total_poin: Number(updatedUser.total_poin),
      };
    });

    res.status(200).json({
      message: "Poin berhasil di-claim!",
      data: result,
    });
  } catch (error: any) {
    const errorMap: Record<string, { status: number; message: string }> = {
      NOT_STARTED: { status: 400, message: "Kamu belum memulai challenge ini" },
      NOT_COMPLETED: { status: 400, message: "Challenge belum selesai" },
      ALREADY_CLAIMED: {
        status: 400,
        message: "Poin sudah di-claim sebelumnya",
      },
    };

    const mapped = errorMap[error?.message];
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }

    console.error("Claim points error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/daily-challenges/track-action
 * Track an action (e.g. "waste_report", "login_streak") to increment daily challenge progress.
 * Body: { action: string }
 */
export const trackAction = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { action } = req.body;
    const today = getTodayDate();

    if (!action) {
      res.status(400).json({ message: "Action wajib diisi" });
      return;
    }

    // Since REPORT and waste_report are sometimes used interchangeably
    const actionTypes =
      action === "waste_report" || action === "REPORT"
        ? ["waste_report", "REPORT"]
        : [action];

    // Find all today's challenges matching the action type
    const matchingChallenges = await prisma.challenge_of_the_day.findMany({
      where: {
        tanggal: today,
        daily_challenges: {
          challenge_type: { in: actionTypes },
        },
      },
      include: { daily_challenges: true },
    });

    if (matchingChallenges.length === 0) {
      // No matching challenge for today, do nothing but return ok
      res.status(200).json({
        message: "No matching challenge for today",
        progress_updated: false,
      });
      return;
    }

    let updatedCount = 0;

    for (const tc of matchingChallenges) {
      // Fetch or create progress
      const existing = await prisma.user_daily_challenges.findUnique({
        where: {
          user_id_challenge_of_the_day_id: {
            user_id: userId,
            challenge_of_the_day_id: tc.id,
          },
        },
      });

      if (existing?.is_completed) continue;

      const currentProgress = Number(existing?.current_progress ?? 0) + 1;
      const targetCount = Number(tc.daily_challenges.target_count);
      const isCompleted = currentProgress >= targetCount;

      await prisma.user_daily_challenges.upsert({
        where: {
          user_id_challenge_of_the_day_id: {
            user_id: userId,
            challenge_of_the_day_id: tc.id,
          },
        },
        create: {
          user_id: userId,
          challenge_of_the_day_id: tc.id,
          current_progress: BigInt(currentProgress),
          is_completed: isCompleted,
        },
        update: {
          current_progress: BigInt(currentProgress),
          is_completed: isCompleted,
        },
      });

      updatedCount++;

      // If just completed, we could trigger badge evaluation here,
      // but the user gets the badge upon claiming points or we can evaluate now.
      if (isCompleted) {
        import("../services/achievementService.js").then(
          ({ evaluateUserAchievements }) => {
            evaluateUserAchievements(userId).catch(console.error);
          },
        );
      }
    }

    res.status(200).json({
      message: `Progress updated for ${updatedCount} challenges`,
      progress_updated: updatedCount > 0,
    });
  } catch (error) {
    console.error("Track action error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ═══════════════════════════════════════════════════════════
//  HELPER
// ═══════════════════════════════════════════════════════════

/**
 * Returns today's date as a Date object with time set to 00:00:00 UTC.
 */
function getTodayDate(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export default {
  // Admin
  getBonusSetting,
  updateBonusSetting,
  getAllChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getTodayAdmin,
  resetTodayChallenges,
  // User
  getTodayChallenge,
  updateProgress,
  claimPoints,
  trackAction,
};
