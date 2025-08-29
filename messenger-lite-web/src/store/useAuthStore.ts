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

      login: async (email, password, router) => {
        set({ loading: true, error: null });
        try {
          const res = await axiosInstance.post("auth/user/sign-in", {
            email,
            password,
          });
          const user = res.data?.results?.userInfo as User | undefined;

          if (!user) throw new Error("Invalid response: missing userInfo");

          set({ user, loading: false, error: null });

          if (!socket.connected) {
            socket.connect();
          }

          toast.success("Login successful");
          router?.push("/");
        } catch (err) {
          const axiosErr = err as AxiosError<{ message?: string }>;
          const msg =
            axiosErr.response?.data?.message ||
            (axiosErr.message ?? "Login failed");
          toast.error(msg);
          set({ loading: false, error: msg });
        } finally {
          set({ loading: false });
        }
      },

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
            (axiosErr.message ?? "Registration failed");
          toast.error(msg);
          set({ loading: false, error: msg });
        } finally {
          set({ loading: false });
        }
      },

      logout: async (router) => {
        set({ loading: true, error: null });
        const { setIsConnected } = useChatStore.getState();

        try {
          const res = await axiosInstance.post("auth/user/logout");
          if (res.status === 200) {
            if (socket.connected) socket.disconnect();

            setIsConnected(false);
            set({ user: null, loading: false, error: null });

            toast.success("Logout successful");
            router?.push("/auth?type=login");
          } else {
            throw new Error("Logout failed");
          }
        } catch (err) {
          const axiosErr = err as AxiosError<{ message?: string }>;
          const msg =
            axiosErr.response?.data?.message ||
            (axiosErr.message ?? "Logout failed");
          toast.error(msg);
          set({ loading: false, error: msg });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }), // persist only user
    }
  )
);
