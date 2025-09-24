"use client";

import axiosInstance from "@/config/axiosInstance";
import { socket } from "@/lib/socket";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

type Settings = {
  theme?: "dark" | "light";
  soundNotifications?: boolean;
  activeStatus?: boolean;
};

type Status = {
  userId?: string;
  isOnline?: boolean;
};

type SettingsContextType = {
  settings: Settings;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleActiveStatus: () => void;
  activeStatus: Status | null;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<Settings>({});
  const [activeStatus, setActiveStatus] = useState<Status | null>(null);
  const { user } = useAuth();
  const userId = user?.id || "";

  // --- Hydrate from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawSettings = localStorage.getItem("settings");
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        setSettings(parsed);
        document.documentElement.classList.toggle(
          "dark",
          parsed.theme === "dark"
        );
      } else {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        document.documentElement.classList.toggle("dark", prefersDark);
      }

      const rawPresence = localStorage.getItem("activeStatus");
      if (rawPresence) setActiveStatus(JSON.parse(rawPresence));
    } catch {
      setSettings({});
      setActiveStatus(null);
    }
  }, []);

  // --- Persist activeStatus
  useEffect(() => {
    if (activeStatus) {
      localStorage.setItem("activeStatus", JSON.stringify(activeStatus));
    }
  }, [activeStatus]);

  // --- Socket listeners
  useEffect(() => {
    if (!userId) return;

    const onSelfPresence = ({ userId: uid, isOnline }: Status) => {
      console.log("[socket] presence_self →", { userId: uid, isOnline });
      setActiveStatus({ userId: uid, isOnline });
    };

    socket.on("presence_self", onSelfPresence);
    return () => {
      socket.off("presence_self", onSelfPresence);
    };
  }, [userId]);

  useEffect(() => {
    const onGlobal = ({ userId, isOnline }: Status) => {
      console.log("[socket] presence_global →", userId, isOnline);
    };
    socket.on("presence_global", onGlobal);
    return () => {
      socket.off("presence_global", onGlobal);
    };
  }, []);

  // --- Helpers
  const persistSettings = (updated: Settings) => {
    setSettings(updated);
    localStorage.setItem("settings", JSON.stringify(updated));
  };

  const saveActiveStatus = async (activeStatus: boolean) => {
    try {
      await axiosInstance.post("auth/user/activeStatus", { activeStatus });
      socket.emit("set_status", { isOnline: activeStatus });
      setActiveStatus({ userId, isOnline: activeStatus });
    } catch (error) {
      console.error("Failed to save activeStatus:", error);
    }
  };

  // --- Toggles (auto-save on change)
  const toggleTheme = () => {
    const newTheme = settings.theme === "dark" ? "light" : "dark";
    const updated = { ...settings, theme: newTheme };
    persistSettings(updated as Settings);
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  const toggleSound = () => {
    const updated = {
      ...settings,
      soundNotifications: !settings.soundNotifications,
    };
    persistSettings(updated);
  };

  const toggleActiveStatus = () => {
    const updated = { ...settings, activeStatus: !settings.activeStatus };
    persistSettings(updated);
    saveActiveStatus(!!updated.activeStatus);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        toggleTheme,
        toggleSound,
        toggleActiveStatus,
        activeStatus,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error("useSettings must be used inside SettingsProvider");
  return context;
};
