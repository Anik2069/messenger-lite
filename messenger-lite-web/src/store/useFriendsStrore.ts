import axiosInstance from "@/config/axiosInstance";
import { User } from "@/types/UserType";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface FriendsState {
  friends: User[] | null;
  friendLoading: boolean;
  error: string | null;
  fetchAllFriends: (search?: string) => Promise<void>;
  Allfriends: User[] | null;
  fetchFriends: (search?: string) => Promise<void>;
  suggestedFriends: User[];
  suggestedFriendsLoading: boolean;
  getSuggestedFriends: (search?: string) => void;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set) => ({
      friends: null,
      Allfriends: null,
      friendLoading: false,
      error: null,
      suggestedFriends: [],
      suggestedFriendsLoading: false,

      getSuggestedFriends: async (search?: string) => {
        set({ suggestedFriendsLoading: true, error: null });

        try {
          const response = await axiosInstance.get(
            "meta/friends/list?search=" + search
          );
          if (response.status === 200) {
            set({
              suggestedFriends: response.data?.results?.friendsList,
              suggestedFriendsLoading: false,
              error: null,
            });
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Fetch failed");

          set({
            suggestedFriendsLoading: false,
            error: axiosError.response?.data?.message,
          });
        }
      },
      fetchAllFriends: async (search?: string) => {
        set({ friendLoading: true, error: null });

        try {
          const response = await axiosInstance.get(
            "meta/friends/list?search=" + search
          );
          if (response.status === 200) {
            set({
              Allfriends: response.data?.results?.friendsList,
              friendLoading: false,
              error: null,
            });
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Fetch failed");

          set({
            friendLoading: false,
            error: axiosError.response?.data?.message,
          });
        }
      },
      fetchFriends: async (search?: string) => {
        set({ friendLoading: true, error: null });
        try {
          const response = await axiosInstance.get(
            "friend/friend-list" + search
          );
          if (response.status === 200) {
            set({
              friends: response.data?.results?.friendsList,
              friendLoading: false,
              error: null,
            });
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Fetch failed");
          set({
            friendLoading: false,
            error: axiosError.response?.data?.message,
          });
        }
      },
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
