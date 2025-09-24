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

type SettingsContextType = {
  settings: Settings;
  toggleTheme: () => void;
  toggleSound: () => void;
  toggleActiveStatus: () => void;
  saveSettings: (onSave?: () => void) => void;
  isSaving: boolean;
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
  const [isSaving, setIsSaving] = useState(false);

  const { user } = useAuth();
  const userId = user?.id || "";

  useEffect(() => {
    if (!userId) return;

    const onSelfPresence = ({
      userId: uid,
      isOnline,
    }: {
      userId: string;
      isOnline: boolean;
    }) => {
      console.log("[socket] presence_self →", { userId: uid, isOnline });
      // (optional) keep UI in sync:
      // setSettings(prev => ({ ...prev, activeStatus: isOnline }));
    };

    socket.on("presence_self", onSelfPresence);

    return () => {
      socket.off("presence_self", onSelfPresence);
    };
  }, [userId]);

  useEffect(() => {
    const onGlobal = ({
      userId,
      isOnline,
    }: {
      userId: string;
      isOnline: boolean;
    }) => {
      // e.g., setUsers(prev => prev.map(u => u.id === userId ? {...u, isOnline} : u));
      console.log("[socket] presence_global →", userId, isOnline);
    };
    socket.on("presence_global", onGlobal);
    return () => {
      socket.off("presence_global", onGlobal);
    };
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("settings");
        if (raw) {
          const parsed = JSON.parse(raw);
          setSettings(parsed);
          document.documentElement.classList.toggle(
            "dark",
            parsed.theme === "dark"
          );
        } else {
          // Fallback: respect system preference if nothing is stored
          const prefersDark =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
          document.documentElement.classList.toggle("dark", !!prefersDark);
        }
      } catch {
        setSettings({});
      }
    }
  }, []);

  //   useEffect(() => {
  //     console.log("Settings updated:", settings);
  //   }, [settings]);

  const saveSettings = async (onSave?: () => void) => {
    setIsSaving(true);
    localStorage.setItem("settings", JSON.stringify(settings));
    setTimeout(() => {
      setIsSaving(false);
      onSave?.();
    }, 1000);
    await saveActiveStatus(!!settings.activeStatus);
  };

  const saveActiveStatus = async (activeStatus: boolean) => {
    try {
      const res = axiosInstance.post("auth/user/activeStatus", {
        activeStatus,
      });
      console.log(res, "-----------------------");
    } catch (error) {}
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === "dark" ? "light" : "dark";
    const updated = { ...settings, theme: newTheme };
    setSettings(updated as Settings);
    localStorage.setItem("settings", JSON.stringify(updated));

    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  const toggleSound = () => {
    const updated = {
      ...settings,
      soundNotifications: !settings.soundNotifications,
    };
    setSettings(updated);
    localStorage.setItem("settings", JSON.stringify(updated));
  };

  const toggleActiveStatus = () => {
    const updated = { ...settings, activeStatus: !settings.activeStatus };
    setSettings(updated);
    localStorage.setItem("settings", JSON.stringify(updated));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        toggleTheme,
        toggleSound,
        toggleActiveStatus,
        saveSettings,
        isSaving,
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
