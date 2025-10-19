"use client";

import React, { useEffect, useState } from "react";
import { Lock, ShieldCheck, MonitorSmartphone, Menu } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ChangePassword from "./@privacy/ChangePassword";
import TwoFactorAuth from "./@privacy/TwoFactorAuth";
import LoggedInDevices from "./@privacy/LoggedInDevices";
import { useAuth } from "@/context/useAuth";
import ConfirmationModal from "@/components/reusable/ConfirmationModal";
import { useGlobalContext } from "@/provider/GlobalContextProvider";
import { VerifyModal } from "@/components/reusable/VerifyModal";

const menuItems = [
  { id: "password", label: "Change Password", icon: Lock },
  { id: "2fa", label: "2FA Authentication", icon: ShieldCheck },
  { id: "devices", label: "Logged-in Devices", icon: MonitorSmartphone },
];

const PrivacySettings = () => {
  const [activeTab, setActiveTab] = useState("password");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    getMyself,
    setSetupError,
    remove2FA,
    removeModalClose,
    removeModalIsOpen,
  } = useAuth();
  // const {} = useGlobalContext();
  useEffect(() => {
    getMyself();
    setSetupError(false);
  }, []);

  // const remove2FA = async () => {
  //   handleRemove();
  //   removeModalClose();
  // };

  const handleRemove2FA = async (code: string) => {
    setSetupError(false);
    await remove2FA(code);

    // setIsSetupActive(false);
  };

  return (
    <div className=" h-[70dvh] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex ">
      {/* ===== Sidebar ===== */}
      <aside
        className={cn(
          " fixed top-0 left-0  md:relative md:flex flex-col md:w-1/3 lg:w-1/4 bg-white/90 dark:bg-gray-800/90 shadow-lg backdrop-blur-sm border-b md:border-r dark:border-gray-700 transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Sidebar Header */}
        {/* <CardHeader className="z-99 flex justify-between items-center  border-b dark:border-gray-700 md:hidden">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Privacy Settings
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </Button>
        </CardHeader> */}

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
                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all text-gray-700 dark:text-gray-300 hover:bg-blue-100/60 dark:hover:bg-blue-900/30",
                activeTab === id &&
                  "bg-blue-600/10 text-blue-700 dark:text-blue-400 border-l-4 border-blue-600"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="flex-1 p-4 overflow-y-auto">
        {/* Mobile Header */}
        {/* <div className="flex items-center justify-between mb-4 md:hidden">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Privacy Settings
          </h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div> */}

        {/* Content Container */}
        <div className="w-full  md:h-auto overflow-y-auto   backdrop-blur-sm">
          {activeTab === "password" && <ChangePassword />}
          {activeTab === "2fa" && <TwoFactorAuth />}
          {activeTab === "devices" && <LoggedInDevices />}
        </div>
        {/* <ConfirmationModal
          open={removeModalIsOpen}
          onClose={removeModalClose}
          onConfirm={remove2FA}
          title="Remove 2FA"
          description="Are you sure you want to remove 2FA?"
        /> */}
        <VerifyModal
          open={removeModalIsOpen}
          onClose={() => {
            removeModalClose();
            setSetupError(false);
          }}
          onVerify={handleRemove2FA}
          loading={false}
        />
      </main>
    </div>
  );
};

export default PrivacySettings;
