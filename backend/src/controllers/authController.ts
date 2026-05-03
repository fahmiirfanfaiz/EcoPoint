import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";

const SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nama, nim, password, role, fakultas } = req.body;
    let { email } = req.body;

    if (!nama || !nim || !email || !password || !fakultas) {
      res.status(400).json({ message: "Semua kolom (nama, NIM, email, password, fakultas) wajib diisi" });
      return;
    }

    email = email.toLowerCase();

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
        fakultas,
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
    let { email } = req.body;
    const { password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email dan password wajib diisi" });
      return;
    }

    email = email.toLowerCase();

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

    // ── Auto-progress login_streak challenges ──────────────
    try {
      const now = new Date();
      const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

      // Ensure today's challenges exist (auto-pick if not yet assigned)
      const existingToday = await prisma.challenge_of_the_day.findMany({
        where: { tanggal: today },
      });

      if (existingToday.length === 0) {
        // Auto-pick challenges for today (same logic as getTodayChallenge)
        const MAX_DAILY = 3;
        const MIN_DAILY = 2;

        const permanentChallenges = await prisma.daily_challenges.findMany({
          where: { is_active: true, is_permanent: true },
        });
        const nonPermanentChallenges = await prisma.daily_challenges.findMany({
          where: { is_active: true, is_permanent: false },
        });

        const permanentCount = permanentChallenges.length;
        const randomSlotsNeeded = Math.max(0, Math.min(MAX_DAILY, MIN_DAILY + (MAX_DAILY - MIN_DAILY)) - permanentCount);
        const slotsToFill = Math.max(
          Math.max(0, MIN_DAILY - permanentCount),
          Math.min(randomSlotsNeeded, nonPermanentChallenges.length)
        );

        const shuffled = nonPermanentChallenges.sort(() => Math.random() - 0.5);
        const pickedRandom = shuffled.slice(0, slotsToFill);
        const allPicked = [...permanentChallenges, ...pickedRandom];

        for (const ch of allPicked) {
          await prisma.challenge_of_the_day.create({
            data: {
              challenge_id: ch.challenge_id,
              tanggal: today,
            },
          });
        }
      }

      // Now find today's login_streak challenges and update progress
      const todayLoginChallenges = await prisma.challenge_of_the_day.findMany({
        where: {
          tanggal: today,
          daily_challenges: { challenge_type: "login_streak", is_active: true },
        },
        include: { daily_challenges: true },
      });

      for (const tc of todayLoginChallenges) {
        const existing = await prisma.user_daily_challenges.findUnique({
          where: {
            user_id_challenge_of_the_day_id: {
              user_id: user.user_id,
              challenge_of_the_day_id: tc.id,
            },
          },
        });

        // Skip if already completed
        if (existing?.is_completed) continue;

        const currentProgress = Number(existing?.current_progress ?? 0) + 1;
        const targetCount = Number(tc.daily_challenges.target_count);
        const isCompleted = currentProgress >= targetCount;

        await prisma.user_daily_challenges.upsert({
          where: {
            user_id_challenge_of_the_day_id: {
              user_id: user.user_id,
              challenge_of_the_day_id: tc.id,
            },
          },
          create: {
            user_id: user.user_id,
            challenge_of_the_day_id: tc.id,
            current_progress: BigInt(currentProgress),
            is_completed: isCompleted,
          },
          update: {
            current_progress: BigInt(currentProgress),
            is_completed: isCompleted,
          },
        });
      }
    } catch (streakErr) {
      // Don't block login if streak update fails
      console.error("Login streak auto-progress error:", streakErr);
    }

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        user_id: user.user_id,
        nama: user.nama,
        nim: user.nim,
        email: user.email,
        role: user.role,
        fakultas: user.fakultas || "",
        profile_pic: Number(user.profile_pic),
        is_edited: user.is_edited,
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
        fakultas: true,
        profile_pic: true,
        is_edited: true,
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
        fakultas: user.fakultas || "",
        profile_pic: Number(user.profile_pic),
        total_poin: Number(user.total_poin),
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { nama, nim, email, fakultas, profile_pic } = req.body;

    const user = await prisma.users.findUnique({
      where: { user_id: req.userId },
    });

    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    const isEdited = user.is_edited;
    let dataToUpdate: any = {};
    let willBeEdited = false;

    // Email and profile_pic are always updatable
    if (email !== undefined && email !== user.email) {
      dataToUpdate.email = email.toLowerCase();
    }
    if (profile_pic !== undefined) {
      dataToUpdate.profile_pic = BigInt(profile_pic);
    }

    // Nama, NIM, Fakultas are only updatable if NOT already edited
    if (!isEdited) {
      if (nama !== undefined && nama !== user.nama) {
        dataToUpdate.nama = nama;
        willBeEdited = true;
      }
      if (nim !== undefined && nim !== user.nim) {
        dataToUpdate.nim = nim;
        willBeEdited = true;
      }
      if (fakultas !== undefined && fakultas !== user.fakultas) {
        dataToUpdate.fakultas = fakultas;
        willBeEdited = true;
      }
    }

    if (willBeEdited) {
      dataToUpdate.is_edited = true;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      res.status(200).json({ message: "Tidak ada perubahan", user });
      return;
    }

    const updatedUser = await prisma.users.update({
      where: { user_id: req.userId },
      data: dataToUpdate,
      select: {
        user_id: true,
        nama: true,
        nim: true,
        email: true,
        role: true,
        fakultas: true,
        profile_pic: true,
        is_edited: true,
        total_poin: true,
        created_at: true,
      },
    });

    res.status(200).json({
      message: "Profil berhasil diperbarui",
      user: {
        ...updatedUser,
        fakultas: updatedUser.fakultas || "",
        profile_pic: Number(updatedUser.profile_pic),
        total_poin: Number(updatedUser.total_poin),
      },
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    if (error.code === 'P2002') {
      res.status(409).json({ message: "Email atau NIM sudah digunakan" });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

export default { register, login, getMe, updateProfile };
