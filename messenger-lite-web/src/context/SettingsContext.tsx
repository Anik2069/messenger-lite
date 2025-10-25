"use client";

import axiosInstance from "@/config/axiosInstance";
import { socket } from "@/lib/socket";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./useAuth";

export type Settings = {
  id: string;
  userId: string;
  theme: "DARK" | "LIGHT";
  soundNotifications: boolean;
  activeStatus: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Status = {
  userId: string;
  isOnline: boolean;
};

type SettingsContextType = {
  settings: Settings | null;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleActiveStatus: () => void;
  activeStatus: Status | null;
  otherStatuses: Record<string, Status>;
  setSettings: (settings: Settings) => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeStatus, setActiveStatus] = useState<Status | null>(null);
  const [otherStatuses, setOtherStatuses] = useState<Record<string, Status>>(
    {}
  );
  const { user } = useAuth();
  const userId = user?.id || "";

  // ---------------- Fetch Settings on Login ----------------
  useEffect(() => {
    if (!user) return;
    fetchSettings();
  }, [user]);

  // ---------------- Socket Presence Handling ----------------
  useEffect(() => {
    if (!userId) return;

    const onSelfPresence = ({ userId: uid, isOnline }: Status) => {
      setActiveStatus({ userId: uid, isOnline });
    };

    const onPresenceUpdate = ({ userId, isOnline }: Status) => {
      setOtherStatuses((prev) => ({
        ...prev,
        [userId]: { userId, isOnline },
      }));
    };

    socket.on("presence_self", onSelfPresence);
    socket.on("presence_update", onPresenceUpdate);

    return () => {
      socket.off("presence_self", onSelfPresence);
      socket.off("presence_update", onPresenceUpdate);
    };
  }, [userId]);

  // ---------------- Helpers ----------------
  const applyTheme = (theme: "DARK" | "LIGHT") => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "DARK");
    }
  };

  const persistSettings = (updated: Settings) => {
    setSettings(updated);
    localStorage.setItem("settings", JSON.stringify(updated));
    applyTheme(updated.theme);
  };

  const updateSettings = async (updated: Partial<Settings>) => {
    try {
      const response = await axiosInstance.patch(
        "settings/update-my-settings",
        updated
      );

      // ✅ backend sends { results: updatedSettings }
      const newSettings = response.data?.results as Settings | undefined;
      if (newSettings) {
        persistSettings(newSettings);
      } else {
        console.warn("updateSettings: Missing results in response");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get("settings/my-settings");

      // ✅ backend sends { results: settings }
      const s = response.data?.results as Settings | undefined;
      if (s) {
        const normalized: Settings = {
          ...s,
          theme: s.theme?.toUpperCase() as "DARK" | "LIGHT",
        };
        persistSettings(normalized);
      } else {
        console.warn("fetchSettings: No results found");
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  // ---------------- Toggles ----------------
  const toggleTheme = () => {
    if (!settings) return;
    const newTheme = settings.theme === "DARK" ? "LIGHT" : "DARK";
    updateSettings({ theme: newTheme });
  };

  const toggleSound = () => {
    if (!settings) return;
    updateSettings({ soundNotifications: !settings.soundNotifications });
  };

  const toggleActiveStatus = () => {
    if (!settings) return;
    const active = !settings.activeStatus;
    updateSettings({ activeStatus: active });
    saveActiveStatus(active);
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

  return (
    <SettingsContext.Provider
      value={{
        settings,
        toggleTheme,
        toggleSound,
        toggleActiveStatus,
        activeStatus,
        otherStatuses,
        setSettings,
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
