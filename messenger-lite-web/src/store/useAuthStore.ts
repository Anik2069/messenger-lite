import axiosInstance from "@/config/axiosInstance";
import { socket } from "@/lib/socket";
import { User } from "@/types/UserType";
import { AxiosError } from "axios";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { toast } from "react-toastify";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { useChatStore } from "./useChatStore";
import { disconnect } from "process";

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
    (set) => ({
      user: null,
      loading: false,
      error: null,

      login: async (email, password, router) => {
        set({ loading: true, error: null });
        const payload = { email, password };

        try {
          const response = await axiosInstance.post(
            "auth/user/sign-in",
            payload
          );

          if (response.status === 200) {
            const user = response.data?.results?.userInfo;
            set({ user, loading: false, error: null });

            if (!socket.connected) {
              socket.connect();
            }
            socket.emit("user_connected", user.id);

            toast.success("Login successful");
            router?.push("/");
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Login failed");

          set({ loading: false, error: axiosError.response?.data?.message });
        } finally {
          set({ loading: false });
        }
      },

      register: async (email, username, password, router) => {
        set({ loading: true, error: null });
        try {
          const response = await axiosInstance.post("auth/user/sign-up", {
            username,
            email,
            password,
          });

          if (response.status === 201) {
            toast.success("Registration successful! Please login.");
            router?.push("/auth?type=login");
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(
            axiosError.response?.data?.message || "Registration failed"
          );
          set({ loading: false, error: axiosError.response?.data?.message });
        } finally {
          set({ loading: false });
        }
      },

      logout: async (router) => {
        const { setIsConnected } = useChatStore.getState();
        set({ loading: true, error: null });
        const socketId = socket.id;
        // Disconnect socket
        socket.disconnect();
        setIsConnected(false);

        console.log(socketId, "log out");
        console.log(disconnect, "log out");
        try {
          const response = await axiosInstance.get("auth/user/logout");
          if (response.status === 200) {
            toast.success("Logout successful");
            router?.push("/auth?type=login");
            set({ user: null, loading: false, error: null });
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Logout failed");
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
