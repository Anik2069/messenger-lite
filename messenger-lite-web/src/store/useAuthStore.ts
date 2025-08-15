import axiosInstance from "@/config/axiosInstance";
import { User } from "@/types/UserType";
import { email } from "zod";
import { create } from "zustand";

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => void;
  register: (email: string, username: string, password: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  login: async (username, password) => {
    console.log(username, password);
    const payload = { username, password };
  },

  register: async (email, username, password) => {
    console.log(email, username, password);
    try {
      const response = await axiosInstance.post("auth/user/sign-up", {
        username,
        email,
        password,
      });
      console.log(response, "response");

      if (response.status === 201) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.log(error);
    }
    //   set({ loading: true, error: null });
    //  set({ user: newUser, loading: false })
  },
  logout: async () => {
    set({ user: null, loading: false, error: null });
  },
}));
