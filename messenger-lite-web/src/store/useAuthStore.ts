import axiosInstance from "@/config/axiosInstance";
import { User } from "@/types/UserType";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      login: async (email, password) => {
        console.log(email, password);
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
            toast.success("Login successful");
          }
        } catch (error) {
          const axiosError = error as AxiosError<{ message?: string }>;
          toast.error(axiosError.response?.data?.message || "Login failed");
          set({ loading: false, error: axiosError.response?.data?.message });
        } finally {
          set({ loading: false });
        }
      },

      register: async (email, username, password) => {
        try {
          const response = await axiosInstance.post("auth/user/sign-up", {
            username,
            email,
            password,
          });

          if (response.status === 201) {
            window.location.href = "/auth?type=login";
          }
        } catch (error) {
          console.log(error);
        }
      },

      logout: () => {
        set({ user: null, loading: false, error: null });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
