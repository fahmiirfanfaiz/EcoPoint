import { Request, Response } from "express";
import { prisma } from "./authController";
import webpush from "web-push";

webpush.setVapidDetails(
  'mailto:your-email@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const subscribe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, subscription, device } = req.body;

    // ✅ Fixed: prisma.pushSubscription → prisma.notifications
    await prisma.notifications.upsert({
      where: { endpoint: subscription.endpoint },
      update: { user_id: userId, device },
      create: {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        device,
        pesan: subscription.message || "Push notification"
      }
    });

    res.status(201).json({ message: "Subscription saved!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal simpan subscription" });
  }
};

export const sendNotification = async (req: Request, res: Response) => {
  // TODO: implementasi ngirim notif
};

export default { subscribe, sendNotification };