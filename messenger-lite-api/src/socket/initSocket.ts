import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyJWT } from "../utils/jwt";
import { updateUserPresence } from "../helpers/presence.helper";
import { prisma } from "../configs/prisma.config";
import { initDeviceSocket, joinedDevices, Device } from "./device.socket";
import { getUserConversationsSorted } from "../controllers/message/SendMessageHandler.controller";

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
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Missing token"));

      const { id } = verifyJWT(token);

      // Verify user exists and get settings
      const user = await prisma.user.findUnique({
        where: { id },
        include: { settings: true },
      });

      if (!user) return next(new Error("User not found"));

      socket.data.userId = id;
      socket.data.userSettings = user.settings;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    const userSettings = socket.data.userSettings;

    console.log("Socket connected:", userId, "Socket ID:", socket.id);

    initDeviceSocket(io as IOServerWithHelpers, socket);

    // Join user's personal room (for presence, notifications)
    socket.join(userId);

    // Set initial online status based on user settings
    const initialOnlineStatus = userSettings?.activeStatus ?? true;

    // Manual status update
    socket.on(
      "set_status",
      async ({
        isOnline,
        updateMode = false,
      }: {
        isOnline: boolean;
        updateMode?: boolean;
      }) => {
        await updateUserPresence(
          io as IOServerWithHelpers,
          userId,
          isOnline,
          updateMode
        );
      }
    );

    // Send initial presence update
    updateUserPresence(
      io as IOServerWithHelpers,
      userId,
      initialOnlineStatus,
      false
    );

    // Conversation join
    socket.on("join_conversation", async (conversationId: string) => {
      console.log("conversationId----------------", conversationId);

      // Check if this is a direct user ID (not a conversation ID)
      if (conversationId.length === 36) {
        // Assuming UUID format
        const isConversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (isConversation) {
          // It's a conversation ID - join normally
          const member = await prisma.conversationParticipant.findFirst({
            where: { conversationId, userId },
            select: { id: true },
          });

          if (member) {
            socket.join(convRoom(conversationId));
            console.log(`${userId} joined conv:${conversationId}`);
            return;
          }
        }
      }

      const peerUserId = conversationId;
      // Find existing direct conversation
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          type: "DIRECT",
          participants: {
            some: { userId },
          },
          AND: {
            participants: {
              some: { userId: peerUserId },
            },
          },
        },
        include: { participants: true },
      });
      if (existingConversation) {
        socket.join(convRoom(existingConversation.id));
        console.log(
          `${userId} joined existing conv:${existingConversation.id}`
        );
      } else {
        // Do nothing. Wait for first message to create conversation.
        console.log(`User ${userId} selected peer ${peerUserId}, waiting for message to create conversation.`);
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

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", userId, "Socket ID:", socket.id);
      // Note: Device socket will handle the actual presence update for multi-tab
    });
  });

  return Object.assign(io, { convRoom, joinedDevices });
};

export type IOServerWithHelpers = ReturnType<typeof initSocket>;
