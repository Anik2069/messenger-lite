"use client";
import { DummyAvatar } from "@/assets/image";
import { getInitials } from "@/lib/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { users } from "../../../../../data/userList";
import { Chat } from "@/types/ChatType";
import { useFriendsStore } from "@/store/useFriendsStrore";
import { socket } from "@/lib/socket";

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

  useEffect(() => {
    socket.on("user:created", (datid: string, newUser: boolean) => {
      console.log("New user created with ID:", datid, "New User:", newUser);
      fetchAllFriends();
    });
    socket;
  }, []);

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
      {friends?.map((user) => (
        <div
          key={user?.username}
          onClick={() =>
            handleChatSelect(
              "user",
              user?.username,
              user?.username,
              user?.avatar,
              user.isOnline
            )
          }
          className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
            selectedChat?.type === "user" && selectedChat?.id === user?.id
              ? "bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500"
              : ""
          }`}
        >
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3`}
            >
              <div className="">
                <Image
                  src={DummyAvatar}
                  alt={user?.username}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
            </div>
            <div
              className={`absolute bottom-0 right-2 w-3 h-3 border-2 border-white dark:border-gray-800 rounded-full ${
                user.isOnline ? "bg-green-400" : "bg-gray-400"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {user?.username}
            </h3>
            <p
              className={`text-sm truncate ${
                user.isOnline
                  ? "text-green-600 dark:text-green-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {user.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AllContacts;
