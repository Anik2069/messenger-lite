import axiosInstance from "@/config/axiosInstance";
import { User } from "@/types/UserType";
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
  login: (usernam, password) => {
    console.log(usernam, password);
  },
  register: (email, username, password) => {
    console.log(email, username, password);
    //   set({ loading: true, error: null });
    //  set({ user: newUser, loading: false })
  },
  logout: () => {
    set({ user: null, loading: false, error: null });
  },
}));
