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
  lastSeenAt?: string | null;
};

type SettingsContextType = {
  settings: Settings | null;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleActiveStatus: () => void;
  activeStatus: Status | null;
  otherStatuses: Record<string, Status>;
  setSettings: (settings: Settings) => void;
  setActiveStatus: (status: Status | null) => void;
  setOtherStatuses: React.Dispatch<
    React.SetStateAction<Record<string, Status>>
  >;
  fetchSettings: () => void;
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

  useEffect(() => {
    if (!user) return;
    fetchSettings();
  }, [user]);

  useEffect(() => {
    if (!userId || !socket) return;

    // Handle self presence updates
    const handleSelfPresence = (status: Status) => {
      if (status.userId === userId) {
        setActiveStatus(status);
      }
    };

    // Handle presence updates of other users
    const handlePresenceUpdate = (status: Status) => {
      console.log("update other presence");
      if (status.userId !== userId) {
        setOtherStatuses((prev) => ({
          ...prev,
          [status.userId]: status,
        }));
      }
    };

    // Register listeners
    socket.on("presence_self", handleSelfPresence);
    socket.on("presence_update", handlePresenceUpdate);

    // Set initial status from settings
    if (settings) {
      const initialStatus = { userId, isOnline: settings.activeStatus };
      setActiveStatus(initialStatus);
      socket.emit("set_status", { isOnline: settings.activeStatus });
    }

    // Cleanup
    return () => {
      socket.off("presence_self", handleSelfPresence);
      socket.off("presence_update", handlePresenceUpdate);
    };
  }, [userId, settings]);

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

      const newSettings = response.data?.results as Settings | undefined;
      if (newSettings) {
        persistSettings(newSettings);
        return newSettings;
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
      const s = response.data?.results as Settings | undefined;

      if (s) {
        const normalized: Settings = {
          ...s,
          theme: s.theme?.toUpperCase() as "DARK" | "LIGHT",
        };
        persistSettings(normalized);

        // Set initial active status
        setActiveStatus({
          userId,
          isOnline: normalized.activeStatus,
        });
      } else {
        console.warn("fetchSettings: No results found");
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const toggleTheme = () => {
    if (!settings) return;
    const newTheme = settings.theme === "DARK" ? "LIGHT" : "DARK";
    updateSettings({ theme: newTheme });
  };

  const toggleSound = () => {
    if (!settings) return;
    updateSettings({ soundNotifications: !settings.soundNotifications });
  };

  const toggleActiveStatus = async () => {
    if (!settings) return;
    const newActiveStatus = !settings.activeStatus;

    // Update settings first
    const updatedSettings = await updateSettings({
      activeStatus: newActiveStatus,
    });

    if (updatedSettings) {
      // Then update presence via socket and API
      await saveActiveStatus(newActiveStatus);
      setActiveStatus({ userId, isOnline: newActiveStatus });
    }
  };

  const saveActiveStatus = async (active: boolean) => {
    try {
      await axiosInstance.post("auth/user/activeStatus", {
        activeStatus: active,
      });
      socket.emit("set_status", { isOnline: active, updateMode: true });
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
        setOtherStatuses,
        setActiveStatus,
        fetchSettings,
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
