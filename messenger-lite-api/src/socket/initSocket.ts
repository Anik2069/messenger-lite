import { Server as SocketIOServer, Socket } from "socket.io";
import { prisma } from "../configs/prisma.config";
import { verifyJWT } from "../utils/jwt";

const convRoom = (id: string) => `conv:${id}`;

const userSockets = new Map<string, Set<string>>(); // userId -> socketIds
const socketUser = new Map<string, string>(); // socketId -> userId

function parseCookie(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  header.split(/;\s*/).forEach((p) => {
    const idx = p.indexOf("=");
    if (idx > -1) {
      const k = decodeURIComponent(p.slice(0, idx));
      const v = decodeURIComponent(p.slice(idx + 1));
      out[k] = v;
    }
  });
  return out;
}

async function joinAllConversationRooms(socket: Socket, userId: string) {
  const parts = await prisma.conversationParticipant.findMany({
    where: { userId },
    select: { conversationId: true },
  });
  parts.forEach((p) => socket.join(convRoom(p.conversationId)));
  return parts.map((p) => p.conversationId);
}

export const initSocket = (server: any) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://172.21.16.3:3000",
        "http://10.81.100.22:3001",
        "http://10.81.100.22:3002",
        "http://192.168.31.152:3000",
      ],
      credentials: true,
    },
  });

  io.on("connection", async (socket) => {
    try {
      const cookies = parseCookie(
        socket.handshake.headers.cookie as string | undefined
      );
      const raw = cookies["accessToken"];
      const { id: userId } = verifyJWT(raw);

      // mark presence
      await prisma.user.update({
        where: { id: userId },
        data: { isOnline: true },
      });

      socketUser.set(socket.id, userId);
      if (!userSockets.has(userId)) userSockets.set(userId, new Set());
      userSockets.get(userId)!.add(socket.id);

      socket.join(userId);
      const convIds = await joinAllConversationRooms(socket, userId);

      io.to(userId).emit("presence_self", { userId, isOnline: true });
      convIds.forEach((cid) =>
        io.to(convRoom(cid)).emit("presence_update", { userId, isOnline: true })
      );

      socket.emit("connected_ok", { userId, roomsJoined: convIds.length });
    } catch (e) {
      socket.emit("auth_error", { message: "Unauthenticated socket" });
      return socket.disconnect(true);
    }
    socket.on("typing", ({ conversationId, username }) => {
      if (!conversationId) return;
      io.to(convRoom(conversationId)).emit("user_typing", {
        conversationId,
        username,
      });
    });

    socket.on("disconnect", async () => {
      const userId = socketUser.get(socket.id);
      if (!userId) return;

      // clean maps
      socketUser.delete(socket.id);
      const set = userSockets.get(userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) userSockets.delete(userId);
      }

      if (!userSockets.has(userId)) {
        await prisma.user.update({
          where: { id: userId },
          data: { isOnline: false },
        });

        const parts = await prisma.conversationParticipant.findMany({
          where: { userId },
          select: { conversationId: true },
        });
        io.to(userId).emit("presence_self", { userId, isOnline: false });
        parts.forEach((p) =>
          io
            .to(convRoom(p.conversationId))
            .emit("presence_update", { userId, isOnline: false })
        );
      }
    });
  });
  function disconnectUser(userId: string) {
    const set = userSockets.get(userId);
    if (!set) return 0;
    for (const sid of set) {
      const s = io.sockets.sockets.get(sid);
      if (s) s.disconnect(true);
    }
    return set.size;
  }

  return Object.assign(io, { disconnectUser, convRoom });
};

export type IOServerWithHelpers = ReturnType<typeof initSocket>;
