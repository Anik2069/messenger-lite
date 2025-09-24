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
import { useFriendsStore } from "@/store/useFriendsStrore";
import { useChatStore } from "@/store/useChatStore";
import { cleanupTyping, startTyping, stopTyping } from "@/lib/typing";
import { useAuth } from "@/context/useAuth";

declare global {
  interface Window {
    typingTimeout: NodeJS.Timeout | null;
  }
}

const ChatLayout = () => {
  const { user } = useAuth();
  const { friends, fetchFriends } = useFriendsStore();
  const {
    selectedChat,
    messages,
    otherUserTyping,
    isConnected,
    showSearch,
    setSelectedChat,
    setMessages,
    setOtherUserTyping,
    setIsConnected,
    setShowSearch,
    onSendMessage,
    onAddReaction,
  } = useChatStore();

  const {
    newDrawerIsOpen,
    setNewDrawerIsOpen,
    settingModalClose,
    settingModalIsOpen,
  } = useGlobalContext();

  useEffect(() => {
    if (user) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [user, setIsConnected]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    return () => cleanupTyping();
  }, []);

  const onChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages(demoMessages[chat.id] || []);
    setOtherUserTyping(null);
  };

  const handleSendMessage = (
    message: string,
    type: "text" | "file" | "forwarded" = "text",
    fileData?: FileData,
    forwardedFrom?: ForwardedData
  ) => {
    onSendMessage(message, type, fileData, forwardedFrom, user);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    onAddReaction(messageId, emoji, user);
  };

  const handleTypingStart = () => {
    if (!selectedChat || selectedChat.type !== "user") return;
    if (selectedChat.id === user?.id) return;

    startTyping(setOtherUserTyping, user?.id ?? "Unknown");
  };

  const handleTypingStop = () => {
    stopTyping(setOtherUserTyping);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="shrink-0">
        <Navbar
          user={user ?? null}
          isConnected={isConnected}
          onSearchClick={() => setShowSearch(true)}
        />
      </div>

      {/* Main Chat Area */}
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
            onSendMessage={handleSendMessage}
            onAddReaction={handleAddReaction}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
          />
        </div>
      </div>

      <RightSideDrawer
        isOpen={newDrawerIsOpen}
        onOpenChange={setNewDrawerIsOpen}
        title="New Chat"
        className="w-80"
      >
        <NewChat onChatSelect={onChatSelect} />
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
