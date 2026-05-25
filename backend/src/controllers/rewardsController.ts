import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";

const parseBigIntInput = (value: unknown, fallback: bigint): bigint => {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isFinite(value))
    return BigInt(Math.trunc(value));
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return BigInt(Math.trunc(parsed));
  }

  return fallback;
};

const DEFAULT_REWARDS = [
  {
    nama_reward: "Voucher Kopi Campus 15K",
    deskripsi: "Voucher minuman kopi di kantin atau tenant kampus pilihan.",
    poin_dibutuhkan: 150,
    stok: 20,
  },
  {
    nama_reward: "Kupon Makan Siang 20K",
    deskripsi: "Potongan harga untuk paket makan siang di merchant kampus.",
    poin_dibutuhkan: 250,
    stok: 15,
  },
  {
    nama_reward: "Voucher Fotokopi 50 Lembar",
    deskripsi: "Tukar poin untuk voucher fotokopi tugas atau materi kuliah.",
    poin_dibutuhkan: 100,
    stok: 30,
  },
  {
    nama_reward: "Tumbler EcoPoint",
    deskripsi: "Merchandise ramah lingkungan untuk membawa minum harian.",
    poin_dibutuhkan: 600,
    stok: 10,
  },
  {
    nama_reward: "Voucher Pulsa/Data 25K",
    deskripsi: "Berguna untuk kebutuhan internet dan komunikasi mahasiswa.",
    poin_dibutuhkan: 350,
    stok: 12,
  },
  {
    nama_reward: "Kupon Snack Sehat",
    deskripsi: "Ditukar dengan snack ringan di tenant sehat kampus.",
    poin_dibutuhkan: 180,
    stok: 18,
  },
] as const;

const ensureDefaultRewards = async (): Promise<void> => {
  const rewardCount = await prisma.rewards.count();

  if (rewardCount > 0) {
    return;
  }

  await prisma.rewards.createMany({
    data: DEFAULT_REWARDS.map((reward) => ({
      nama_reward: reward.nama_reward,
      deskripsi: reward.deskripsi,
      poin_dibutuhkan: BigInt(reward.poin_dibutuhkan),
      stok: BigInt(reward.stok),
      is_active: true,
    })),
    skipDuplicates: true,
  });
};

/**
 * GET /api/rewards
 * Public — returns all active rewards.
 */
export const getRewards = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    await ensureDefaultRewards();

    const rewards = await prisma.rewards.findMany({
      where: { is_active: true },
      orderBy: { poin_dibutuhkan: "asc" },
    });

    res.status(200).json({
      rewards: rewards.map((r: (typeof rewards)[number]) => ({
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
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { reward_id } = req.body;

    if (!reward_id) {
      res.status(400).json({ message: "reward_id wajib diisi" });
      return;
    }

    const result = await prisma.$transaction(async (tx: any) => {
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

    // After successful transaction, track action for daily challenges
    const reqSimulated = { ...req, body: { action: "redeem_reward" } } as any;
    const resSimulated = { status: () => ({ json: () => {} }) } as any;
    import("./dailyChallengeController.js").then(({ trackAction }) => {
      trackAction(reqSimulated, resSimulated).catch(console.error);
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
  res: Response,
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
      redemptions: redemptions.map((r: (typeof redemptions)[number]) => ({
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

/**
 * GET /api/admin/rewards
 * Admin — returns all rewards including inactive items and redemption counts.
 */
export const getAllRewardsAdmin = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    await ensureDefaultRewards();

    const rewards = await prisma.rewards.findMany({
      orderBy: [{ is_active: "desc" }, { poin_dibutuhkan: "asc" }],
      include: {
        _count: {
          select: { redemptions: true },
        },
      },
    });

    res.status(200).json({
      rewards: rewards.map((reward: (typeof rewards)[number]) => ({
        reward_id: reward.reward_id,
        nama_reward: reward.nama_reward,
        deskripsi: reward.deskripsi,
        poin_dibutuhkan: Number(reward.poin_dibutuhkan),
        stok: Number(reward.stok),
        is_active: reward.is_active,
        redeemed_count: reward._count.redemptions,
      })),
    });
  } catch (error) {
    console.error("Get all rewards admin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/admin/rewards
 * Admin — create a reward catalog item.
 */
export const createReward = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { nama_reward, deskripsi, poin_dibutuhkan, stok, is_active } =
      req.body;

    if (!nama_reward || !deskripsi || poin_dibutuhkan === undefined) {
      res.status(400).json({
        message: "nama_reward, deskripsi, dan poin_dibutuhkan wajib diisi",
      });
      return;
    }

    const reward = await prisma.rewards.create({
      data: {
        nama_reward,
        deskripsi,
        poin_dibutuhkan: parseBigIntInput(poin_dibutuhkan, 0n),
        stok: parseBigIntInput(stok, 0n),
        is_active: typeof is_active === "boolean" ? is_active : true,
      },
    });

    res.status(201).json({
      message: "Reward berhasil dibuat",
      reward: {
        reward_id: reward.reward_id,
        nama_reward: reward.nama_reward,
        deskripsi: reward.deskripsi,
        poin_dibutuhkan: Number(reward.poin_dibutuhkan),
        stok: Number(reward.stok),
        is_active: reward.is_active,
      },
    });
  } catch (error: any) {
    console.error("Create reward error:", error);
    if (error?.code === "P2002") {
      res.status(409).json({ message: "Nama reward sudah digunakan" });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/admin/rewards/:id
 * Admin — update a reward catalog item.
 */
export const updateReward = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rewardId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    if (!rewardId) {
      res.status(400).json({ message: "reward_id tidak valid" });
      return;
    }

    const existing = await prisma.rewards.findUnique({
      where: { reward_id: rewardId },
    });

    if (!existing) {
      res.status(404).json({ message: "Reward tidak ditemukan" });
      return;
    }

    const { nama_reward, deskripsi, poin_dibutuhkan, stok, is_active } =
      req.body;
    const updated = await prisma.rewards.update({
      where: { reward_id: rewardId },
      data: {
        ...(typeof nama_reward === "string" && nama_reward.trim() !== ""
          ? { nama_reward }
          : {}),
        ...(typeof deskripsi === "string" && deskripsi.trim() !== ""
          ? { deskripsi }
          : {}),
        ...(poin_dibutuhkan !== undefined
          ? {
              poin_dibutuhkan: parseBigIntInput(
                poin_dibutuhkan,
                existing.poin_dibutuhkan,
              ),
            }
          : {}),
        ...(stok !== undefined
          ? { stok: parseBigIntInput(stok, existing.stok) }
          : {}),
        ...(typeof is_active === "boolean" ? { is_active } : {}),
      },
    });

    res.status(200).json({
      message: "Reward berhasil diperbarui",
      reward: {
        reward_id: updated.reward_id,
        nama_reward: updated.nama_reward,
        deskripsi: updated.deskripsi,
        poin_dibutuhkan: Number(updated.poin_dibutuhkan),
        stok: Number(updated.stok),
        is_active: updated.is_active,
      },
    });
  } catch (error: any) {
    console.error("Update reward error:", error);
    if (error?.code === "P2002") {
      res.status(409).json({ message: "Nama reward sudah digunakan" });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /api/admin/rewards/:id
 * Admin — delete a reward if it is no longer needed.
 */
export const deleteReward = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const rewardId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    if (!rewardId) {
      res.status(400).json({ message: "reward_id tidak valid" });
      return;
    }

    const existing = await prisma.rewards.findUnique({
      where: { reward_id: rewardId },
    });
    if (!existing) {
      res.status(404).json({ message: "Reward tidak ditemukan" });
      return;
    }

    const redemptionCount = await prisma.redemptions.count({
      where: { reward_id: rewardId },
    });
    if (redemptionCount > 0) {
      await prisma.rewards.update({
        where: { reward_id: rewardId },
        data: { is_active: false },
      });

      res.status(200).json({
        message: "Reward dinonaktifkan karena sudah memiliki riwayat redeem",
      });
      return;
    }

    await prisma.rewards.delete({ where: { reward_id: rewardId } });

    res.status(200).json({ message: "Reward berhasil dihapus" });
  } catch (error) {
    console.error("Delete reward error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getRewards,
  redeemReward,
  getRedemptionHistory,
  getAllRewardsAdmin,
  createReward,
  updateReward,
  deleteReward,
};
