import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyJWT } from "../utils/jwt";
import { updateUserPresence } from "../helpers/presence.helper";
import { prisma } from "../configs/prisma.config";
import { initDeviceSocket, joinedDevices, Device } from "./device.socket";
import { getUserConversationsSorted } from "../controllers/message/SendMessageHandler.controller";
import emitToRecipients from "../helpers/socketEmit.helper";

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


    //Audio/Video Call

    // User A clicks call → emits "call_user" with toUserIds and callType.
    // Server receives it → emits "call_received" to the recipient(s).
    // Recipient sees an incoming call notification.
    socket.on("call_user", async ({ toUerIds, callType }: { toUerIds: string | string[], callType: "audio" | "video" }) => {
      emitToRecipients(io as IOServerWithHelpers, "call_received", toUerIds, { callType, fromUserId: userId });
    })


    // Triggered when the recipient answers the call.
    // Server forwards "call_answered" to User A.
    // Caller now knows the recipient has accepted → can start WebRTC negotiation.
    socket.on("call_answered", ({ toUserIds }: { toUserIds: string | string[] }) => {
      emitToRecipients(io as IOServerWithHelpers, "call_answered", toUserIds, { fromUserId: userId });
    });


    // Part of WebRTC handshake (SDP offer).
    // After call is answered, the caller creates an offer describing how they want to send/receive media. 
    // Caller creates SDP offer → emits "webrtc_offer".
    // Server forwards it to the recipient → recipient uses it to set remote description.
    socket.on("webrtc_offer", ({ toUserIds, sdp }: { toUserIds: string | string[]; sdp: any }) => {
      emitToRecipients(io as IOServerWithHelpers, "webrtc_offer", toUserIds, { fromUserId: userId, sdp });
    });


    // Response to webrtc_offer.
    // Recipient of the offer sends back an SDP answer.
    // Recipient receives offer → sets remote description → creates answer → emits "webrtc_answer".
    // Server forwards it back to the caller → caller sets remote description.
    socket.on("webrtc_answer", ({ toUserIds, sdp }: { toUserIds: string | string[]; sdp: any }) => {
      emitToRecipients(io as IOServerWithHelpers, "webrtc_answer", toUserIds, { fromUserId: userId, sdp });
    });

    // ICE candidates are needed to actually establish the P2P connection.
    // These are network addresses that WebRTC tries to use to connect both peers.
    socket.on("webrtc_ice_candidate", ({ toUserIds, candidate }: { toUserIds: string | string[]; candidate: any }) => {
      emitToRecipients(io as IOServerWithHelpers, "webrtc_ice_candidate", toUserIds, { fromUserId: userId, candidate });
    });

    // Triggered when either side hangs up.
    // Notifies the other peer to close the WebRTC connection and UI.
    socket.on("call_ended", ({ toUserIds }: { toUserIds: string | string[] }) => {
      emitToRecipients(io as IOServerWithHelpers, "call_ended", toUserIds, { fromUserId: userId });
    });


    socket.on("disconnect", async () => {
      console.log("Socket disconnected:", userId, "Socket ID:", socket.id);
      // Note: Device socket will handle the actual presence update for multi-tab
    });
  });

  return Object.assign(io, { convRoom, joinedDevices });
};

export type IOServerWithHelpers = ReturnType<typeof initSocket>;
