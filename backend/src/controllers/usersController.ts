import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const getParamId = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const isPrismaKnownError = (error: unknown): error is { code: string } => {
  return typeof error === "object" && error !== null && "code" in error;
};

const serializeUser = (user: {
  user_id: string;
  nama: string;
  nim: string;
  email: string;
  role: string;
  fakultas: string;
  total_poin: bigint;
  created_at: Date;
}) => ({
  ...user,
  total_poin: user.total_poin.toString(),
  created_at: user.created_at.toISOString(),
});

const listUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.users.findMany({
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
      orderBy: { created_at: "desc" },
    });

    res.json({ data: users.map(serializeUser) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to list users" });
  }
};

const getUser = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid user id" });

    const user = await prisma.users.findUnique({
      where: { user_id: id },
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
    });

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ data: serializeUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get user" });
  }
};

const updateUser = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid user id" });

    const payload = req.body;

    const allowed = ["nama", "nim", "email", "role", "fakultas", "total_poin"];
    const data: Record<string, string | number | bigint | boolean | null> = {};
    for (const key of allowed) {
      if (key in payload) data[key] = payload[key];
    }

    if (typeof data.total_poin === "string" && data.total_poin.trim() !== "") {
      data.total_poin = BigInt(data.total_poin);
    }

    const updated = await prisma.users.update({
      where: { user_id: id },
      data,
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
    });

    res.json({ data: serializeUser(updated) });
  } catch (err: unknown) {
    console.error(err);
    if (isPrismaKnownError(err) && err.code === "P2025")
      return res.status(404).json({ message: "User not found" });
    res.status(500).json({ message: "Failed to update user" });
  }
};

const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = getParamId(req.params.id);
    if (!id) return res.status(400).json({ message: "Invalid user id" });

    await prisma.users.delete({ where: { user_id: id } });
    res.status(204).send();
  } catch (err: unknown) {
    console.error(err);
    if (isPrismaKnownError(err) && err.code === "P2025")
      return res.status(404).json({ message: "User not found" });
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export default { listUsers, getUser, updateUser, deleteUser };
