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
import { Status, useSettings } from "@/context/SettingsContext";
import { formatLocalTime } from "@/types/MessageType";
import { format, isToday, parseISO } from "date-fns";
import { useChatStore } from "@/store/useChatStore";
import { SOCKET_HOST } from "@/constant";
import AvatarImage from "@/components/reusable/AvatarImage";

interface ChatSidebarProps {
  groups: Group[];
  selectedChat: Chat | null;
  onChatSelect: (chat: Chat) => void;
  sidebarMode?: boolean;
}

const ChatSidebar = ({
  groups,
  selectedChat,
  onChatSelect,
  sidebarMode = false,
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { conversations, fetchConversations } = useConversationStore();
  const { user } = useAuth();
  const { activeStatus, otherStatuses } = useSettings();
  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    console.log(selectedChat, "selectedChat");
  }, [selectedChat]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const getStatusForUser = (userId: string): Status => {
    if (userId === user?.id) {
      return activeStatus || { userId, isOnline: false };
    }
    return otherStatuses[userId] || { userId, isOnline: false };
  };

  return (
    <div className="h-full flex flex-col max-h-[100vh]">
      {/* Search */}
      {!sidebarMode && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <ReusableSearchInput
            placeholder="Search Conversations"
            onDebouncedChange={setSearchQuery}
          />
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div>
          {!sidebarMode && (
            <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide bg-gray-50 dark:bg-gray-800">
              Conversations
            </div>
          )}
          {conversations?.map((conv) => {
            const isGroup = conv.type === "GROUP";

            // ✅ FIX: Safe access to participants
            const participants = conv.participants || [];
            const otherParticipant = !isGroup
              ? participants.find((p) => p.user?.id !== user?.id)?.user
              : null;

            const displayName = isGroup
              ? conv.name || "Unknown Group"
              : otherParticipant?.username || "Unknown";

            const displayAvatar = isGroup
              ? conv.avatar
              : otherParticipant?.avatar
              ? `${SOCKET_HOST}/${otherParticipant.avatar}`
              : DummyAvatar.src;

            const participantUserId = otherParticipant?.id;
            const status = getStatusForUser(participantUserId || "");
            const isOnline = status?.isOnline || false;

            // ✅ FIX: Safe access to messages
            const lastMessage = conv.messages?.[0];
            const messageCount = conv.messages?.length || 0;

            return (
              <div
                key={conv.id}
                onClick={() =>
                  onChatSelect({
                    type: isGroup ? "group" : "user",
                    id: conv.id,
                    name: displayName,
                    avatar: displayAvatar || undefined,
                    isOnline,
                    userId: otherParticipant?.id || "",
                  })
                }
                className={`flex items-center px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                  selectedChat?.id === conv.id
                    ? "bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500"
                    : ""
                }`}
              >
                {/* Avatar */}
                <div className="relative w-8 h-8 overflow-hidden">
                  {displayAvatar && (
                    <AvatarImage src={displayAvatar} alt="Profile" />
                  )}

                  {!isGroup && (
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white dark:border-gray-800 rounded-full ${
                        isOnline ? "bg-green-400" : "bg-gray-400"
                      }`}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 ml-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {displayName}
                    </h3>
                    {lastMessage?.createdAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {(() => {
                          const localDate = parseISO(
                            lastMessage.createdAt as string
                          );
                          return isToday(localDate)
                            ? formatLocalTime(localDate)
                            : format(localDate, "dd-MM-yyyy");
                        })()}
                      </p>
                    )}
                  </div>

                  {messageCount > 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {isGroup
                        ? `${participants.length} members`
                        : `${
                            lastMessage?.author?.username === user?.username
                              ? "You"
                              : lastMessage?.author?.username || "Unknown"
                          }: ${lastMessage?.message || "No message"}`}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No messages yet
                    </p>
                  )}
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
