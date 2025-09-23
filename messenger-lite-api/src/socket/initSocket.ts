import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "../configs/prisma.config";
import { verifyJWT } from "../utils/jwt";

const convRoom = (id: string) => `conv:${id}`;
function getTokenFromHeaders(headers: any) {
  const authHeader = headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}
export const initSocket = (server: any) => {
  // origin list from env
  const connectedUsers: { userId: string; socketId: string }[] = [];
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

  // Auth middleware (token verify)
  io.use((socket, next) => {
    try {
      // const token = socket.handshake.auth?.token as string | undefined;
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        getTokenFromHeaders(socket.handshake.headers);
      if (!token) return next(new Error("Missing token"));
      const { id } = verifyJWT(token);
      socket.data.userId = id;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as string;
    console.log("Socket connected:", userId, socket.id);

    // set manual status
    socket.on("set_status", async ({ isOnline }: { isOnline: boolean }) => {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline,
          lastSeenAt: isOnline ? null : new Date(),
        },
      });

      // myself presence
      io.to(userId).emit("presence_self", { userId, isOnline });

      // converse presence broadcast
      const convs = await prisma.conversationParticipant.findMany({
        where: { userId },
        select: { conversationId: true },
      });
      convs.forEach((c) =>
        io.to(convRoom(c.conversationId)).emit("presence_update", {
          userId,
          isOnline,
        })
      );
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
    });
  });

  return Object.assign(io, { convRoom });
};

export type IOServerWithHelpers = ReturnType<typeof initSocket>;
