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
  userId: string;
  isOnline: boolean;
};

type SettingsContextType = {
  settings: Settings;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleActiveStatus: () => void;
  activeStatus: Status | null;
  otherStatuses: Record<string, Status>; // 👈 map of userId -> Status
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
  const [otherStatuses, setOtherStatuses] = useState<Record<string, Status>>(
    {}
  );
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

    // Self
    const onSelfPresence = ({ userId: uid, isOnline }: Status) => {
      console.log("[socket] presence_self →", { userId: uid, isOnline });
      setActiveStatus({ userId: uid, isOnline });
    };

    // Others
    const onPresenceUpdate = ({ userId, isOnline }: Status) => {
      console.log("[socket] presence_update/global →", { userId, isOnline });
      setOtherStatuses((prev) => ({
        ...prev,
        [userId]: { userId, isOnline },
      }));
    };

    socket.on("presence_self", onSelfPresence);
    socket.on("presence_global", onPresenceUpdate);
    socket.on("presence_update", onPresenceUpdate);

    return () => {
      socket.off("presence_self", onSelfPresence);
      socket.off("presence_global", onPresenceUpdate);
      socket.off("presence_update", onPresenceUpdate);
    };
  }, [userId]);

  // --- Helpers
  const persistSettings = (updated: Settings) => {
    setSettings(updated);
    localStorage.setItem("settings", JSON.stringify(updated));
  };

  const saveActiveStatus = async (active: boolean) => {
    try {
      await axiosInstance.post("auth/user/activeStatus", {
        activeStatus: active,
      });
      socket.emit("set_status", { isOnline: active });
      setActiveStatus({ userId, isOnline: active });
    } catch (error) {
      console.error("Failed to save activeStatus:", error);
    }
  };

  // --- Toggles
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
        otherStatuses,
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
