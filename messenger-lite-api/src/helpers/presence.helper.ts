import { prisma } from "../configs/prisma.config";
import type { IOServerWithHelpers } from "../socket/initSocket";

export async function updateUserPresence(
  io: IOServerWithHelpers,
  userId: string,
  isOnline: boolean
) {
  // 1) Update DB
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      isOnline,
      lastSeenAt: isOnline ? null : new Date(),
    },
    select: {
      id: true,
      username: true,
      isOnline: true,
      lastSeenAt: true,
    },
  });

  // 2) Notify self (requires socket.join(userId) on connect)
  io.to(userId).emit("presence_self", { userId, isOnline });

  // 3) Broadcast to all conversations the user is in (you already had this)
  const convs = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true },
  });

  convs.forEach((c) =>
    io.to(io.convRoom(c.conversationId)).emit("presence_update", {
      userId,
      isOnline,
    })
  );

  io.except(userId).emit("presence_global", { userId, isOnline });

  return updatedUser;
}
