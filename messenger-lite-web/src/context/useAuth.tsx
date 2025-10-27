"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { socket } from "@/lib/socket";
import axiosInstance from "@/config/axiosInstance";
import axios from "axios";
import { User } from "@/types/UserType";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { set } from "date-fns";
import { useModal } from "@/hooks/useModal";
import { useSettings } from "./SettingsContext";
interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  results: T | null;
  timestamp: string;
}

type DeviceType =
  | "DESKTOP"
  | "MOBILE"
  | "TABLET"
  | "BOT"
  | "POSTMAN"
  | "UNKNOWN";

export interface UserDevice {
  id: string;
  ip_address: string;
  os: string;
  browser: string;
  device_type: DeviceType;
  user_agent: string;
  last_active: Date;
  user_id: string;
  trusted: boolean;
}

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
  remove2FA: (code?: string) => void;
  handleRemove: (code: string) => void;
  is2FAEnabled: boolean;
  handleVerifyAtSignIn: (codeFrom2FA: string | number) => void;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<ApiResponse | null>;
  removeModalOpen: () => void;
  removeModalClose: () => void;
  removeModalIsOpen: boolean;
  userTrustedDevices: UserDevice[] | null;
  isLoadingUserTrustedDevices: boolean;
  fetchTrustedDevices: (userId: string) => void;
  initialLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentUserDetails, setCurrentUserDetails] = useState<User | null>(
    null
  );

  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);

  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState<boolean>(false);
  const [codeFrom2FA, setCodeFrom2FA] = useState<string | number | undefined>(
    undefined
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [setupError, setSetupError] = useState<boolean>(false);
  const [verified, setVerified] = useState<boolean>(false);
  const router = useRouter();
  const [isLogoutLoading, setIsLogoutLoading] = useState(false);
  const {
    open: removeModalOpen,
    close: removeModalClose,
    isOpen: removeModalIsOpen,
  } = useModal();

  const [userTrustedDevices, setUserTrustedDevices] = useState<UserDevice[]>(
    []
  );
  const [isLoadingUserTrustedDevices, setIsLoadingUserTrustedDevices] =
    useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      socket.auth = { token };
      if (!socket.connected) socket.connect();
    }
    setInitialLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/user/sign-in", {
        email,
        password,
      });

      const result = response.data?.results;

      if (!result) throw new Error("Invalid server response");

      const is2FA = Boolean(result.twoFA);

      // If 2FA is enabled, go to OTP verification step
      if (is2FA) {
        const id = result.userId as string;
        if (!id) throw new Error("Missing user ID for 2FA");
        setIs2FAEnabled(true);
        setUserId(id);
        toast.info("Two-Factor Authentication required");
        return;
      }

      //  Otherwise, normal login flow
      const token = result.accessToken as string;
      const userInfo = result.userInfo as User;

      if (!token || !userInfo) throw new Error("Incomplete login data");

      //  Update local states
      setUser(userInfo);
      setToken(token);

      //  Setup socket authentication
      socket.auth = { token };
      if (!socket.connected) socket.connect();

      // Persist session locally
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(userInfo));

      toast.success(`Welcome back, ${userInfo.username || "User"}!`);
      router.replace("/"); // use replace instead of push to prevent going back to login
    } catch (error) {
      console.error("Login error:", error);
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Invalid credentials"
        : (error as Error).message || "Login failed";
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

  const remove2FA = async (code?: string) => {
    try {
      const response = await axiosInstance.post("auth/user/2fa/remove", {
        token: code,
      });

      if (response.status === 200) {
        const result = response.data?.results;
        removeModalClose();
        // clear local states
        setQr(null);
        setSecret(null);
        setVerified(false);
        setCodeFrom2FA(undefined);
        removeModalClose();
        toast.success("2FA removed successfully.");
        // refresh user info
        await getMyself();

        // return success data
        return result;
      }

      toast.error("2FA removal failed. Please try again.");
      return null;
    } catch (error) {
      console.error(error);
      const message = error as unknown as {
        response: { data: { message: string } };
      };
      toast.error(message?.response?.data?.message || "2FA removal failed.");
      return null;
    }
  };

  const handleRemove = async (code: string) => {
    setSetupError(false);
    await remove2FA(code);
  };

  const handleVerifyAtSignIn = async (codeFrom2FA: string | number) => {
    try {
      const response = await axiosInstance.post(
        "/auth/user/verify-2FA/sign-in",
        {
          token: codeFrom2FA,
          userId,
        }
      );

      const data = response.data?.results;
      if (!data) throw new Error("Invalid server response");

      const accessToken = data.accessToken;
      const userInfo = data.user;

      if (!accessToken || !userInfo) {
        throw new Error("Missing access token or user info");
      }

      // ✅ Update global auth state
      setUser(userInfo);
      setToken(accessToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(userInfo));

      // ✅ Socket setup
      socket.auth = { token: accessToken };
      if (!socket.connected) socket.connect();

      // ✅ Reset 2FA flow
      setIs2FAEnabled(false);
      setCodeFrom2FA(undefined);
      setVerified(true);

      toast.success("Login successful!");
      router.replace("/"); // 🔁 Use replace instead of push to prevent going back to login
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Invalid or expired 2FA code"
        : (error as Error).message || "2FA verification failed";
      toast.error(message);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse | null> => {
    try {
      const response = await axiosInstance.patch<ApiResponse>(
        "auth/update/password",
        {
          currentPassword,
          newPassword,
        }
      );

      if (response.status === 200) {
        toast.success(response.data.message || "Password updated successfully");
      }

      return response.data;
    } catch (error) {
      console.error(error);

      const message = error as unknown as {
        response: { data: { message: string } };
      };
      toast.error(message?.response?.data?.message || "Password update failed");

      return null; // returning null on failure
    }
  };
  const fetchTrustedDevices = useCallback(async (id: string) => {
    setIsLoadingUserTrustedDevices(true);
    try {
      const response = await axiosInstance.get(
        "auth/user/trusted-devices" + "/" + id
      );
      if (response.status === 200) {
        setUserTrustedDevices(response.data?.results);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingUserTrustedDevices(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        changePassword,
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
        remove2FA,
        handleRemove,
        is2FAEnabled,
        handleVerifyAtSignIn,
        removeModalClose,
        removeModalIsOpen,
        removeModalOpen,
        fetchTrustedDevices,
        isLoadingUserTrustedDevices,
        userTrustedDevices,
        initialLoading,
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
