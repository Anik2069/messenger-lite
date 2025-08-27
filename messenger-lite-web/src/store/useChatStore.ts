// src/stores/useChatStore.ts
import { socket } from "@/lib/socket";
import { Chat } from "@/types/ChatType";
import { FileData, ForwardedData, Message } from "@/types/MessageType";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import axiosInstance from "@/config/axiosInstance";
import { MessageWire } from "@/types/WireTypes";
import { ApiEnvelope } from "@/types/apiTypes";
import { uuidv4 } from "@/lib/utils";

/** Normalize server payload -> local Message (ensure Date objects) */
const normalizeMessage = (m: MessageWire): Message => ({
  ...m,
  timestamp: new Date(m.timestamp),
  reactions: (m.reactions ?? []).map((r) => ({
    ...r,
    timestamp: new Date(r.timestamp),
  })),
  readBy: (m.readBy ?? []).map((r) => ({
    ...r,
    timestamp: new Date(r.timestamp),
  })),
});

/** Server may include these optional fields; keep it type-safe */
type MessageWireServer = MessageWire & {
  conversationId?: string;
  conversationType?: "DIRECT" | "GROUP";
};

type ChatState = {
  selectedChat: Chat | null;
  messages: Message[];
  otherUserTyping: string | null; // store userId (or fallback label) for UI
  isConnected: boolean;

  showSearch: boolean;
  setSelectedChat: (chat: Chat) => void;
  setMessages: (messages: Message[]) => void;
  setOtherUserTyping: (userId: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setShowSearch: (show: boolean) => void;

  onSendMessage: (
    message: string,
    type?: "text" | "file" | "forwarded",
    fileData?: FileData,
    forwardedFrom?: ForwardedData,
    currentUser?: { username: string; id: string } | null
  ) => Promise<void>;

  onAddReaction: (
    messageId: string,
    emoji: string,
    currentUser?: { username: string; id: string } | null
  ) => void;
};

export const useChatStore = create<ChatState>((set, get) => {
  if (!socket.connected) socket.connect();

  // avoid duplicate listeners in HMR
  socket.off("connect");
  socket.off("disconnect");
  socket.off("receive_message");
  socket.off("user_typing");
  socket.off("message_reaction");

  socket.on("connect", () => {
    set({ isConnected: true });
    const { user } = useAuthStore.getState();
    if (user) socket.emit("user_connected", user.id); // join personal room by userId
  });

  socket.on("disconnect", () => set({ isConnected: false }));

  /** ---------------------------
   * receive_message (type-safe)
   * -------------------------- */
  socket.on("receive_message", (incoming: MessageWireServer) => {
    // 1) replace optimistic via clientTempId, or append if new
    const serverConvoId = incoming.conversationId; // string | undefined

    set((state) => {
      const hasTemp =
        incoming.clientTempId &&
        state.messages.some((m) => m.clientTempId === incoming.clientTempId);

      if (hasTemp) {
        const normalized = normalizeMessage(incoming);
        return {
          messages: state.messages.map((m) =>
            m.clientTempId === incoming.clientTempId ? normalized : m
          ),
        };
      }

      const existsById = state.messages.some((m) => m.id === incoming.id);
      if (existsById) return state;

      return { messages: [...state.messages, normalizeMessage(incoming)] };
    });

    // 2) If this is a DIRECT chat where selectedChat.id was a peer userId,
    //    and server now gives us a conversationId, migrate selectedChat.id.
    try {
      const { selectedChat } = get();

      if (
        selectedChat &&
        selectedChat.type === "user" &&
        serverConvoId &&
        selectedChat.id !== serverConvoId
      ) {
        // Confirm this message belongs to the currently open DM:
        // Either the peer in 'to' or 'from' matches our selectedChat.id (which was the peer user id).
        const peerIdGuess = selectedChat.id;
        const belongsToOpenDM =
          incoming.to?.id === peerIdGuess || incoming.from?.id === peerIdGuess;

        if (belongsToOpenDM) {
          set({ selectedChat: { ...selectedChat, id: serverConvoId } });
        }
      }
    } catch {
      // no-op
    }
  });

  // Typing: prefer userId, fallback to username (stored as a display string)
  socket.on(
    "user_typing",
    (data: { chatId: string; userId?: string; username?: string }) => {
      const { selectedChat } = get();
      if (selectedChat && selectedChat.id === data.chatId) {
        set({ otherUserTyping: data.userId ?? data.username ?? null });
      }
    }
  );

  // Reactions
  socket.on(
    "message_reaction",
    (payload: {
      messageId: string;
      emoji: string;
      userId?: string;
      username?: string;
      timestamp?: string | number | Date;
    }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === payload.messageId
            ? {
                ...msg,
                reactions: [
                  ...msg.reactions,
                  {
                    emoji: payload.emoji,
                    // Your Message type likely has 'username' on reactions.
                    // We store userId if present; otherwise keep username as-is.
                    username: payload.userId ?? payload.username ?? "Unknown",
                    timestamp: payload.timestamp
                      ? new Date(payload.timestamp)
                      : new Date(),
                  },
                ],
              }
            : msg
        ),
      }));
    }
  );

  return {
    selectedChat: null,
    messages: [],
    otherUserTyping: null,
    isConnected: false,
    showSearch: false,

    setSelectedChat: (chat) => set({ selectedChat: chat }),
    setMessages: (messages) => set({ messages }),
    setOtherUserTyping: (userId) => set({ otherUserTyping: userId }),
    setIsConnected: (connected) => set({ isConnected: connected }),
    setShowSearch: (show) => set({ showSearch: show }),

    /** -------------------------------------------------
     * Send message (ID-first)
     * Works if Chat.id is a conversationId OR peer userId
     * ------------------------------------------------ */
    onSendMessage: async (
      text,
      type = "text",
      fileData,
      forwardedFrom,
      currentUser
    ) => {
      const { selectedChat } = get();
      if (!selectedChat || !currentUser) return;

      const clientTempId = uuidv4();
      const tempId = `temp-${Date.now()}`;
      const isDirect = selectedChat.type === "user";

      // Optimistic UI
      const optimistic: Message = {
        id: tempId,
        clientTempId,
        from: {
          username: currentUser?.username ?? "Unknown",
          id: currentUser?.id ?? "0",
        },
        to: { username: selectedChat.name, id: selectedChat.id },
        message: text,
        messageType: type,
        fileData,
        forwardedFrom,
        isGroupMessage: !isDirect,
        timestamp: new Date(),
        reactions: [],
        readBy: isDirect
          ? []
          : [
              {
                username: currentUser?.username ?? "Unknown",
                timestamp: new Date(),
              },
            ],
      };

      set((state) => ({ messages: [...state.messages, optimistic] }));

      // For DIRECT: send BOTH conversationId and recipientId = selectedChat.id
      // - If selectedChat.id is a real convo → server uses it.
      // - If it's actually a peer userId → server falls back to recipient and creates/finds the DM.
      console.log(selectedChat, "selectedChat---------------");
      const body = {
        authorId: currentUser.id,
        text,
        type: type.toUpperCase(), // "TEXT" | "FILE" | "FORWARDED"
        ...(isDirect
          ? {
              conversationId: selectedChat.id,
              recipientId: selectedChat.id,
            }
          : {
              conversationId: selectedChat.id, // group convo id
            }),
        fileData: fileData
          ? {
              url: fileData.url,
              filename: fileData.filename,
              mimetype: fileData.mimetype,
              size: fileData.size,
            }
          : undefined,
        forwardedFrom: forwardedFrom?.originalSender,
        clientTempId,
      };

      try {
        const res = await axiosInstance.post<
          ApiEnvelope<{ message: MessageWireServer }>
        >("/messages", body);

        const savedWire = res.data?.results?.message;
        if (savedWire) {
          const normalized = normalizeMessage(savedWire);
          set((state) => {
            const byClientTemp = state.messages.some(
              (m) => m.clientTempId && m.clientTempId === clientTempId
            );
            if (byClientTemp) {
              return {
                messages: state.messages.map((m) =>
                  m.clientTempId === clientTempId ? normalized : m
                ),
              };
            }
            const byTempId = state.messages.some((m) => m.id === tempId);
            if (byTempId) {
              return {
                messages: state.messages.map((m) =>
                  m.id === tempId ? normalized : m
                ),
              };
            }
            return state; // already replaced by socket event
          });
        }
      } catch (err) {
        // rollback optimistic on error
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== tempId),
        }));
        console.error("send failed", err);
      }
    },

    onAddReaction: (messageId, emoji, currentUser) => {
      socket.emit("message_reaction", {
        messageId,
        emoji,
        userId: currentUser?.id, // ID-first
        username: currentUser?.username, // fallback for older servers
      });
    },
  };
});
