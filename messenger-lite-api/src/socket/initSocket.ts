import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyJWT } from "../utils/jwt";
import { updateUserPresence } from "../helpers/presence.helper";
import { prisma } from "../configs/prisma.config";

const convRoom = (id: string) => `conv:${id}`;

// Array to keep track of connected users
const joinedUsers: { userId: string; socket: Socket }[] = [];

function getTokenFromHeaders(headers: any) {
  const authHeader = headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

export const initSocket = (server: any) => {
  const origins = (process.env.SOCKET_CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const io = new SocketIOServer(server, {
    cors: {
      origin: origins,
      credentials: true,
    },
  });

  // Auth middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        getTokenFromHeaders(socket.handshake.headers);

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

    // Add to joinedUsers
    joinedUsers.push({ userId, socket });
    console.log(
      "Current joinedUsers:",
      joinedUsers.map((u) => u.userId)
    );

    // manual status update
    socket.on("set_status", async ({ isOnline }: { isOnline: boolean }) => {
      await updateUserPresence(io as IOServerWithHelpers, userId, isOnline);
      console.log(`${userId} is now ${isOnline ? "online" : "offline"}`);
    });

    // conversation join
    socket.on("join_conversation", async (conversationId: string) => {
      const member = await prisma.conversationParticipant.findFirst({
        where: { conversationId, userId },
        select: { id: true },
      });
      if (!member) return;
      socket.join(convRoom(conversationId));
      console.log(`${userId} joined conv:${conversationId}`);
    });

    // conversation leave
    socket.on("leave_conversation", (conversationId: string) => {
      socket.leave(convRoom(conversationId));
      console.log(`${userId} left conv:${conversationId}`);
    });

    // typing
    socket.on("typing", ({ conversationId }) => {
      if (!conversationId) return;
      io.to(convRoom(conversationId)).emit("user_typing", {
        conversationId,
        userId,
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", userId, socket.id);
      // Remove from joinedUsers
      const index = joinedUsers.findIndex(
        (u) => u.userId === userId && u.socket.id === socket.id
      );
      if (index !== -1) {
        joinedUsers.splice(index, 1);
      }
      console.log(
        "Current joinedUsers:",
        joinedUsers.map((u) => u.userId)
      );
    });
  });

  return Object.assign(io, { convRoom, joinedUsers });
};

export type IOServerWithHelpers = ReturnType<typeof initSocket>;
