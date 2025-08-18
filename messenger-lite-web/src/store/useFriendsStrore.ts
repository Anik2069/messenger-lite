import axiosInstance from "@/config/axiosInstance";
import { User } from "@/types/UserType";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface FriendsState {
  friends: User[] | null;
  loading: boolean;
  error: string | null;
  fetchFriends: () => Promise<void>;
  Allfriends: User[] | null;
  fetchAllFriends: (search?: string) => Promise<void>;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set) => ({
      friends: null,
      Allfriends: null,
      loading: false,
      error: null,
      fetchAllFriends: async (search?: string) => {
        set({ loading: true, error: null });

        try {
          const response = await axiosInstance.get(
            "meta/friends/list?search=" + search
          );
          if (response.status === 200) {
            set({
              Allfriends: response.data?.results?.friendsList,
              loading: false,
              error: null,
            });
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Fetch failed");

          set({ loading: false, error: axiosError.response?.data?.message });
        }
      },
      fetchFriends: async () => {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.get("meta/friends/list");
          if (response.status === 200) {
            set({
              friends: response.data?.results?.friendsList,
              loading: false,
              error: null,
            });
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Fetch failed");
          set({ loading: false, error: axiosError.response?.data?.message });
        }
      },
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
