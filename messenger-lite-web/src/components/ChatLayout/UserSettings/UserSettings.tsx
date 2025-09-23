"use client";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { demoUser } from "../../../../data/demoUser";
import {
  Moon,
  Sun,
  UserRoundX,
  UserStar,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useGlobalContext } from "@/provider/GlobalContextProvider";
import React, { useEffect, useState } from "react";
import { useSocket } from "@/context/useSocket";

type Settings = {
  theme: "dark" | "light";
  soundNotifications: boolean;
  activeStatus: boolean;
};

const UserSettings = () => {
  const user = demoUser || {};
  const [isSaving, setIsSaving] = useState(false);
  const { settingModalClose } = useGlobalContext();
  const { fetchActiveStatus } = useSocket();

  const [settings, setSettings] = useState<Settings>({
    theme: "light",
    soundNotifications: true,
    activeStatus: true,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("settings");
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch {
          // ignore invalid JSON
        }
      }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      settingModalClose();
    }, 1000);

    localStorage.setItem("settings", JSON.stringify(settings));
    fetchActiveStatus;
  };

  const toggleTheme = () => {
    const newTheme = settings?.theme === "dark" ? "light" : "dark";
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    localStorage.setItem(
      "settings",
      JSON.stringify({ ...settings, theme: newTheme })
    );

    if (typeof window !== "undefined") {
      document.documentElement.classList.toggle("dark", newTheme === "dark");
    }
  };

  const toggleSound = () => {
    const newSound = !settings.soundNotifications;
    setSettings((prev) => ({ ...prev, soundNotifications: newSound }));
    localStorage.setItem(
      "settings",
      JSON.stringify({ ...settings, soundNotifications: newSound })
    );
  };
  const toggleActiveStatus = () => {
    const newActiveStatus = !settings.activeStatus;
    setSettings((prev) => ({ ...prev, activeStatus: newActiveStatus }));
    localStorage.setItem(
      "settings",
      JSON.stringify({ ...settings, activeStatus: newActiveStatus })
    );
  };

  return (
    <div>
      <CardContent className="space-y-6">
        {/* User Profile */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {user?.username}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-3">
            {settings.theme === "dark" ? (
              <Moon className="w-5 h-5 text-blue-500" />
            ) : (
              <Sun className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Dark Mode
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Switch between light and dark themes
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.theme === "dark" ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.theme === "dark" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Sound Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-3">
            {settings.soundNotifications ? (
              <Volume2 className="w-5 h-5 text-blue-500" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Sound Notifications
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Play sound when messages arrive
              </p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.soundNotifications ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.soundNotifications ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-3">
            {settings.activeStatus ? (
              <UserStar className="w-5 h-5 text-blue-500" />
            ) : (
              <UserRoundX className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Active Status
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show your active status to others
              </p>
            </div>
          </div>
          <button
            onClick={toggleActiveStatus}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.activeStatus ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.activeStatus ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Save Button */}
        <div className="flex space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={settingModalClose}
            className="flex-1 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </div>
  );
};

export default UserSettings;
