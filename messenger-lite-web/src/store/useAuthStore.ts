import axiosInstance from "@/config/axiosInstance";
import { User } from "@/types/UserType";
import { toast } from "react-toastify";
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
  login: async (email, password) => {
    console.log(email, password);
    const payload = { email, password };
    try {
      const response = await axiosInstance.post("auth/user/sign-in", payload);
      console.log(response, "response");
      if (response.status === 200) {
        // window.location.href = "/";
        toast.success("Login successful");
      }
    } catch (error) {
      console.log(error);
    }
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
        window.location.href = "/auth?type=login";
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
