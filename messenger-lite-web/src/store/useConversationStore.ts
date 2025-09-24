import axiosInstance from "@/config/axiosInstance";
import { Conversation } from "@/types/coversations.type";
import { set } from "zod/v3";
import { create } from "zustand";

export interface ConversationState {
  conversations: Conversation[] | null;
  fetchConversations: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useConversationStore = create<ConversationState>()((set) => ({
  conversations: null,
  loading: false,
  error: null,
  fetchConversations: async (search?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(
        `messages/conversations?search=''`
      );
      const data = await response.data;
      set({ conversations: data?.results, loading: false });
    } catch (error) {
      set({ error: "Failed to fetch conversations", loading: false });
      console.error("Failed to fetch conversations", error);
    }
  },
}));
