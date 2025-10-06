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
  requestedFriends: User[];
  requestedFriendsLoading: boolean;
  getRequestedFriends: (search?: string) => void;
  activeTab: string;
  setActiveTab: (tad: string) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  pendingRequestsLIst: User[];
  pendingRequestsLIstLoading: boolean;
  getPendingRequestsLIst: (search?: string) => void;
  onSendRequest: (userId: string) => Promise<void>;
  onAcceptRequest: (userId: string) => Promise<void>;
  onDeclineFriendRequest: (userId: string) => Promise<void>;
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
      requestedFriends: [],
      requestedFriendsLoading: false,
      activeTab: "suggestion",
      searchText: "",
      pendingRequestsLIst: [],
      pendingRequestsLIstLoading: false,
      setSearchText: (text: string) => set({ searchText: text }),
      setActiveTab: (tab: string) => set({ activeTab: tab }),

      getSuggestedFriends: async (search?: string) => {
        set({ suggestedFriendsLoading: true, error: null });

        try {
          const response = await axiosInstance.get(
            `/friend/suggested?search=${search || ""}`
          );
          if (response.status === 200) {
            set({
              suggestedFriends: response.data?.results,
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
      getRequestedFriends: async (search?: string) => {
        set({ requestedFriendsLoading: true, error: null });

        try {
          const response = await axiosInstance.get(
            `/friend/friend-list?search=${search || ""}&status=PENDING`
          );
          if (response.status === 200) {
            set({
              requestedFriends: response.data?.results,
              requestedFriendsLoading: false,
              error: null,
            });
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Fetch failed");

          set({
            requestedFriendsLoading: false,
            error: axiosError.response?.data?.message,
          });
        }
      },
      getPendingRequestsLIst: async (search?: string) => {
        set({ pendingRequestsLIstLoading: true, error: null });

        try {
          const response = await axiosInstance.get(
            `/friend/requested-users?${search ? ` search=${search}` : ""}`
          );
          if (response.status === 200) {
            set({
              pendingRequestsLIst: response.data?.results,
              pendingRequestsLIstLoading: false,
              error: null,
            });
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Fetch failed");

          set({
            pendingRequestsLIstLoading: false,
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
            `friend/friend-list?search=${search || ""}&status=ACCEPTED`
          );
          if (response.status === 200) {
            set({
              friends: response.data?.results,
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
      onSendRequest: async (userId: string) => {
        try {
          const response = await axiosInstance.post(`friend/request/${userId}`);
          if (response.status === 200) {
            await useFriendsStore.getState().getSuggestedFriends();
            // toast.success(response.data.message);
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Request failed");
        }
      },
      onAcceptRequest: async (userId: string) => {
        try {
          const response = await axiosInstance.patch(
            `friend/request-action/${userId}?status=ACCEPTED`
          );
          if (response.status === 200) {
            toast.success(response.data.message);
            const refresh = useFriendsStore.getState();
            await Promise.all([
              refresh.getRequestedFriends(),
              refresh.fetchFriends(),
              refresh.fetchAllFriends(),
              refresh.getPendingRequestsLIst(),
              refresh.getSuggestedFriends(),
            ]);
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Request failed");
        }
      },
      onDeclineFriendRequest: async (userId: string) => {
        try {
          const response = await axiosInstance.patch(
            `friend/request-action/${userId}?status=REJECTED`
          );
          if (response.status === 200) {
            toast.success(response.data.message);
            const refresh = useFriendsStore.getState();
            await Promise.all([
              refresh.getRequestedFriends(),
              refresh.fetchFriends(),
              refresh.fetchAllFriends(),
              refresh.getPendingRequestsLIst(),
              refresh.getSuggestedFriends(),
            ]);
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Request failed");
        }
      },
    }),

    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
