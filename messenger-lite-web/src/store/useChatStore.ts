import { socket } from "@/lib/socket";
import { Chat } from "@/types/ChatType";
import { FileData, ForwardedData, Message } from "@/types/MessageType";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

type ChatState = {
  selectedChat: Chat | null;
  messages: Message[];
  otherUserTyping: string | null;
  isConnected: boolean;

  showSearch: boolean;
  setSelectedChat: (chat: Chat) => void;
  setMessages: (messages: Message[]) => void;
  setOtherUserTyping: (username: string | null) => void;
  setIsConnected: (connected: boolean) => void;
  setShowSearch: (show: boolean) => void;
  onSendMessage: (
    message: string,
    type?: "text" | "file" | "forwarded",
    fileData?: FileData,
    forwardedFrom?: ForwardedData,
    currentUser?: { username: string; id: string } | null
  ) => void;
  onAddReaction: (
    messageId: string,
    emoji: string,
    currentUser?: { username: string; id: string } | null
  ) => void;
};

export const useChatStore = create<ChatState>((set, get) => {
  socket.on("connect", () => {
    set({ isConnected: true });
    console.log("Socket connected");

    // Re-authenticate if user is logged in
    const { user } = useAuthStore.getState();
    if (user) {
      socket.emit("user_connected", user.id);
    }
  });

  socket.on("receive_message", (newMessage: Message) => {
    console.log("Received message:", newMessage);
    set((state) => ({ messages: [...state.messages, newMessage] }));
  });

  socket.on("disconnect", () => {
    set({ isConnected: false });
    console.log("Socket disconnected");
  });

  socket.on("receive_message", (newMessage: Message) => {
    console.log("Received message:", newMessage);
    set((state) => ({ messages: [...state.messages, newMessage] }));
  });

  socket.on("user_typing", (data: { chatId: string; username: string }) => {
    const { selectedChat } = get();
    if (selectedChat && selectedChat.id === data.chatId) {
      set({ otherUserTyping: data.username });
    }
  });

  socket.on(
    "message_reaction",
    (payload: { messageId: string; emoji: string; username: string }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg.id === payload.messageId
            ? {
                ...msg,
                reactions: [
                  ...msg.reactions,
                  { ...payload, timestamp: new Date() },
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
    isConnected: true,
    showSearch: false,
    setSelectedChat: (chat) => set({ selectedChat: chat }),
    setMessages: (messages) => set({ messages }),
    setOtherUserTyping: (username) => set({ otherUserTyping: username }),
    setIsConnected: (connected) => set({ isConnected: connected }),
    setShowSearch: (show) => set({ showSearch: show }),
    onSendMessage: (
      message,
      type = "text",
      fileData,
      forwardedFrom,
      currentUser
    ) => {
      const { selectedChat } = get();
      if (!selectedChat) return;

      const newMessage: Message = {
        id: Date.now().toString(),
        from: currentUser?.username ?? "Unknown",
        to: selectedChat.id,
        message,
        messageType: type,
        fileData,
        forwardedFrom,
        isGroupMessage: selectedChat.type === "group",
        timestamp: new Date(),
        reactions: [],
        readBy:
          selectedChat.type === "group"
            ? [
                {
                  username: currentUser?.username ?? "Unknown",
                  timestamp: new Date(),
                },
              ]
            : [],
      };

      set((state) => ({ messages: [...state.messages, newMessage] }));
      socket.emit("send_message", newMessage);
    },
    onAddReaction: (messageId, emoji, currentUser) => {
      const username = currentUser?.username ?? "Unknown";

      // emit reaction to backend
      socket.emit("message_reaction", { messageId, emoji, username });
    },
  };
});
