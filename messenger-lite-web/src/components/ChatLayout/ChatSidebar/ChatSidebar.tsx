"use client";
import React, { useState, useEffect } from "react";
import { User } from "../../../types/UserType";
import { Group } from "../../../types/GroupType";
import { Chat } from "../../../types/ChatType";
import { MessageCircle } from "lucide-react";
import Image from "next/image";
import { DummyAvatar, dummyGroupAvatar } from "@/assets/image";
import ReusableSearchInput from "@/components/reusable/ReusableSearchInput";
import { useConversationStore } from "@/store/useConversationStore";
import { useAuth } from "@/context/useAuth";
import { useSettings } from "@/context/SettingsContext";

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
  const [searchQuery, setSearchQuery] = useState("");
  const { conversations, fetchConversations } = useConversationStore();
  const { user } = useAuth();
  const { activeStatus, otherStatuses } = useSettings();
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return (
    <div className="h-full flex flex-col max-h-[100vh]">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <ReusableSearchInput
          placeholder="Search Conversations"
          onDebouncedChange={setSearchQuery}
        />
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div>
          <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-800">
            Conversations
          </div>
          {conversations?.map((conv) => {
            const isGroup = conv.type === "GROUP";

            const otherParticipant = !isGroup
              ? conv.participants[0]?.user
              : null;

            const displayName =
              otherParticipant?.username || conv.name || "Unknown";
            const displayAvatar = isGroup
              ? conv.avatar
              : otherParticipant?.avatar;

            const isSelf = conv?.participants[0]?.user.id === user?.id;
            const status = isSelf
              ? activeStatus
              : otherStatuses[otherParticipant?.id as string] || {
                  isOnline: otherParticipant?.isOnline,
                };

            const isOnline = !!status?.isOnline;

            return (
              <div
                key={conv.id}
                onClick={() =>
                  onChatSelect({
                    type: isGroup ? "group" : "user",
                    id: conv.id,
                    name: displayName,
                    avatar: displayAvatar || undefined,
                    isOnline: otherParticipant?.isOnline || false,
                  })
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
                    alt={displayName}
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

                {/* Info */}
                <div className="flex-1 min-w-0 ml-3">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {displayName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {isGroup
                      ? `${conv.participants.length} members`
                      : conv.messages?.[0]?.message || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {!conversations?.length && (
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
