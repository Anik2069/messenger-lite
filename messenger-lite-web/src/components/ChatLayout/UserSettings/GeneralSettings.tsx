"use client";

import React, { useEffect, useState } from "react";
import {
  User,
  Bell,
  MessageSquare,
  Palette,
  Globe,
  Menu,
  Check,
  X,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/useAuth";
import { useSettings } from "@/context/SettingsContext";
import Image from "next/image";
import { DummyAvatar } from "@/assets/image";
import { ProfileImage } from "./@general/ProfileImage";
import AnimatedWrapper from "@/components/animations/AnimatedWrapper";
import { SOCKET_HOST } from "@/constant";

const menuItems = [
  { id: "profile", label: "Profile Settings", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "messages", label: "Message Preferences", icon: MessageSquare },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "language", label: "Language & Region", icon: Globe },
];

const GeneralSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { settings, toggleTheme, toggleSound, toggleActiveStatus } =
    useSettings();
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(
    ""
  );
  const [loading, setLoading] = useState(false);
  // Profile Settings State
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    avatar: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement profile update logic here
    console.log("Updating profile:", profileData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implement avatar upload logic here
    console.log("Avatar changed:", e.target.files?.[0]);
  };

  useEffect(() => {
    if (user?.avatar) {
      setProfileImagePreview(`${SOCKET_HOST}/${user.avatar}`);
    } else {
      setProfileImagePreview(null);
    }
  }, [user]);
  const discardProfile = () => {
    setProfileImageFile(null);
    if (user?.avatar) {
      setProfileImagePreview(`${SOCKET_HOST}/${user.avatar}`);
    } else {
      setProfileImagePreview(null);
    }
  };

  const saveProfile = async () => {
    if (!profileImageFile) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("profile_pic", profileImageFile);
      //   await updateUserInfo(
      //     userInfo.id,
      //     formData,
      //     "Profile Picture updated successfully!"
      //   );
    } finally {
      setProfileImageFile(null);
      setLoading(false);
    }
  };
  return (
    <div className="h-[70dvh]  bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* ===== Sidebar ===== */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 md:relative md:flex flex-col md:w-1/3 lg:w-1/4 bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm border-b md:border-r dark:border-gray-700 transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Menu */}
        <div className="flex flex-col">
          {menuItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveTab(id);
                setSidebarOpen(false);
              }}
              className={cn(
                "flex items-center gap-3 px-6 py-4 text-sm font-medium transition-all text-gray-700 dark:text-gray-300 hover:bg-blue-100/60 dark:hover:bg-blue-900/30",
                activeTab === id &&
                  "bg-blue-600/10 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600"
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </aside>

      {/* ===== Main Content ===== */}
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
        <div className=" mx-auto">
          {/* Profile Settings */}
          {activeTab === "profile" && (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <div className="p-6 pt-0 space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    {/* <Image
                      src={profileData.avatar || "/default-avatar.png"}
                      width={120}
                      height={120}
                      alt="Profile"
                      className=" rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                    />
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-1 right-1 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    /> */}
                    {user ? (
                      <div className="mx-auto relative">
                        <ProfileImage
                          loading={loading}
                          currentImage={profileImagePreview}
                          onImageChange={(file, preview) => {
                            setProfileImageFile(file);
                            setProfileImagePreview(preview);
                          }}
                        />

                        {profileImageFile && (
                          <AnimatedWrapper
                            type="fade"
                            duration={200}
                            className="flex justify-center gap-2 mt-2"
                          >
                            <button
                              onClick={discardProfile}
                              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                              title="Discard"
                            >
                              <X className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={saveProfile}
                              className="p-2 rounded-full bg-green-200 hover:bg-green-300 transition-colors"
                              title="Save"
                            >
                              <Check className="w-4 h-4 text-green-700" />
                            </button>
                          </AnimatedWrapper>
                        )}
                      </div>
                    ) : (
                      <div className="mx-auto    ring-2 ring-muted rounded-full overflow-hidden">
                        <Image
                          width={120}
                          height={120}
                          src={DummyAvatar.src}
                          alt={`${name} Profile`}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.currentTarget.src = DummyAvatar.src;
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    {/* <h3 className="font-medium text-gray-900 dark:text-white">
                      Profile Photo
                    </h3> */}
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      JPG, PNG or GIF, max 2MB
                    </p>
                  </div>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          username: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Update Profile
                  </Button>
                </form>
              </div>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Push Notifications
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive push notifications for new messages
                      </p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive email summaries
                      </p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Message Preferences */}
          {activeTab === "messages" && (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Message Preferences
                </CardTitle>
              </CardHeader>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Read Receipts
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Let others see when you&apos;ve read their messages
                      </p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        Typing Indicators
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Show when you&apos;re typing
                      </p>
                    </div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Appearance */}
          {activeTab === "appearance" && (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Appearance Settings
                </CardTitle>
              </CardHeader>
              <div className="p-6 space-y-6">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center space-x-3">
                    <Palette className="w-5 h-5 text-blue-500" />
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
                        settings?.theme === "DARK"
                          ? "translate-x-6"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Font Size Options */}
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                    Font Size
                  </h4>
                  <div className="flex gap-2">
                    {["Small", "Medium", "Large"].map((size) => (
                      <button
                        key={size}
                        className="flex-1 py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Language & Region */}
          {activeTab === "language" && (
            <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Language & Region
                </CardTitle>
              </CardHeader>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Zone
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>UTC-5 (Eastern Time)</option>
                    <option>UTC-6 (Central Time)</option>
                    <option>UTC-7 (Mountain Time)</option>
                    <option>UTC-8 (Pacific Time)</option>
                  </select>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Save Preferences
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default GeneralSettings;
