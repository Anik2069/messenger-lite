"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import axiosInstance from "@/config/axiosInstance";
import axios from "axios";
import { User } from "@/types/UserType";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { set } from "date-fns";

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
  setUp2FA: () => void;
  setupLoading: boolean;
  qr: string | null;
  secret: string | null;
  setCodeFrom2FA: (codeFrom2FA: string | number | undefined) => void;
  codeFrom2FA: string | number | undefined;
  verified: boolean;
  setVerified: (verified: boolean) => void;
  handleVerify: (codeFrom2FA: string | number) => void;
  getMyself: () => void;
  currentUserDetails: User | null;
  setupError: boolean;
  setSetupError: (setupError: boolean) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentUserDetails, setCurrentUserDetails] = useState<User | null>(
    null
  );
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState<boolean>(false);
  const [codeFrom2FA, setCodeFrom2FA] = useState<string | number | undefined>(
    undefined
  );
  const [setupError, setSetupError] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
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

      toast.success("Login successful");
      router.push("/");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message ?? "Login failed"
        : "Login failed";
      toast.error(message || "Login failed");
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
        localStorage.removeItem("friend-storage");

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

  const setUp2FA = async () => {
    setSetupLoading(true);
    try {
      const response = await axiosInstance.post("auth/user/2fa/generate");
      if (response.status === 200) {
        console.log(response.data?.results);
        setQr(response.data?.results?.qr);
        setSecret(response.data?.results?.secret);
      }
    } catch (error) {
    } finally {
      setSetupLoading(false);
    }
  };

  const handleVerify = async (codeFrom2FA: string | number) => {
    try {
      const response = await axiosInstance.post("auth/user/2fa/verify-setup", {
        token: codeFrom2FA,
      });
      if (response.status === 200) {
        console.log(response.data?.results);
        setVerified(true);
        await getMyself();
      }
    } catch (error) {
      setSetupError(true);
    }
  };

  const saveActiveStatus = async (userId: string) => {
    try {
      await axiosInstance.post(`users/${userId}`, {});
    } catch (error) {}
  };

  const getMyself = async () => {
    try {
      const response = await axiosInstance.get("auth/user/me");
      console.log(response);
      if (response.status === 200) {
        const u = response.data?.results?.userInfo as User | undefined;
        if (u) {
          setCurrentUserDetails(u);
          localStorage.setItem("user", JSON.stringify(u));
        }
      }
    } catch (error) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
        isLogoutLoading,
        setUp2FA,
        setupLoading,

        qr,
        secret,

        verified,
        setVerified,
        codeFrom2FA,
        setCodeFrom2FA,
        handleVerify,
        getMyself,
        currentUserDetails,

        setSetupError,
        setupError,
      }}
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
