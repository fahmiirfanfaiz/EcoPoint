import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
dotenv.config();

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama, nim, email, password, role } = req.body;

    // Validasi input
    if (!nama || !nim || !email || !password) {
      res
        .status(400)
        .json({ message: "Nama, NIM, email, dan password wajib diisi" });
      return;
    }

    // Cek apakah email sudah terdaftar
    const existingEmail = await prisma.users.findUnique({
      where: { email },
    });

    if (existingEmail) {
      res.status(409).json({ message: "Email sudah terdaftar" });
      return;
    }

    // Cek apakah NIM sudah terdaftar
    const existingNim = await prisma.users.findUnique({
      where: { nim },
    });

    if (existingNim) {
      res.status(409).json({ message: "NIM sudah terdaftar" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Simpan user baru ke database
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

    // Validasi input
    if (!email || !password) {
      res.status(400).json({ message: "Email dan password wajib diisi" });
      return;
    }

    // Cari user berdasarkan email
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: "Email atau password salah" });
      return;
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Email atau password salah" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
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
        total_poin: user.total_poin.toString(),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { register, login };
