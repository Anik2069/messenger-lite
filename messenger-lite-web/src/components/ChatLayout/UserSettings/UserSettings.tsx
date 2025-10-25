"use client";

import { CardContent } from "@/components/ui/card";
import {
  Moon,
  Sun,
  UserRoundX,
  UserStar,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useGlobalContext } from "@/provider/GlobalContextProvider";
import React from "react";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/useAuth";

const UserSettings = () => {
  const { user } = useAuth();
  const {
    settingModalClose,
    privacySettingModalOpen,
    generalSettingModalOpen,
  } = useGlobalContext();
  const { settings, toggleTheme, toggleSound, toggleActiveStatus } =
    useSettings();

  return (
    <div>
      <CardContent className="space-y-6">
        {/* User Profile */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {user?.username}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {settings?.activeStatus ? "Online" : "Offline"}
          </p>
        </div>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-3">
            {settings?.theme === "DARK" ? (
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
              settings?.theme === "DARK" ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.theme === "DARK" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Sound Notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-3">
            {settings?.soundNotifications ? (
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
              settings?.soundNotifications ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.soundNotifications ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
          <div className="flex items-center space-x-3">
            {settings?.activeStatus ? (
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
              settings?.activeStatus ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.activeStatus ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <div className="flex gap-6">
          <button
            onClick={generalSettingModalOpen}
            className="cursor-pointer flex-1 rounded-md border border-gray-300 dark:border-gray-600 py-2 text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            General Settings
          </button>
          <button
            onClick={privacySettingModalOpen}
            className="cursor-pointer flex-1 rounded-md border border-gray-300 dark:border-gray-600 py-2 text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Privacy Settings
          </button>
        </div>

        {/* Footer (only Close button now) */}
        <div className="flex">
          <button
            onClick={settingModalClose}
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 py-2 text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </CardContent>
    </div>
  );
};

export default UserSettings;
