import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyJWT } from "../utils/jwt";
import { updateUserPresence } from "../helpers/presence.helper";
import { prisma } from "../configs/prisma.config";
import { initDeviceSocket, joinedDevices, Device } from "./device.socket";

const convRoom = (id: string) => `conv:${id}`;

export const initSocket = (server: any) => {
  const origins = (process.env.SOCKET_CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const io = new SocketIOServer(server, {
    cors: { origin: origins, credentials: true },
  });

  // Auth middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Missing token"));

      const { id } = verifyJWT(token);
      socket.data.userId = id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    console.log("Socket connected:", userId, "Socket ID:", socket.id);

    // --- Device socket integration ---
    initDeviceSocket(io as IOServerWithHelpers, socket);

    // Join user's personal room (for presence, notifications)
    socket.join(userId);

    // Manual status update
    socket.on("set_status", async ({ isOnline }: { isOnline: boolean }) => {
      await updateUserPresence(io as IOServerWithHelpers, userId, isOnline);
      console.log(`${userId} is now ${isOnline ? "online" : "offline"}`);
    });

    // Conversation join
    socket.on("join_conversation", async (conversationId: string) => {
      const member = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
        select: { id: true },
      });

      if (!member) {
        const peerUserId = conversationId;
        const conversation = await prisma.conversation.findFirst({
          where: {
            type: "DIRECT",
            participants: { some: { userId } },
            AND: { participants: { some: { userId: peerUserId } } },
          },
          include: { participants: true },
        });
        if (!conversation) return;
        socket.join(convRoom(conversation.id));
        console.log(`${userId} joined conv:${conversation.id}`);
      } else {
        socket.join(convRoom(conversationId));
        console.log(`${userId} joined conv:${conversationId}`);
      }
    });

    // Leave conversation
    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(convRoom(conversationId));
      console.log(`${userId} left conv:${conversationId}`);
    });

    // Typing
    socket.on("typing", ({ conversationId, userId }) => {
      if (!conversationId) return;
      io.to(convRoom(conversationId)).emit("user_typing", {
        conversationId,
        userId,
      });
    });

    // Disconnect handled inside device.socket.ts for multi-tab device tracking
  });

  return Object.assign(io, { convRoom, joinedDevices });
};

export type IOServerWithHelpers = ReturnType<typeof initSocket>;
