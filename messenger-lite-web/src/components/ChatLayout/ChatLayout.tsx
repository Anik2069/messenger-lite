"use client";
import React, { useState, useEffect, use } from "react";
import { demoUser } from "../../../data/demoUser";
import { users } from "../../../data/userList";
import { demoGroups } from "../../../data/GroupList";
import ChatSidebar from "./ChatSidebar/ChatSidebar";
import Navbar from "./Navbar/Navbar";
import ChatWindow from "./ChatWindow/ChatWindow";
import { Message, FileData, ForwardedData } from "../../types/MessageType";
import { Chat } from "../../types/ChatType";
import { demoMessages } from "../../../data/demoMessage";
import { RightSideDrawer } from "../reusable/RightSideDrawer";
import { useGlobalContext } from "@/provider/GlobalContextProvider";
import NewChat from "./NewChat/NewChat";
import Modal from "../reusable/Modal";
import UserSettings from "./UserSettings/UserSettings";
import { useAuthStore } from "@/store/useAuthStore";
import { useFriendsStore } from "@/store/useFriendsStrore";

declare global {
  interface Window {
    typingTimeout: NodeJS.Timeout | null;
  }
}

const ChatLayout = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUserTyping, setOtherUserTyping] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  const { user, loading, error } = useAuthStore();
  const {
    friends,
    loading: friendsLoading,
    error: friendsError,
    fetchFriends,
  } = useFriendsStore();

  useEffect(() => {
    console.log(user);
    if (user) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [user]);
  useEffect(() => {
    fetchFriends();
  }, []);

  const {
    newDrawerIsOpen,
    setNewDrawerIsOpen,
    settingModalClose,
    settingModalIsOpen,
  } = useGlobalContext();

  const onChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages(demoMessages[chat.id] || []);
    setOtherUserTyping(null);
  };

  const onSendMessage = (
    message: string,
    type: "text" | "file" | "forwarded" = "text",
    fileData?: FileData,
    forwardedFrom?: ForwardedData
  ) => {
    if (!selectedChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      from: user?.username ?? "Unknown",
      to: selectedChat.id,
      message: message,
      messageType: type,
      fileData: fileData,
      forwardedFrom: forwardedFrom,
      isGroupMessage: selectedChat.type === "group",
      timestamp: new Date(),
      reactions: [],
      readBy:
        selectedChat.type === "group"
          ? [{ username: user?.username ?? "Unknown", timestamp: new Date() }]
          : [],
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  const onAddReaction = (messageId: string, emoji: string) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) => {
        if (message.id !== messageId) return message;

        const existingReactionIndex = message.reactions.findIndex(
          (r) => r.username === user?.username && r.emoji === emoji
        );

        if (existingReactionIndex >= 0) {
          return {
            ...message,
            reactions: message.reactions.filter(
              (_, index) => index !== existingReactionIndex
            ),
          };
        }

        const userReactionIndex = message.reactions.findIndex(
          (r) => r.username === user?.username
        );

        if (userReactionIndex >= 0) {
          const updatedReactions = [...message.reactions];
          updatedReactions[userReactionIndex] = {
            emoji,
            username: user?.username ?? "Unknown",
            timestamp: new Date(),
          };
          return { ...message, reactions: updatedReactions };
        }

        return {
          ...message,
          reactions: [
            ...message.reactions,
            {
              emoji,
              username: user?.username ?? "Unknown",
              timestamp: new Date(),
            },
          ],
        };
      })
    );
  };

  const onTypingStart = () => {
    if (!selectedChat || selectedChat.type !== "user") return;
    if (selectedChat.id === user?.id) return;

    setOtherUserTyping(user?.username ?? "Unknown");

    if (window.typingTimeout) {
      clearTimeout(window.typingTimeout);
      window.typingTimeout = null;
    }

    const typingDuration = 1500 + Math.random() * 1500;
    window.typingTimeout = setTimeout(() => {
      setOtherUserTyping(null);
      window.typingTimeout = null;
    }, typingDuration);
  };

  const onTypingStop = () => {
    setOtherUserTyping(null);
    if (window.typingTimeout) {
      clearTimeout(window.typingTimeout);
      window.typingTimeout = null;
    }
  };

  useEffect(() => {
    return () => {
      if (window.typingTimeout) {
        clearTimeout(window.typingTimeout);
        window.typingTimeout = null;
      }
    };
  }, []);

  return (
    <div className="h-screen ">
      <div className="flex flex-col bg-gray-50 dark:bg-gray-900">
        <Navbar
          user={user ?? null}
          isConnected={isConnected}
          onSearchClick={() => setShowSearch(true)}
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <ChatSidebar
              users={friends ?? []}
              groups={demoGroups}
              selectedChat={selectedChat}
              onChatSelect={onChatSelect}
            />
          </div>
          <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col">
            <ChatWindow
              currentUser={user ?? null}
              selectedChat={selectedChat}
              messages={messages}
              otherUserTyping={otherUserTyping}
              onSendMessage={onSendMessage}
              onAddReaction={onAddReaction}
              onTypingStart={onTypingStart}
              onTypingStop={onTypingStop}
            />
          </div>
        </div>
      </div>

      <RightSideDrawer
        isOpen={newDrawerIsOpen}
        onOpenChange={setNewDrawerIsOpen}
        title="New Chat"
        className="w-80"
      >
        <NewChat />
      </RightSideDrawer>
      <Modal
        maxWidth="2xl"
        title="Settings"
        open={settingModalIsOpen}
        onClose={settingModalClose}
      >
        <UserSettings />
      </Modal>
    </div>
  );
};

export default ChatLayout;
