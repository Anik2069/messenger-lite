import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyJWT } from "../utils/jwt";
import { updateUserPresence } from "../helpers/presence.helper";
import { prisma } from "../configs/prisma.config";
import { initDeviceSocket, joinedDevices } from "./device.socket";
// import emitToRecipients from "../helpers/socketEmit.helper"; 
import { initCallSocket } from "./call.socket";

const convRoom = (id: string) => `conv:${id}`;

export const initSocket = (server: any) => {
  const origins = (process.env.SOCKET_CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const io = new SocketIOServer(server, {
    cors: { origin: origins, credentials: true },
  });

  // Initialize Call Namespace
  initCallSocket(io);

  // === CHAT NAMESPACE (/chat) ===
  const chatNamespace = io.of("/chat");

  // Middleware for Chat Namespace
  chatNamespace.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Missing token"));

      const { id } = verifyJWT(token);

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

  chatNamespace.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    const userSettings = socket.data.userSettings;

    console.log("[ChatSocket] connected:", userId, "Socket ID:", socket.id);

    // Provide io instance with helpers to legacy functions if needed
    // But notice `initDeviceSocket` might expect the main io or a namespace. 
    // If device socket tracks global presence, it might need to match this namespace.
    // For now, we pass `chatNamespace` as `io`.
    initDeviceSocket(chatNamespace as any, socket);

    socket.join(userId);

    const initialOnlineStatus = userSettings?.activeStatus ?? true;

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
          chatNamespace as any,
          userId,
          isOnline,
          updateMode
        );
      }
    );

    updateUserPresence(
      chatNamespace as any,
      userId,
      initialOnlineStatus,
      false
    );

    socket.on("join_conversation", async (conversationId: string) => {
      // Direct user ID check (legacy logic preservation)
      if (conversationId.length === 36) {
        const isConversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (isConversation) {
          const member = await prisma.conversationParticipant.findFirst({
            where: { conversationId, userId },
            select: { id: true },
          });

          if (member) {
            socket.join(convRoom(conversationId));
            return;
          }
        }
      }

      const peerUserId = conversationId;
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
      } else {
        // waiting for message
      }
    });

    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(convRoom(conversationId));
    });

    socket.on("typing", ({ conversationId, userId }) => {
      if (!conversationId) return;
      chatNamespace.to(convRoom(conversationId)).emit("user_typing", {
        conversationId,
        userId,
      });
    });

    // Handle Call Rejection from Chat Popup
    socket.on("call_rejected", ({ callId, reason }: { callId: string, reason: string }) => {
      console.log(`[ChatSocket] call_rejected by ${userId} for ${callId}`);
      // Forward to Call Namespace
      io.of("/call").to(callId).emit("call_rejected", { fromUserId: userId, callId, reason });
      // Also notify caller specifically if they are reachable? 
      // The call namespace handler should handle it.
    });

    socket.on("disconnect", async () => {
      console.log("[ChatSocket] disconnected:", userId);
    });
  });

  return Object.assign(io, { convRoom, joinedDevices });
};

export type IOServerWithHelpers = ReturnType<typeof initSocket>;
