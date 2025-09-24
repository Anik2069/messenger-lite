import { prisma } from "../configs/prisma.config";
import type { IOServerWithHelpers } from "../socket/initSocket";

export async function updateUserPresence(
  io: IOServerWithHelpers,
  userId: string,
  isOnline: boolean
) {
  // Update DB
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

  // Notify self
  io.to(userId).emit("presence_self", { userId, isOnline });
  // Notify others in the same room

  // Broadcast to all conversations
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

  return updatedUser;
}
