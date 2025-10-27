import { prisma } from "../configs/prisma.config";
import type { IOServerWithHelpers } from "../socket/initSocket";

export async function updateUserPresence(
  io: IOServerWithHelpers,
  userId: string,
  isOnline: boolean,
  updateMode: boolean = false
) {
  try {
    // 1) Update UserSettings activeStatus if in updateMode
    if (updateMode) {
      await prisma.userSettings.upsert({
        where: { userId },
        update: { activeStatus: isOnline },
        create: {
          userId,
          activeStatus: isOnline,
          soundNotifications: true,
          theme: "LIGHT",
        },
      });
    }

    // 2) Update User isOnline status
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isOnline: true, settings: true },
    });

    if (!existingUser) return null;

    // Only update if status changed
    if (existingUser.isOnline !== isOnline) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline,
          ...(isOnline ? {} : { lastSeenAt: new Date() }),
        },
      });
    }

    // 3) Emit presence to self
    io.to(userId).emit("presence_self", {
      userId,
      isOnline,
      lastSeenAt: isOnline ? null : new Date(),
    });

    // 4) Emit to ALL other connected users
    io.except(userId).emit("presence_update", {
      userId,
      isOnline,
      lastSeenAt: isOnline ? null : new Date(),
    });

    console.log(
      `📢 Presence update: User ${userId} is now ${
        isOnline ? "online" : "offline"
      }`
    );
    console.log(`   → Sent to: self (${userId}) and all other connected users`);

    // 5) Return updated user info
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        isOnline: true,
        lastSeenAt: true,
        settings: {
          select: {
            activeStatus: true,
            theme: true,
            soundNotifications: true,
          },
        },
      },
    });

    return updatedUser;
  } catch (error) {
    console.error("Error updating user presence:", error);
    return null;
  }
}
