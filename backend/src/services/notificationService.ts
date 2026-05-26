import { prisma } from "../lib/prisma.js";

/**
 * Creates a notification for a single user.
 */
export async function createNotification(
  userId: string,
  pesan: string,
  tipe: "system" | "admin" = "system",
): Promise<void> {
  try {
    await prisma.notifications.create({
      data: {
        user_id: userId,
        pesan,
        tipe,
      },
    });
  } catch (error) {
    console.error("createNotification error:", error);
  }
}

/**
 * Creates the same notification for ALL users (admin broadcast).
 * Returns the count of notifications created.
 */
export async function broadcastNotification(pesan: string): Promise<number> {
  try {
    const users = await prisma.users.findMany({
      select: { user_id: true },
    });

    if (users.length === 0) return 0;

    const data = users.map((u: { user_id: string }) => ({
      user_id: u.user_id,
      pesan,
      tipe: "admin",
    }));

    const result = await prisma.notifications.createMany({ data });
    return result.count;
  } catch (error) {
    console.error("broadcastNotification error:", error);
    return 0;
  }
}
