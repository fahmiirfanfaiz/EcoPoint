import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";

/**
 * GET /api/badges
 * List all badges (Public)
 */
export const getBadges = async (req: Request, res: Response) => {
  try {
    const badges = await prisma.badges.findMany({
      orderBy: { nilai_syarat: "asc" },
    });
    
    const formattedBadges = badges.map((b: typeof badges[number]) => ({
      ...b,
      syarat_poin: Number(b.syarat_poin),
      nilai_syarat: Number(b.nilai_syarat),
      jenis_syarat: b.jenis_syarat.replace(/'/g, "")
    }));

    res.status(200).json({ badges: formattedBadges });
  } catch (error) {
    console.error("Get badges error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/badges/admin/all
 * Admin — List all badges with user count
 */
export const getAllBadgesAdmin = async (_req: Request, res: Response) => {
  try {
    const badges = await prisma.badges.findMany({
      orderBy: { nilai_syarat: "asc" },
      include: {
        _count: { select: { user_badges: true } },
      },
    });

    res.status(200).json({
      badges: badges.map((b) => ({
        badges_id: b.badges_id,
        nama_badge: b.nama_badge,
        deskripsi: b.deskripsi,
        syarat_poin: Number(b.syarat_poin),
        jenis_syarat: b.jenis_syarat.replace(/'/g, ""),
        nilai_syarat: Number(b.nilai_syarat),
        earned_count: b._count.user_badges,
      })),
    });
  } catch (error) {
    console.error("Get all badges admin error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/badges/admin
 * Admin — Create a new badge
 */
export const createBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama_badge, deskripsi, jenis_syarat, nilai_syarat } = req.body;

    if (!nama_badge || !deskripsi || !jenis_syarat || nilai_syarat === undefined) {
      res.status(400).json({ message: "Semua field wajib diisi" });
      return;
    }

    const newBadge = await prisma.badges.create({
      data: {
        nama_badge,
        deskripsi,
        jenis_syarat,
        nilai_syarat: BigInt(nilai_syarat),
      },
    });

    res.status(201).json({
      message: "Badge berhasil dibuat",
      badge: {
        ...newBadge,
        syarat_poin: Number(newBadge.syarat_poin),
        nilai_syarat: Number(newBadge.nilai_syarat),
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      res.status(409).json({ message: "Badge dengan nama ini sudah ada" });
      return;
    }
    console.error("Create badge error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/badges/admin/:id
 * Admin — Update a badge
 */
export const updateBadge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nama_badge, deskripsi, jenis_syarat, nilai_syarat } = req.body;

    const existing = await prisma.badges.findUnique({
      where: { badges_id: id },
    });

    if (!existing) {
      res.status(404).json({ message: "Badge tidak ditemukan" });
      return;
    }

    const updated = await prisma.badges.update({
      where: { badges_id: id },
      data: {
        ...(nama_badge !== undefined && { nama_badge }),
        ...(deskripsi !== undefined && { deskripsi }),
        ...(jenis_syarat !== undefined && { jenis_syarat }),
        ...(nilai_syarat !== undefined && { nilai_syarat: BigInt(nilai_syarat) }),
      },
    });

    res.status(200).json({
      message: "Badge berhasil diupdate",
      badge: {
        ...updated,
        syarat_poin: Number(updated.syarat_poin),
        nilai_syarat: Number(updated.nilai_syarat),
      },
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      res.status(409).json({ message: "Badge dengan nama ini sudah ada" });
      return;
    }
    console.error("Update badge error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /api/badges/admin/:id
 * Admin — Delete a badge
 */
export const deleteBadge = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if any users have this badge
    const earnedCount = await prisma.user_badges.count({
      where: { badges_id: id },
    });

    if (earnedCount > 0) {
      res.status(409).json({
        message: `Tidak bisa menghapus badge ini karena sudah dimiliki oleh ${earnedCount} user.`,
      });
      return;
    }

    await prisma.badges.delete({
      where: { badges_id: id },
    });

    res.status(200).json({ message: "Badge berhasil dihapus" });
  } catch (error) {
    console.error("Delete badge error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getBadges,
  getAllBadgesAdmin,
  createBadge,
  updateBadge,
  deleteBadge,
};
