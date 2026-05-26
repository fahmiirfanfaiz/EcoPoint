import { Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middleware/auth.js";
import { broadcastNotification } from "../services/notificationService.js";

// ─── User Endpoints ────────────────────────────────────────

/**
 * GET /api/notifications
 * Returns the latest 20 notifications for the authenticated user.
 */
export const getNotifications = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId!;

    const notifications = await prisma.notifications.findMany({
      where: { user_id: userId },
      select: {
        notifications_id: true,
        pesan: true,
        tipe: true,
        is_read: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notifications.count({
      where: { user_id: userId, is_read: false },
    });

    res.status(200).json({ notifications, unread_count: unreadCount });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marks a single notification as read.
 */
export const markAsRead = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId!;
    const notificationId = req.params.id;

    await prisma.notifications.updateMany({
      where: {
        notifications_id: notificationId,
        user_id: userId,
      },
      data: { is_read: true },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Marks ALL notifications for the user as read.
 */
export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId!;

    await prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ─── Admin Endpoints ───────────────────────────────────────

/**
 * POST /api/admin/notifications
 * Broadcasts a notification to ALL users.
 * Body: { pesan: string }
 */
export const sendBroadcast = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { pesan } = req.body;

    if (!pesan || typeof pesan !== "string" || pesan.trim() === "") {
      res.status(400).json({ message: "Pesan tidak boleh kosong" });
      return;
    }

    const count = await broadcastNotification(pesan.trim());

    res.status(201).json({
      success: true,
      message: `Pengumuman terkirim ke ${count} pengguna.`,
      count,
    });
  } catch (error) {
    console.error("sendBroadcast error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET /api/admin/notifications
 * Lists all admin-type announcements (unique pesan + created_at combos).
 */
export const listBroadcasts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // Get distinct announcements by grouping on pesan + created_at
    const broadcasts = await prisma.notifications.findMany({
      where: { tipe: "admin" },
      select: {
        notifications_id: true,
        pesan: true,
        created_at: true,
      },
      distinct: ["pesan"],
      orderBy: { created_at: "desc" },
      take: 50,
    });

    res.status(200).json({ broadcasts });
  } catch (error) {
    console.error("listBroadcasts error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * DELETE /api/admin/notifications/:id
 * Deletes a broadcast announcement by matching its pesan text across all users.
 * We find the notification by id first, then delete all with that pesan + tipe=admin.
 */
export const deleteBroadcast = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const notificationId = req.params.id;

    // Find the notification to get the pesan text
    const notification = await prisma.notifications.findUnique({
      where: { notifications_id: notificationId },
      select: { pesan: true, tipe: true },
    });

    if (!notification || notification.tipe !== "admin") {
      res.status(404).json({ message: "Pengumuman tidak ditemukan" });
      return;
    }

    // Delete all notifications with this pesan from all users
    const result = await prisma.notifications.deleteMany({
      where: { pesan: notification.pesan, tipe: "admin" },
    });

    res.status(200).json({
      success: true,
      message: `${result.count} notifikasi dihapus.`,
    });
  } catch (error) {
    console.error("deleteBroadcast error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendBroadcast,
  listBroadcasts,
  deleteBroadcast,
};
