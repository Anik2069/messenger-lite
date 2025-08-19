import { Chat } from "@/types/ChatType";
import { FileData, ForwardedData, Message } from "@/types/MessageType";
import { create } from "zustand";

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

export const useChatStore = create<ChatState>((set) => ({
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
    set((state) => {
      if (!state.selectedChat) return state;

      const newMessage: Message = {
        id: Date.now().toString(),
        from: currentUser?.username ?? "Unknown",
        to: state.selectedChat.id,
        message,
        messageType: type,
        fileData,
        forwardedFrom,
        isGroupMessage: state.selectedChat.type === "group",
        timestamp: new Date(),
        reactions: [],
        readBy:
          state.selectedChat.type === "group"
            ? [
                {
                  username: currentUser?.username ?? "Unknown",
                  timestamp: new Date(),
                },
              ]
            : [],
      };

      return { messages: [...state.messages, newMessage] };
    });
  },
  onAddReaction: (
    messageId: string,
    emoji: string,
    currentUser?: { username: string; id: string } | null
  ) => {
    set((state) => ({
      messages: state.messages.map((message) => {
        if (message.id !== messageId) return message;

        const username = currentUser?.username ?? "Unknown";
        const existingReactionIndex = message.reactions.findIndex(
          (r) => r.username === username && r.emoji === emoji
        );

        if (existingReactionIndex >= 0) {
          return {
            ...message,
            reactions: message.reactions.filter(
              (_, index) => index !== existingReactionIndex
            ),
          };
        }

        const userReactionIndex = message.reactions.findIndex(
          (r) => r.username === username
        );

        if (userReactionIndex >= 0) {
          const updatedReactions = [...message.reactions];
          updatedReactions[userReactionIndex] = {
            emoji,
            username,
            timestamp: new Date(),
          };
          return { ...message, reactions: updatedReactions };
        }

        return {
          ...message,
          reactions: [
            ...message.reactions,
            { emoji, username, timestamp: new Date() },
          ],
        };
      }),
    }));
  },
}));
