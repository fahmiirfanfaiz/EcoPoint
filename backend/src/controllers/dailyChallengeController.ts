import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";

// ═══════════════════════════════════════════════════════════
//  ADMIN ENDPOINTS — Manage Daily Challenges catalog
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/daily-challenges/admin/all
 * Admin — List all challenges (including inactive ones)
 */
export const getAllChallenges = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const challenges = await prisma.daily_challenges.findMany({
      orderBy: { created_at: "desc" },
    });

    res.status(200).json({
      challenges: challenges.map((c) => ({
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
 * POST /api/daily-challenges/admin
 * Admin — Create a new daily challenge template
 * Body: { nama_challenge, deskripsi, poin_hadiah, target_count, challenge_type }
 */
export const createChallenge = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { nama_challenge, deskripsi, poin_hadiah, target_count, challenge_type } = req.body;

    if (!nama_challenge || !deskripsi || !challenge_type) {
      res.status(400).json({ message: "nama_challenge, deskripsi, dan challenge_type wajib diisi" });
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
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nama_challenge, deskripsi, poin_hadiah, target_count, challenge_type, is_active } = req.body;

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
        ...(target_count !== undefined && { target_count: BigInt(target_count) }),
        ...(challenge_type !== undefined && { challenge_type }),
        ...(is_active !== undefined && { is_active }),
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
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.daily_challenges.delete({
      where: { challenge_id: id },
    });

    res.status(200).json({ message: "Challenge berhasil dihapus" });
  } catch (error) {
    console.error("Delete challenge error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ═══════════════════════════════════════════════════════════
//  PUBLIC / USER ENDPOINTS
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/daily-challenges/today
 * Public — Get today's challenge(s). If none exist yet for today,
 * the system will automatically pick a random active challenge.
 */
export const getTodayChallenge = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const today = getTodayDate();

    // Check if a challenge has already been assigned for today
    let todayChallenge = await prisma.challenge_of_the_day.findFirst({
      where: { tanggal: today },
      include: {
        daily_challenges: true,
      },
    });

    // If no challenge for today → auto-pick a random active one
    if (!todayChallenge) {
      const activeChallenges = await prisma.daily_challenges.findMany({
        where: { is_active: true },
      });

      if (activeChallenges.length === 0) {
        res.status(200).json({
          message: "Tidak ada challenge aktif saat ini",
          challenge: null,
        });
        return;
      }

      // Pick one at random
      const randomIndex = Math.floor(Math.random() * activeChallenges.length);
      const picked = activeChallenges[randomIndex];

      todayChallenge = await prisma.challenge_of_the_day.create({
        data: {
          challenge_id: picked.challenge_id,
          tanggal: today,
        },
        include: {
          daily_challenges: true,
        },
      });
    }

    // If user is authenticated, include their progress
    let userProgress = null;
    if (req.userId) {
      userProgress = await prisma.user_daily_challenges.findUnique({
        where: {
          user_id_challenge_of_the_day_id: {
            user_id: req.userId,
            challenge_of_the_day_id: todayChallenge.id,
          },
        },
      });
    }

    res.status(200).json({
      challenge: {
        challenge_of_the_day_id: todayChallenge.id,
        tanggal: todayChallenge.tanggal,
        challenge_id: todayChallenge.daily_challenges.challenge_id,
        nama_challenge: todayChallenge.daily_challenges.nama_challenge,
        deskripsi: todayChallenge.daily_challenges.deskripsi,
        poin_hadiah: Number(todayChallenge.daily_challenges.poin_hadiah),
        target_count: Number(todayChallenge.daily_challenges.target_count),
        challenge_type: todayChallenge.daily_challenges.challenge_type,
      },
      user_progress: userProgress
        ? {
            current_progress: Number(userProgress.current_progress),
            is_completed: userProgress.is_completed,
            is_points_claimed: userProgress.is_points_claimed,
            claimed_at: userProgress.claimed_at,
          }
        : null,
    });
  } catch (error) {
    console.error("Get today challenge error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/daily-challenges/progress
 * Protected — Increment user's progress on today's challenge.
 * Automatically marks as completed when target is reached.
 * Body: { increment?: number } (defaults to 1)
 */
export const updateProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const increment = Number(req.body.increment) || 1;
    const today = getTodayDate();

    // Get today's challenge
    const todayChallenge = await prisma.challenge_of_the_day.findFirst({
      where: { tanggal: today },
      include: { daily_challenges: true },
    });

    if (!todayChallenge) {
      res.status(404).json({ message: "Tidak ada challenge untuk hari ini" });
      return;
    }

    // Upsert user progress (create if first time, update if exists)
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
      message: isCompleted ? "Challenge selesai! Silakan claim poin." : "Progress terupdate",
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
 */
export const claimPoints = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const today = getTodayDate();

    const todayChallenge = await prisma.challenge_of_the_day.findFirst({
      where: { tanggal: today },
      include: { daily_challenges: true },
    });

    if (!todayChallenge) {
      res.status(404).json({ message: "Tidak ada challenge untuk hari ini" });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
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

      // Add points to user
      const updatedUser = await tx.users.update({
        where: { user_id: userId },
        data: {
          total_poin: { increment: poinHadiah },
        },
        select: { total_poin: true },
      });

      return {
        poin_didapat: Number(poinHadiah),
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
      ALREADY_CLAIMED: { status: 400, message: "Poin sudah di-claim sebelumnya" },
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
  getAllChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  // User
  getTodayChallenge,
  updateProgress,
  claimPoints,
};
