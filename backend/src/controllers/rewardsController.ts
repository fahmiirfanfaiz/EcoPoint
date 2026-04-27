import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";

/**
 * GET /api/rewards
 * Public — returns all active rewards.
 */
export const getRewards = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rewards = await prisma.rewards.findMany({
      where: { is_active: true },
      orderBy: { poin_dibutuhkan: "asc" },
    });

    res.status(200).json({
      rewards: rewards.map((r) => ({
        ...r,
        poin_dibutuhkan: Number(r.poin_dibutuhkan),
        stok: Number(r.stok),
      })),
    });
  } catch (error) {
    console.error("Get rewards error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/rewards/redeem
 * Protected — redeems a reward for the authenticated user.
 * Body: { reward_id: string }
 *
 * Uses a Prisma interactive transaction to guarantee atomicity:
 *   1. Verify user has enough points
 *   2. Verify reward is active and in stock
 *   3. Create redemption record
 *   4. Deduct points from user
 *   5. Decrement reward stock
 */
export const redeemReward = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { reward_id } = req.body;

    if (!reward_id) {
      res.status(400).json({ message: "reward_id wajib diisi" });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get user's current points
      const user = await tx.users.findUnique({
        where: { user_id: userId },
        select: { total_poin: true },
      });

      if (!user) {
        throw new Error("USER_NOT_FOUND");
      }

      // 2. Get reward details
      const reward = await tx.rewards.findUnique({
        where: { reward_id },
      });

      if (!reward) {
        throw new Error("REWARD_NOT_FOUND");
      }

      if (!reward.is_active) {
        throw new Error("REWARD_NOT_ACTIVE");
      }

      if (reward.stok <= 0) {
        throw new Error("REWARD_OUT_OF_STOCK");
      }

      if (user.total_poin < reward.poin_dibutuhkan) {
        throw new Error("INSUFFICIENT_POINTS");
      }

      // 3. Create redemption record
      const redemption = await tx.redemptions.create({
        data: {
          user_id: userId,
          reward_id: reward.reward_id,
          poin_digunakan: reward.poin_dibutuhkan,
        },
      });

      // 4. Deduct points from user
      await tx.users.update({
        where: { user_id: userId },
        data: {
          total_poin: { decrement: reward.poin_dibutuhkan },
        },
      });

      // 5. Decrement reward stock
      await tx.rewards.update({
        where: { reward_id: reward.reward_id },
        data: {
          stok: { decrement: 1 },
        },
      });

      return {
        redemption_id: redemption.redemption_id,
        reward_name: reward.nama_reward,
        poin_digunakan: Number(reward.poin_dibutuhkan),
        sisa_poin: Number(user.total_poin - reward.poin_dibutuhkan),
      };
    });

    res.status(200).json({
      message: "Reward berhasil ditukar!",
      data: result,
    });
  } catch (error: any) {
    const errorMap: Record<string, { status: number; message: string }> = {
      USER_NOT_FOUND: { status: 404, message: "User tidak ditemukan" },
      REWARD_NOT_FOUND: { status: 404, message: "Reward tidak ditemukan" },
      REWARD_NOT_ACTIVE: { status: 400, message: "Reward sudah tidak aktif" },
      REWARD_OUT_OF_STOCK: { status: 400, message: "Stok reward habis" },
      INSUFFICIENT_POINTS: { status: 400, message: "Poin tidak cukup" },
    };

    const mapped = errorMap[error?.message];
    if (mapped) {
      res.status(mapped.status).json({ message: mapped.message });
      return;
    }

    console.error("Redeem error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/rewards/history
 * Protected — returns user's redemption history.
 */
export const getRedemptionHistory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId!;

    const redemptions = await prisma.redemptions.findMany({
      where: { user_id: userId },
      include: {
        rewards: {
          select: {
            nama_reward: true,
            deskripsi: true,
          },
        },
      },
      orderBy: { redeemed_at: "desc" },
    });

    res.status(200).json({
      redemptions: redemptions.map((r) => ({
        redemption_id: r.redemption_id,
        reward_name: r.rewards.nama_reward,
        reward_description: r.rewards.deskripsi,
        poin_digunakan: Number(r.poin_digunakan),
        redeemed_at: r.redeemed_at,
      })),
    });
  } catch (error) {
    console.error("Redemption history error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { getRewards, redeemReward, getRedemptionHistory };
