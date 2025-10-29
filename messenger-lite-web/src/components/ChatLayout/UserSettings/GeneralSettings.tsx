"use client";

import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/useAuth";
import { useSettings } from "@/context/SettingsContext";
import ProfileSettings from "./@general/ProfileSettings";
import NotificationSettings from "./@general/NotificationSettings";
import MessagePreferences from "./@general/MessagePreferences";
import AppearanceSettings from "./@general/AppearanceSettings";
import LanguageSettings from "./@general/LanguageSettings";
import Sidebar from "./@general/Sidebar";

const GeneralSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUserDetails } = useAuth();
  const { settings } = useSettings();

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "messages":
        return <MessagePreferences />;
      case "appearance":
        return <AppearanceSettings />;
      case "language":
        return <LanguageSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="h-[70dvh] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        {/* Mobile Header */}
        <div className="flex items-center justify-between mb-6 md:hidden">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            General Settings
          </h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Content Container */}
        <div className="mx-auto">{renderActiveTab()}</div>
      </main>
    </div>
  );
};

export default GeneralSettings;
