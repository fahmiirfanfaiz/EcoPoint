import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";

const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama, nim, email, password, role } = req.body;

    if (!nama || !nim || !email || !password) {
      res
        .status(400)
        .json({ message: "Nama, NIM, email, dan password wajib diisi" });
      return;
    }

    const existingEmail = await prisma.users.findUnique({
      where: { email },
    });

    if (existingEmail) {
      res.status(409).json({ message: "Email sudah terdaftar" });
      return;
    }

    const existingNim = await prisma.users.findUnique({
      where: { nim },
    });

    if (existingNim) {
      res.status(409).json({ message: "NIM sudah terdaftar" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.users.create({
      data: {
        nama,
        nim,
        email,
        password: hashedPassword,
        role: role ?? "mahasiswa",
      },
      select: {
        user_id: true,
        nama: true,
        nim: true,
        email: true,
        role: true,
        created_at: true,
      },
    });

    res.status(201).json({
      message: "Registrasi berhasil",
      user: newUser,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email dan password wajib diisi" });
      return;
    }

    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: "Email atau password salah" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Email atau password salah" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        user_id: user.user_id,
        nama: user.nama,
        nim: user.nim,
        email: user.email,
        role: user.role,
        total_poin: Number(user.total_poin),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await prisma.users.findUnique({
      where: { user_id: req.userId },
      select: {
        user_id: true,
        nama: true,
        nim: true,
        email: true,
        role: true,
        total_poin: true,
        created_at: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    res.status(200).json({
      user: {
        ...user,
        total_poin: Number(user.total_poin),
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { register, login, getMe };
