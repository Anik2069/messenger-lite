"use client";

import axiosInstance from "@/config/axiosInstance";
import { socket } from "@/lib/socket";
import { User } from "@/types/UserType";
import { AxiosError } from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "react-toastify";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useChatStore } from "./useChatStore";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
  login: (
    email: string,
    password: string,
    router?: AppRouterInstance
  ) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string,
    router?: AppRouterInstance
  ) => Promise<void>;
  logout: (router?: AppRouterInstance) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      token: null,

      // LOGIN
      login: async (email, password, router) => {
        set({ loading: true, error: null });
        try {
          const res = await axiosInstance.post("auth/user/sign-in", {
            email,
            password,
          });
          const user = res.data?.results?.userInfo as User | undefined;
          const token = res.data?.results?.accessToken as string | undefined;

          if (!user || !token)
            throw new Error("Invalid response: missing userInfo/accessToken");

          set({ user, token, loading: false, error: null });

          // axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;

          if (!socket.connected) socket.connect();
          toast.success("Login successful");
          router?.push("/");
        } catch (err) {
          const axiosErr = err as AxiosError<{ message?: string }>;
          const msg =
            axiosErr.response?.data?.message ||
            axiosErr.message ||
            "Login failed";
          toast.error(msg);
          set({ loading: false, error: msg });
        }
      },

      // REGISTER
      register: async (email, username, password, router) => {
        set({ loading: true, error: null });
        try {
          const res = await axiosInstance.post("auth/user/sign-up", {
            username,
            email,
            password,
          });
          const user = res.data?.results?.userInfo as User | undefined;

          if (user) {
            set({ user, loading: false, error: null });
            if (!socket.connected) socket.connect();
            toast.success("Registration successful!");
            router?.push("/");
          } else {
            toast.success("Registration successful! Please login.");
            set({ loading: false });
            router?.push("/auth?type=login");
          }
        } catch (err) {
          const axiosErr = err as AxiosError<{ message?: string }>;
          const msg =
            axiosErr.response?.data?.message ||
            axiosErr.message ||
            "Registration failed";
          toast.error(msg);
          set({ loading: false, error: msg });
        }
      },

      // LOGOUT
      logout: async (router) => {
        set({ loading: true, error: null });
        const { setIsConnected } = useChatStore.getState();
        try {
          await axiosInstance.post("auth/user/logout").catch(() => {});
        } catch {}

        try {
          if (socket.connected) socket.disconnect();
        } catch {}
        setIsConnected(false);

        set({ user: null, token: null, loading: false, error: null });

        try {
          useAuthStore.persist?.clearStorage?.();
        } catch {}
        try {
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("accessToken");
        } catch {}

        toast.success("Logout successful");
        router?.push("/auth?type=login");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error("Auth store rehydrate failed:", error);
        // note: call after a tick so that state is available
        setTimeout(() => {
          const { token } = useAuthStore.getState();
          if (token && !socket.connected) {
            try {
              socket.connect();
            } catch {}
          }
        }, 0);
      },
    }
  )
);
