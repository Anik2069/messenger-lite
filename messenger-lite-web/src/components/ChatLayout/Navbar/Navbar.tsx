import React from 'react';
import {
  LogOut,
  MailPlus,
  MessageSquare,
  Settings,
  UserRoundPlus,
  UsersRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useGlobalContext } from '@/provider/GlobalContextProvider';
import { useAuth } from '@/context/useAuth';
import { useSettings } from '@/context/SettingsContext';
import { APP_NAME, MEDIA_HOST } from '@/constant';

import { DummyAvatar } from '@/assets/image';
import AvatarImage from '../../reusable/AvatarImage';

interface NavbarProps {
  isConnected: boolean;
  onSearchClick: () => void;
}

const Navbar = ({ }: NavbarProps) => {
  const { newDrawerOpen, settingModalOpen, isSidebarOpen, setIsSidebarOpen, addFriendModalOpen, createGroupModalOpen } =
    useGlobalContext();
  const { logout, currentUserDetails } = useAuth();
  const { settings, activeStatus } = useSettings();

  const handleLogout = async () => await logout();
  const handleClickNew = () => newDrawerOpen();
  const handleClickAddFriend = () => addFriendModalOpen();

  // Use activeStatus from context (real-time) or fallback to settings
  const isOnline = activeStatus?.isOnline ?? settings?.activeStatus ?? false;



  const onIconClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const image = currentUserDetails?.avatar
    ? `${MEDIA_HOST}/${currentUserDetails.avatar}`
    : DummyAvatar.src;

  const handleCreateGroup = () => createGroupModalOpen()

  // console.log(image, "sssssssssssss--------------");

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between">
      {/* Left side - Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <MessageSquare
            onClick={onIconClick}
            className="w-5 h-5 text-white lg:hidden cursor-pointer"
          />
          <MessageSquare className="w-5 h-5 text-white hidden lg:block" />
        </div>
        <div>
          <h1 className="text-sm lg:text-lg font-semibold text-gray-900 dark:text-white">
            {APP_NAME || "Messenger Lite"}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{currentUserDetails?.username}</p>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-1">
        {/* Presence */}
        {/* <div
          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${presenceClasses}`}
        >
          {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{presenceText}</span>
        </div> */}

        {/* Action Buttons */}
        {/* <Button variant="ghost" size="sm" onClick={onSearchClick}>
          <Search className="w-4 h-4" />
        </Button> */}

        <Button title='New Message' variant="ghost" size="sm" onClick={handleClickNew}>
          <MailPlus className="w-4 h-4" />
        </Button>
        <Button title='Add Friend' variant="ghost" size="sm" onClick={handleClickAddFriend}>
          <UserRoundPlus className="w-4 h-4" />
        </Button>
        <Button title='Create Group' variant="ghost" size="sm" onClick={handleCreateGroup}>
          <UsersRound className="w-4 h-4" />
        </Button>

        <Button title='Setting' variant="ghost" size="sm" onClick={settingModalOpen}>
          <Settings className="w-4 h-4" />
        </Button>

        <Button title='Logout' variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
        </Button>

        {/* Avatar with presence dot */}
        <div className="relative">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white text-sm font-medium">
            <AvatarImage src={image} alt="Profile" />
          </div>
          {isOnline && <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${isOnline ? 'bg-green-500' : 'bg-red-500'
              }`}
          />}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
