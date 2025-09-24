"use client";
import React, { useEffect, useState } from "react";
import { User } from "../../../types/UserType";
import { Group } from "../../../types/GroupType";
import { Chat } from "../../../types/ChatType";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { DummyAvatar, dummyGroupAvatar } from "@/assets/image";
import ReusableSearchInput from "@/components/reusable/ReusableSearchInput";
import { socket } from "@/lib/socket";
import { useConversationStore } from "@/store/useConversationStore";
import { useChatStore } from "@/store/useChatStore";
interface ChatSidebarProps {
  users: User[];
  groups: Group[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
}
const ChatSidebar = ({
  users,
  groups,
  selectedChat,
  onChatSelect,
}: ChatSidebarProps) => {
  const { setSelectedChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState("");
  const filteredConversations = users.filter((user) =>
    user?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { conversations, fetchConversations, loading, error } =
    useConversationStore();

  const handleChatSelect = (
    type: "user" | "group",
    id: string,
    name: string,
    avatar?: string,
    isOnline?: boolean
  ) => {
    onChatSelect({ type, id, name, avatar, isOnline });
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const joinNewChat = (conversationId: string, userId: string) => {
      console.log(
        "User joined chat event received:",
        conversationId,
        "User:",
        userId
      );
    };
    socket.on("join_conversation", joinNewChat);
    return () => {
      socket.off("join_conversation", joinNewChat);
    };
  }, []);

  return (
    <div className="h-full flex flex-col  max-h-[100vh] ">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <ReusableSearchInput
          placeholder="Search Conversations"
          onDebouncedChange={setSearchQuery}
        />
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {/* Groups */}
        {/* {filteredGroups.length > 0 && (
          <div>
            <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-800">
              Groups
            </div>
            {filteredGroups.map((group) => (
              <div
                key={group._id}
                onClick={() =>
                  handleChatSelect("group", group._id, group.name, group.avatar)
                }
                className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                  selectedChat?.type === "group" &&
                  selectedChat?.id === group._id
                    ? "bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500"
                    : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white mr-3`}
                >
                  <Image
                    src={dummyGroupAvatar}
                    alt={group?.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {group.members.length} members
                  </p>
                </div>
              </div>
            ))}
          </div>
        )} */}

        {/* Conversations */}
        <div>
          <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-800">
            Conversations
          </div>
          {conversations?.map((conv) => {
            const isGroup = conv.type === "GROUP";

            // Replace with actual current user id (from store/auth)
            const currentUserId = "YOUR_CURRENT_USER_ID";

            const otherParticipant = !isGroup
              ? conv.participants[0].user
              : null;

            const displayName = conv.name
              ? conv.name
              : otherParticipant?.username;
            const displayAvatar = isGroup
              ? conv.avatar
              : otherParticipant?.avatar;

            return (
              <div
                key={conv.id}
                onClick={() =>
                  handleChatSelect(
                    isGroup ? "group" : "user",
                    conv.id,
                    displayName || "Unknown",
                    displayAvatar || undefined,
                    otherParticipant?.isOnline || false
                  )
                }
                className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                  selectedChat?.id === conv.id
                    ? "bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative">
                  <Image
                    src={displayAvatar || DummyAvatar}
                    alt={displayName || "Avatar"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 ml-3">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {displayName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {isGroup
                      ? `${conv.participants.length} members`
                      : conv.messages[conv.messages.length - 1]?.message ||
                        "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredConversations.length === 0 && filteredGroups.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">No conversations found</p>
            {searchQuery && (
              <p className="text-xs mt-1">Try a different search term</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
