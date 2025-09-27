"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import axiosInstance from "@/config/axiosInstance";
import axios from "axios";
import { User } from "@/types/UserType";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    username: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isLogoutLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  useEffect(() => {
    const savedToken = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));

      socket.auth = { token: savedToken };
      if (!socket.connected) socket.connect();
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/user/sign-in", {
        email,
        password,
      });

      const u = res.data?.results?.userInfo as User;
      const t = res.data?.results?.accessToken as string;

      if (!u || !t) throw new Error("Invalid login response");

      setUser(u);
      setToken(t);

      localStorage.setItem("accessToken", t);
      localStorage.setItem("user", JSON.stringify(u));

      socket.auth = { token: t };
      if (!socket.connected) socket.connect();

      // toast.success("Login successful");
      router.push("/");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Login failed"
        : "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  //  REGISTER
  const register = async (
    email: string,
    username: string,
    password: string
  ) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("auth/user/sign-up", {
        username,
        email,
        password,
      });

      const u = res.data?.results?.userInfo as User | undefined;
      const t = res.data?.results?.accessToken as string | undefined;

      if (u && t) {
        setUser(u);
        setToken(t);

        localStorage.setItem("accessToken", t);
        localStorage.setItem("user", JSON.stringify(u));

        socket.auth = { token: t };
        if (!socket.connected) socket.connect();

        // toast.success("Registration successful");
        router.push("/");
      } else {
        toast.success("Registration successful! Please login.");
        router.push("/auth?type=login");
      }
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Registration failed"
        : "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  //  LOGOUT
  const logout = async () => {
    setIsLogoutLoading(true);
    try {
      const response = await axiosInstance.post("auth/user/logout");
      if (response.status === 200) {
        console.log("Logout successful");
        setUser(null);
        setToken(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        if (socket.connected) socket.disconnect();
        socket.auth = { token: "" };

        // toast.success("Logout successful");
        router.push("/auth?type=login");
      }
    } catch (error) {
      console.error("Logout failed", error);
      toast.error("Logout failed, please try again.");
    } finally {
      setIsLogoutLoading(false);
    }
  };

  const saveActiveStatus = async (userId: string) => {
    try {
      await axiosInstance.post(`users/${userId}`, {});
    } catch (error) {}
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading, isLogoutLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
