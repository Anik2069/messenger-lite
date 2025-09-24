"use client";

import { DummyAvatar } from "@/assets/image";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useFriendsStore } from "@/store/useFriendsStrore";
import { useAuth } from "@/context/useAuth";
import { useSettings } from "@/context/SettingsContext";
import { Chat } from "@/types/ChatType";

interface AllContactsProps {
  searchText: string;
}

const AllContacts = ({ searchText }: AllContactsProps) => {
  const {
    Allfriends: friends,
    fetchAllFriends,
    loading: friendsLoading,
    error: friendsError,
  } = useFriendsStore();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const { user } = useAuth();
  const { activeStatus, otherStatuses } = useSettings();

  useEffect(() => {
    fetchAllFriends(searchText);
  }, [searchText, fetchAllFriends]);

  const handleChatSelect = (
    type: "user" | "group",
    id: string,
    name: string,
    avatar?: string,
    isOnline?: boolean
  ) => {
    setSelectedChat({ type, id, name, avatar, isOnline });
  };

  return (
    <div>
      <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-800">
        All Contacts
      </div>

      {friends?.map((userInfo) => {
        const isSelf = userInfo.id === user?.id;
        const status = isSelf
          ? activeStatus
          : otherStatuses[userInfo.id] || { isOnline: userInfo.isOnline };

        const isOnline = !!status?.isOnline;

        return (
          <div
            key={userInfo?.id}
            onClick={() =>
              handleChatSelect(
                "user",
                userInfo?.id,
                userInfo?.username,
                userInfo?.avatar,
                isOnline
              )
            }
            className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
              selectedChat?.type === "user" && selectedChat?.id === userInfo?.id
                ? "bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500"
                : ""
            }`}
          >
            <div className="relative mr-3">
              <Image
                src={userInfo?.avatar || DummyAvatar}
                alt={userInfo?.username}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-gray-800 rounded-full ${
                  isOnline ? "bg-green-400" : "bg-gray-400"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {userInfo?.username} {isSelf ? "(You)" : ""}
              </h3>
              <p
                className={`text-sm truncate ${
                  isOnline
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AllContacts;
