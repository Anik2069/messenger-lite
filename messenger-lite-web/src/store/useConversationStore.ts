// src/store/useConversationStore.ts
import axiosInstance from "@/config/axiosInstance";
import { socket } from "@/lib/socket";
import { Conversation } from "@/types/coversations.type";
import { create } from "zustand";

export interface ConversationState {
  conversations: Conversation[] | null;
  fetchConversations: (search?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useConversationStore = create<ConversationState>((set) => {
  // ✅ Listen for realtime updates
  socket.off("conversations_updated");
  socket.on("conversations_updated", (conversations: Conversation[]) => {
    console.log("📩 conversations_updated", conversations);
    set({ conversations });
  });

  return {
    conversations: null,
    loading: false,
    error: null,

    fetchConversations: async (search?: string) => {
      set({ loading: true, error: null });
      try {
        const response = await axiosInstance.get(
          `messages/conversations?search=${search || ""}`
        );
        const data = await response.data;
        set({ conversations: data?.results, loading: false });
      } catch (error) {
        set({ error: "Failed to fetch conversations", loading: false });
        console.error("Failed to fetch conversations", error);
      }
    },
  };
});
