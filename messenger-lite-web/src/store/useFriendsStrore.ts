"use client";
import axiosInstance from "@/config/axiosInstance";
import { User } from "@/types/UserType";
import { FriendRequestPayload } from "@/types/FriendRequestPayload";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Socket } from "socket.io-client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface FriendsState {
  friends: User[] | null;
  Allfriends: User[] | null;
  friendLoading: boolean;
  error: string | null;

  suggestedFriends: User[];
  suggestedFriendsLoading: boolean;

  requestedFriends: User[];
  requestedFriendsLoading: boolean;

  pendingRequestsLIst: User[];
  pendingRequestsLIstLoading: boolean;

  activeTab: string;
  searchText: string;

  // setters
  setActiveTab: (tab: string) => void;
  setSearchText: (text: string) => void;

  // actions
  fetchFriends: (search?: string) => Promise<void>;
  fetchAllFriends: (search?: string) => Promise<void>;
  getSuggestedFriends: (search?: string) => Promise<void>;
  getRequestedFriends: (search?: string) => Promise<void>;
  getPendingRequestsLIst: (search?: string) => Promise<void>;

  onSendRequest: (userId: string) => Promise<void>;
  onAcceptRequest: (userId: string) => Promise<void>;
  onDeclineFriendRequest: (userId: string) => Promise<void>;

  // socket
  setupSocketListeners: (socket: Socket, userId: string) => () => void;
}

export const useFriendsStore = create<FriendsState>()(
  persist(
    (set, get) => ({
      friends: null,
      Allfriends: null,
      friendLoading: false,
      error: null,

      suggestedFriends: [],
      suggestedFriendsLoading: false,

      requestedFriends: [],
      requestedFriendsLoading: false,

      pendingRequestsLIst: [],
      pendingRequestsLIstLoading: false,

      activeTab: "suggestion",
      searchText: "",

      setActiveTab: (tab) => set({ activeTab: tab }),
      setSearchText: (text) => set({ searchText: text }),

      // ---------- FETCH ACTIONS ----------
      fetchFriends: async (search?: string) => {
        set({ friendLoading: true, error: null });
        try {
          const response = await axiosInstance.get(
            `friend/friend-list?search=${search || ""}&status=ACCEPTED`
          );
          if (response.status === 200) {
            set({ friends: response.data?.results, friendLoading: false });
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

      fetchAllFriends: async (search?: string) => {
        set({ friendLoading: true, error: null });
        try {
          const response = await axiosInstance.get(
            `meta/friends/list?search=${search}`
          );
          if (response.status === 200) {
            set({
              Allfriends: response.data?.results?.friendsList,
              friendLoading: false,
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
            `/friend/requested-users?${search ? `search=${search}` : ""}`
          );
          if (response.status === 200) {
            set({
              pendingRequestsLIst: response.data?.results,
              pendingRequestsLIstLoading: false,
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

      // ---------- FRIEND REQUEST ACTIONS ----------
      onSendRequest: async (userId: string) => {
        try {
          const response = await axiosInstance.post(`friend/request/${userId}`);
          if (response.status === 200) {
            await get().getSuggestedFriends();
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
            const refresh = get();
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
            const refresh = get();
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

      // ---------- SOCKET LISTENERS ----------
      setupSocketListeners: (socket: Socket, userId: string) => {
        if (!userId) return () => {};

        // Someone sent you a friend request
        const onFriendRequestReceived = ({ request }: FriendRequestPayload) => {
          console.log("New friend request", request);
          toast.success(`${request.sender.username} sent you a friend request`);
          set((state) => ({
            requestedFriends: [request.sender, ...state.requestedFriends],
            suggestedFriends: state.suggestedFriends.filter(
              (f) => f.id !== request.sender.id
            ),
          }));
          // Refetch requested friends and suggestion list
          get().getRequestedFriends();
          get().getSuggestedFriends();
        };

        // A friend request you sent or received has been updated
        const onFriendRequestUpdated = ({ request }: FriendRequestPayload) => {
          console.log();
          set((state) => ({
            requestedFriends: state.requestedFriends.filter(
              (f) => f.id !== request.sender.id
            ),
          }));

          if (request.status === "ACCEPTED") {
            if (request.sender.id === userId) {
              toast.success(
                `${request.sender.username} accepted your friend request`
              );
            }
            get().fetchFriends(); // refresh accepted friends
            get().getSuggestedFriends(); // refresh suggestions
          }

          if (request.status === "REJECTED") {
            get().getSuggestedFriends(); // refresh suggestions
          }
        };

        socket.on("friend_request", onFriendRequestReceived);
        socket.on("friend_request_update", onFriendRequestUpdated);

        return () => {
          socket.off("friend_request", onFriendRequestReceived);
          socket.off("friend_request_update", onFriendRequestUpdated);
        };
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
