import React from "react";
import { User } from "../../../types/UserType";
import {
  LogOut,
  MailPlus,
  MessageSquare,
  Plus,
  Search,
  Settings,
  UserRoundPlus,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { useGlobalContext } from "@/provider/GlobalContextProvider";
import { useAuth } from "@/context/useAuth";
import { useSettings } from "@/context/SettingsContext";

interface NavbarProps {
  user: User | null;
  isConnected: boolean;
  onSearchClick: () => void;
}

const Navbar = ({ user, isConnected, onSearchClick }: NavbarProps) => {
  const {
    newDrawerOpen,
    settingModalOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    addFriendModalOpen,
  } = useGlobalContext();
  const { logout } = useAuth();
  const { activeStatus } = useSettings();

  const handleLogout = async () => await logout();
  const handleClickNew = () => newDrawerOpen();
  const handleClickAddFriend = () => addFriendModalOpen();

  // presence logic
  const isSelf = activeStatus?.userId === user?.id;
  const isOnline = isConnected && isSelf ? !!activeStatus?.isOnline : false;

  const presenceClasses = isOnline
    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";

  const presenceText = isOnline ? "Online" : "Offline";

  const onIconClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
      {/* Left side - Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <MessageSquare
            onClick={onIconClick}
            className="w-5 h-5 text-white  lg:hidden cursor-pointer"
          />
          <MessageSquare className="w-5 h-5 text-white hidden lg:block" />
        </div>
        <div>
          <h1 className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white">
            Messenger Lite
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user?.username}
          </p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-2">
        {/* Presence */}
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${presenceClasses}`}
        >
          {isConnected ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span>{presenceText}</span>
        </div>

        {/* Action Buttons */}
        <Button variant="ghost" size="sm" onClick={onSearchClick}>
          <Search className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={handleClickNew}>
          <MailPlus className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleClickAddFriend}>
          <UserRoundPlus className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={settingModalOpen}>
          <Settings className="w-4 h-4" />
        </Button>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
        </Button>

        {/* Avatar with presence dot */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white text-sm font-medium">
            {getInitials(user?.username || "")}
          </div>
          <span
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-800 ${
              isOnline ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
