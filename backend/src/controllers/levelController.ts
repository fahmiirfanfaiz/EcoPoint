import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";

/**
 * GET /api/levels
 * Public — returns all levels sorted by level_number ascending.
 */
export const getLevels = async (_req: Request, res: Response): Promise<void> => {
  try {
    const levels = await prisma.levels.findMany({
      orderBy: { level_number: "asc" },
    });

    res.status(200).json({
      levels: levels.map((l) => ({
        level_id: l.level_id,
        level_number: l.level_number,
        nama_level: l.nama_level,
        syarat_poin: Number(l.syarat_poin),
        created_at: l.created_at,
      })),
    });
  } catch (error) {
    console.error("Get levels error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * POST /api/levels/admin
 * Admin-only — create a new level.
 */
export const createLevel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { level_number, nama_level, syarat_poin } = req.body;

    if (level_number == null || !nama_level || syarat_poin == null) {
      res.status(400).json({ message: "level_number, nama_level, dan syarat_poin wajib diisi" });
      return;
    }

    const existing = await prisma.levels.findUnique({
      where: { level_number: Number(level_number) },
    });

    if (existing) {
      res.status(409).json({ message: `Level ${level_number} sudah ada` });
      return;
    }

    const level = await prisma.levels.create({
      data: {
        level_number: Number(level_number),
        nama_level,
        syarat_poin: BigInt(syarat_poin),
      },
    });

    res.status(201).json({
      message: "Level berhasil dibuat",
      level: {
        ...level,
        syarat_poin: Number(level.syarat_poin),
      },
    });
  } catch (error) {
    console.error("Create level error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PUT /api/levels/admin/:id
 * Admin-only — update a level.
 */
export const updateLevel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { level_number, nama_level, syarat_poin } = req.body;

    const existing = await prisma.levels.findUnique({
      where: { level_id: id },
    });

    if (!existing) {
      res.status(404).json({ message: "Level tidak ditemukan" });
      return;
    }

    const level = await prisma.levels.update({
      where: { level_id: id },
      data: {
        ...(level_number != null && { level_number: Number(level_number) }),
        ...(nama_level && { nama_level }),
        ...(syarat_poin != null && { syarat_poin: BigInt(syarat_poin) }),
      },
    });

    res.status(200).json({
      message: "Level berhasil diperbarui",
      level: {
        ...level,
        syarat_poin: Number(level.syarat_poin),
      },
    });
  } catch (error) {
    console.error("Update level error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /api/levels/admin/:id
 * Admin-only — delete a level.
 */
export const deleteLevel = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.levels.findUnique({
      where: { level_id: id },
    });

    if (!existing) {
      res.status(404).json({ message: "Level tidak ditemukan" });
      return;
    }

    await prisma.levels.delete({
      where: { level_id: id },
    });

    res.status(200).json({ message: "Level berhasil dihapus" });
  } catch (error) {
    console.error("Delete level error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { getLevels, createLevel, updateLevel, deleteLevel };
