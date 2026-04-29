import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

/**
 * GET /api/badges
 * List all badges (Public or Admin)
 */
export const getBadges = async (req: Request, res: Response) => {
  try {
    const badges = await prisma.badges.findMany({
      orderBy: { nilai_syarat: "asc" },
    });
    
    // Convert BigInts
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
 * POST /api/badges
 * Create a new badge (Admin only in real app, keeping it simple here)
 */
export const createBadge = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama_badge, deskripsi, jenis_syarat, nilai_syarat } = req.body;

    if (!nama_badge || !deskripsi || !jenis_syarat || typeof nilai_syarat !== "number") {
      res.status(400).json({ message: "Incomplete badge data" });
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
      message: "Badge created successfully",
      badge: {
        ...newBadge,
        syarat_poin: Number(newBadge.syarat_poin),
        nilai_syarat: Number(newBadge.nilai_syarat),
      },
    });
  } catch (error) {
    console.error("Create badge error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { getBadges, createBadge };
