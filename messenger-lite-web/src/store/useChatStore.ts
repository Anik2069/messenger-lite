// src/store/useChatStore.ts
import { create } from "zustand";
import axiosInstance from "@/config/axiosInstance";
import { socket } from "@/lib/socket";
import { uuidv4 } from "@/lib/utils";
import { Chat } from "@/types/ChatType";
import {
  FileData,
  ForwardedData,
  Message,
  MessageKind,
} from "@/types/MessageType";
import { SendMessagePayload, toServerType } from "@/types/sendMessage";
import { toast } from "react-toastify";
import { HOST, MEDIA_HOST } from "@/constant";
import { useConversationStore } from "./useConversationStore";
import { User } from "@/types/UserType";

interface ServerMessage {
  id: string;
  clientTempId?: string;
  conversationId: string;
  author?: { id: string; username?: string };
  authorId?: string;
  conversation?: { name?: string; type?: string };
  message?: string;
  messageType?: string;
  fileUrl?: string;
  fileName?: string;
  fileMime?: string;
  fileSize?: number;
  fileData?: object;
  forwardedFrom?: string;
  createdAt?: string | number | Date;
  reactions?: Array<{
    emoji: string;
    user?: { username?: string };
    userId?: string;
    createdAt?: string | number | Date;
  }>;
  receipts?: Array<{
    user?: { username?: string };
    userId?: string;
    readAt?: string | number | Date;
  }>;
}

function mapServerMessage(m: ServerMessage): Message {
  const messageType = (m.messageType ?? "TEXT") as MessageKind;

  return {
    id: m.id,
    clientTempId: m.clientTempId,
    conversationId: m.conversationId,

    from: {
      id: m.author?.id ?? m.authorId ?? "",
      username: m.author?.username ?? "Unknown",
    },
    to: {
      id: m.conversationId,
      username: m.conversation?.name ?? "",
    },

    message: m.message ?? "",
    messageType, // always "text" | "FILE" | "forwarded"

    fileData: m.fileUrl
      ? {
          url: m.fileUrl,
          filename: m.fileName ?? "",
          originalName: m.fileName ?? "",
          mimetype: m.fileMime ?? "",
          size: m.fileSize ?? 0,
        }
      : undefined,

    forwardedFrom: m.forwardedFrom
      ? { originalSender: m.forwardedFrom }
      : undefined,

    isGroupMessage: m.conversation?.type === "GROUP",
    timestamp: new Date(m.createdAt ?? Date.now()),

    reactions: (m.reactions ?? []).map((r) => ({
      emoji: r.emoji,
      username: r.user?.username ?? r.userId ?? "",
      userId: r.userId,
      timestamp: new Date(r.createdAt ?? Date.now()),
    })),

    readBy: (m.receipts ?? []).map((rc) => ({
      username: rc.user?.username ?? rc.userId ?? "",
      userId: rc.userId,
      timestamp: new Date(rc.readAt ?? Date.now()),
    })),
  };
}

export type ChatState = {
  selectedChat: Chat | null;
  messages: Message[];
  otherUserTyping: string | null;
  isConnected: boolean;
  showSearch: boolean;

  selectedUserInfo: User | null;

  // Pagination state
  messageCursor: string | null;
  hasMoreMessages: boolean;
  isLoadingMessages: boolean;

  // setters
  setSelectedChat: (chat: Chat | null) => void;
  setMessages: (messages: Message[]) => void;
  setOtherUserTyping: (userId: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setShowSearch: (show: boolean) => void;
  resetPagination: () => void;

  // actions
  emitTyping: ({ user }: { user: { username: string } }) => void;
  onSendMessage: (
    text: string,
    type?: "TEXT" | "FILE" | "forwarded" | "VOICE",
    fileData?: object,
    voiceUrl?: string | undefined,
    forwardedFrom?: ForwardedData,
    currentUser?: { username: string; id: string } | null
  ) => Promise<void>;
  onAddReaction: (
    messageId: string,
    emoji: string,
    currentUser?: { username: string; id: string } | null
  ) => Promise<void>;
  handleClearConversation: (conversationId: string) => void;
  handleFetchUsersInfo: (id: string) => void;
  setSelectedUserInfo: () => void;
  loadMoreMessages: () => Promise<void>;
  fetchConversationsMedia: (id: string) => void;
  selectedMedia: any[];
};

let listenersInitialized = false;

export const useChatStore = create<ChatState>((set, get) => {
  if (!listenersInitialized) {
    listenersInitialized = true;
    // cleanup old listeners
    // socket.off("connect");
    // socket.off("disconnect");
    socket.off("receive_message");
    socket.off("user_typing");
    socket.off("message_reaction");

    // socket.on("connect", () => set({ isConnected: true }));
    // socket.on("disconnect", () => set({ isConnected: false }));

    // socket.on("receive_message", (raw: unknown) => {
    //   const msg = mapServerMessage(raw as ServerMessage);
    //   console.log(msg, "receive msg");
    //   set((state) => {
    //     // replace optimistic message if clientTempId matched
    //     if (msg.clientTempId) {
    //       const hasTemp = state.messages.some(
    //         (m) => m.clientTempId === msg.clientTempId
    //       );
    //       if (hasTemp) {
    //         return {
    //           messages: state.messages.map((m) =>
    //             m.clientTempId === msg.clientTempId ? msg : m
    //           ),
    //         };
    //       }
    //     }

    //     // skip duplicate messages
    //     if (state.messages.some((m) => m.id === msg.id)) return state;
    //     console.log(state, "state");
    //     return { messages: [...state.messages, msg] };
    //   });
    // });

    socket.on("receive_message", (raw: unknown) => {
      const msg = mapServerMessage(raw as ServerMessage);
      console.log(msg, "receive msg");

      set((state) => {
        // ✅ Replace logic: allow multiple messages with same clientTempId (for multiple file sends)
        if (msg.clientTempId) {
          const hasExactTemp = state.messages.some(
            (m) =>
              m.clientTempId === msg.clientTempId &&
              m.messageType === msg.messageType &&
              (m.fileData as FileData)?.url === (msg.fileData as FileData)?.url
          );

          if (hasExactTemp) {
            return {
              messages: state.messages.map((m) =>
                m.clientTempId === msg.clientTempId &&
                (m.fileData as FileData)?.url ===
                  (msg.fileData as FileData)?.url
                  ? msg
                  : m
              ),
            };
          }
        }

        // ✅ Still skip exact duplicates from backend
        const alreadyExists = state.messages.some((m) => m.id === msg.id);
        if (alreadyExists) return state;

        // ✅ Append new message normally
        console.log(state, "state");
        return { messages: [...state.messages, msg] };
      });
    });

    // Typing indicator
    socket.on(
      "user_typing",
      (data: { conversationId: string; username?: string }) => {
        const { selectedChat } = get();
        if (selectedChat && selectedChat.id === data.conversationId) {
          set({ otherUserTyping: data.username ?? null });
        }
      }
    );

    // Reactions
    socket.on("message_reaction", (payload) => {
      set((state) => ({
        messages: state.messages.map((msg) => {
          if (msg.id !== payload.messageId) return msg;

          const actor = payload.username || payload.userId || "Unknown";

          if (payload.action === "removed") {
            return {
              ...msg,
              reactions: msg.reactions.filter(
                (r) => !(r.emoji === payload.emoji && r.username === actor)
              ),
            };
          }

          return {
            ...msg,
            reactions: [
              ...msg.reactions,
              {
                emoji: payload.emoji,
                username: actor,
                timestamp: payload.timestamp
                  ? new Date(payload.timestamp)
                  : new Date(),
              },
            ],
          };
        }),
      }));
    });
  }

  return {
    selectedMedia: [],
    selectedChat: null,
    messages: [],
    otherUserTyping: null,
    isConnected: socket.connected,
    showSearch: false,
    selectedUserInfo: null,

    // Pagination state
    messageCursor: null,
    hasMoreMessages: false,
    isLoadingMessages: false,

    setSelectedChat: (chat) => set({ selectedChat: chat }),
    setSelectedUserInfo: () => set({ selectedChat: null }),
    setMessages: (messages) => set({ messages }),
    setOtherUserTyping: (userId) => set({ otherUserTyping: userId }),
    setIsConnected: (connected) => set({ isConnected: connected }),
    setShowSearch: (show) => set({ showSearch: show }),
    resetPagination: () =>
      set({
        messageCursor: null,
        hasMoreMessages: false,
        isLoadingMessages: false,
      }),

    emitTyping: ({ user }) => {
      const { selectedChat } = get();
      if (!selectedChat || !user) return;

      socket.emit("typing", {
        conversationId: selectedChat.id,
        username: user.username,
      });
    },

    onSendMessage: async (
      text,
      type = "TEXT",
      fileData,
      voiceUrl,
      forwardedFrom,
      currentUser
    ) => {
      const { selectedChat } = get();
      if (!selectedChat || !currentUser) return;

      const clientTempId = uuidv4();
      const tempId = `temp-${Date.now()}`;

      // Optimistic UI
      const optimistic: Message[] = [];

      const formData = new FormData();

      formData.append("conversationId", selectedChat.id);
      if (selectedChat.type === "user") {
        formData.append("recipientId", selectedChat.id);
      }
      formData.append("message", text || "");
      formData.append("messageType", toServerType(type));
      formData.append("clientTempId", clientTempId);

      if (forwardedFrom) {
        formData.append("forwardedFrom", forwardedFrom.originalSender);
      }

      // If single or multiple files
      if (fileData) {
        const files = Array.isArray(fileData) ? fileData : [fileData];
        files.forEach((file) => {
          // file should be a File object from input
          formData.append("files", file as unknown as Blob);
        });
      }
      // handle voice message
      if (voiceUrl) {
        // Convert voice blob if needed
        try {
          const blob = await fetch(voiceUrl).then((res) => res.blob());
          console.log(blob, "blob");
          formData.append("files", blob, "voice-message.wav");
        } catch (e) {
          console.error("Voice file blob fetch failed", e);
        }
      }

      try {
        const res = await axiosInstance.post("messages", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const saved = res.data?.data;

        if (saved) {
          const firstMsg = Array.isArray(saved) ? saved[0] : saved;
          const realConvId = firstMsg.conversationId;

          const { selectedChat } = get();

          if (selectedChat && selectedChat.id !== realConvId) {
            set((state) => ({
              selectedChat: {
                ...state.selectedChat!,
                id: realConvId,
              },
            }));

            socket.emit("join_conversation", realConvId);
          }
        }
      } catch (err) {
        // rollback optimistic
        set((state) => ({
          messages: state.messages.filter((m) => !optimistic.includes(m)),
        }));
        // console.error("send failed", err);
        const response = err as unknown as {
          response: { data: { message: string } };
        };
        if (response?.response?.data?.message) {
          toast.error(
            response.response.data.message || "Failed to send message"
          );
          // console.log();
          // TODO : add error message to set state
          return;
        }
        toast.error("Failed to send message");
      }
    },

    //  Add reaction
    onAddReaction: async (messageId, emoji) => {
      try {
        await axiosInstance.post(`reactions/${messageId}/reactions`, { emoji });
      } catch (e) {
        console.error("reaction failed", e);
      }
    },

    handleClearConversation: async (conversationId) => {
      try {
        const response = await axiosInstance.delete(
          `${HOST}/messages/clear/${conversationId}`
        );

        if (response.status === 200) {
          set({ messages: [] });
          const { clearConversations } = useConversationStore.getState();
          clearConversations(conversationId);
        }
      } catch (error) {
        console.log(error);
      }
    },
    handleFetchUsersInfo: async (id: string) => {
      try {
        const response = await axiosInstance.get(`${HOST}/auth/user/${id}`);
        const data = await response.data?.results;
        // console.log(data, "==========");
        set({ selectedUserInfo: data });
      } catch (error) {
        console.log(error);
      }
    },

    loadMoreMessages: async () => {
      const {
        selectedChat,
        messageCursor,
        hasMoreMessages,
        isLoadingMessages,
        messages,
      } = get();

      // Don't load if already loading, no more messages, or no chat selected
      if (isLoadingMessages || !hasMoreMessages || !selectedChat) return;

      set({ isLoadingMessages: true });

      try {
        const url = messageCursor
          ? `messages/${selectedChat.id}?cursor=${messageCursor}`
          : `messages/${selectedChat.id}`;

        const response = await axiosInstance.get(url);

        if (response.status === 200) {
          const data = response.data.results || response.data.data;
          const newMessages = data.messages || [];
          const hasMore = data.hasMore || false;
          const nextCursor = data.nextCursor || null;

          // Prepend older messages (they come in chronological order)
          // Filter out duplicates by ID
          const existingIds = new Set(messages.map((m) => m.id));
          const uniqueNewMessages = newMessages.filter(
            (m: Message) => !existingIds.has(m.id)
          );

          set({
            messages: [...uniqueNewMessages, ...messages],
            messageCursor: nextCursor,
            hasMoreMessages: hasMore,
            isLoadingMessages: false,
          });
        }
      } catch (error) {
        console.error("Failed to load more messages", error);
        set({ isLoadingMessages: false });
      }
    },

    fetchConversationsMedia: async (id: string) => {
      try {
        const response = await axiosInstance.get(
          `${HOST}/messages/${id}/media`
        );
        console.log(response?.data?.results?.media, "response");
        if (response?.status === 200) {
          set({ selectedMedia: response?.data?.results?.media });
        }
      } catch (error) {
        set({ selectedMedia: [] });
        console.log(error);
      }
    },
  };
});
