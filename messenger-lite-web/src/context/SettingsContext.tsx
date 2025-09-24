"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

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

  const saveSettings = (onSave?: () => void) => {
    setIsSaving(true);
    localStorage.setItem("settings", JSON.stringify(settings));
    setTimeout(() => {
      setIsSaving(false);
      onSave?.();
    }, 1000);
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
