"use client";
import React, { useState, useEffect, use } from "react";
import ChatSidebar from "./ChatSidebar/ChatSidebar";
import Navbar from "./Navbar/Navbar";
import ChatWindow from "./ChatWindow/ChatWindow";
import { FileData, ForwardedData } from "../../types/MessageType";
import { Chat } from "../../types/ChatType";
import { RightSideDrawer } from "../reusable/RightSideDrawer";
import { useGlobalContext } from "@/provider/GlobalContextProvider";
import NewChat from "./NewChat/NewChat";
import Modal from "../reusable/Modal";
import UserSettings from "./UserSettings/UserSettings";
import { useFriendsStore } from "@/store/useFriendsStrore";
import { ChatState, useChatStore } from "@/store/useChatStore";
import { cleanupTyping, startTyping, stopTyping } from "@/lib/typing";
import { useAuth } from "@/context/useAuth";
import { socket } from "@/lib/socket"; // ✅ socket import
import axiosInstance from "@/config/axiosInstance";
import { is } from "zod/v4/locales";
import AddFriend from "./AddFriend/AddFriend";
import PrivacySettings from "./UserSettings/PrivacySettings";
import GeneralSettings from "./UserSettings/GeneralSettings";
import AnimatedWrapper from "../animations/AnimatedWrapper";
import { Button } from "../ui/button";
import { Cross, CrossIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import SelectedChatProfile from "./SelectedChatProfile";
import { Conversation } from "@/types/coversations.type";

declare global {
  interface Window {
    typingTimeout: NodeJS.Timeout | null;
  }
}

const ChatLayout = () => {
  const { user, getMyself } = useAuth();
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
    isSidebarOpen,
    setIsSidebarOpen,
    addFriendModalClose,
    isAddFriendModalOpen,
    setIsAddFriendModalOpen,
    isGeneralSettingModalOpen,
    isPrivacySettingModalOpen,
    generalSettingModalClose,
    privacySettingModalClose,
    isOpenSelectedChatProfile,
    setIsOpenSelectedChatProfile,
    closeSelectedChatProfile,
  } = useGlobalContext();

  // rack socket connection
  useEffect(() => {
    if (user) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [user, setIsConnected]);

  useEffect(() => {
    return () => cleanupTyping();
  }, []);
  useEffect(() => {
    if (user) getMyself();
  }, [user]);
  // Join/Leave conversation room on selection
  useEffect(() => {
    if (!selectedChat?.id) return;

    const handleConversationsUpdated = (conversations: Conversation[]) => {
      console.log("conversations_updated----------------", conversations);

      const matchedConversation = conversations.find(
        (conversation) =>
          conversation.participants?.[0]?.user?.id === selectedChat?.id
      );

      if (matchedConversation) {
        console.log("Matched conversation:", matchedConversation);
        // Optional: update state, e.g.
        // useChatStore.getState().updateConversation(matchedConversation);
        socket.emit("join_conversation", matchedConversation.id);
      }
    };

    socket.on("conversations_updated", handleConversationsUpdated);
    socket.emit("join_conversation", selectedChat.id);
    console.log("Joined conversation:", selectedChat.id);

    (async () => {
      try {
        const response = await axiosInstance.get(`messages/${selectedChat.id}`);
        if (response.status === 200) {
          useChatStore.getState().setMessages(response.data.results);
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    })();

    return () => {
      socket.off("conversations_updated", handleConversationsUpdated);
      socket.emit("leave_conversation", selectedChat.id);
      console.log("Left conversation:", selectedChat.id);
    };
  }, [selectedChat?.id]);

  const onChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    setMessages([]);
    setOtherUserTyping(null);
  };

  const handleSendMessage = (
    message: string,
    type: "TEXT" | "FILE" | "forwarded" | "VOICE" = "TEXT",
    fileData?: object,
    voiceUrl?: string,
    forwardedFrom?: ForwardedData
  ) => {
    onSendMessage(message, type, fileData, voiceUrl, forwardedFrom, user);
  };

  const handleAddReaction = (messageId: string, emoji: string) => {
    onAddReaction(messageId, emoji, user);
  };

  const handleTypingStart = () => {
    if (!selectedChat || selectedChat.type !== "user") return;
    if (selectedChat.id === user?.id) return;

    startTyping(setOtherUserTyping, user?.id ?? "Unknown");
    socket.emit("typing", {
      conversationId: selectedChat.id,
      userId: user?.id,
    });
  };

  const handleTypingStop = () => {
    stopTyping(setOtherUserTyping);
  };

  console.log(selectedChat, "selectedChat========");
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
        <div className="hidden md:block w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ChatSidebar
            groups={[]}
            selectedChat={selectedChat}
            onChatSelect={onChatSelect}
          />
        </div>
        <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col transition-all duration-300 ease-in-out">
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

        <AnimatedWrapper
          isOpen={isOpenSelectedChatProfile}
          fixedRight
          overlay
          onClose={closeSelectedChatProfile}
          className="w-80"
        >
          <div className="flex justify-start relative  h-full max-h-[100vh]">
            <button
              className="h-fit"
              type="button"
              onClick={closeSelectedChatProfile}
            >
              <X className="absolute w-5 h-5 m-2 cursor-pointer hover:text-gray-400 transition" />
            </button>
            <SelectedChatProfile id={selectedChat?.userId ?? ""} />
          </div>
          {/* Profile content here */}
        </AnimatedWrapper>
      </div>

      <RightSideDrawer
        isOpen={newDrawerIsOpen}
        onOpenChange={setNewDrawerIsOpen}
        title="New Chat"
        className="w-80"
      >
        <NewChat onChatSelect={onChatSelect} />
      </RightSideDrawer>
      <RightSideDrawer
        isOpen={isAddFriendModalOpen}
        onOpenChange={setIsAddFriendModalOpen}
        title="Add Friend"
        className="w-80"
      >
        {/* <NewChat onChatSelect={onChatSelect} /> */}
        <AddFriend isAddFriendModalOpen={isAddFriendModalOpen} />
      </RightSideDrawer>

      <RightSideDrawer
        isOpen={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        title="Conversations"
        className="w-80"
        direction="left"
      >
        <ChatSidebar
          groups={[]}
          selectedChat={selectedChat}
          onChatSelect={onChatSelect}
          sidebarMode
        />
      </RightSideDrawer>
      <Modal
        maxWidth="2xl"
        title="User Settings"
        open={settingModalIsOpen}
        onClose={settingModalClose}
      >
        <UserSettings />
      </Modal>
      <Modal
        maxWidth="7xl"
        className="!p-0"
        title="General Settings"
        open={isGeneralSettingModalOpen}
        onClose={generalSettingModalClose}
      >
        <GeneralSettings />
      </Modal>

      {/* <RightSideDrawer
        isOpen={isOpenSelectedChatProfile}
        onOpenChange={setIsOpenSelectedChatProfile}
        title={`Profile of ${selectedChat?.name}`}
        className="w-80"
        direction="left"
      >
        <div className=""></div>
      </RightSideDrawer> */}
      <Modal
        // overflowAuto={true}
        maxWidth="7xl"
        className="!p-0"
        title="Privacy Settings"
        open={isPrivacySettingModalOpen}
        onClose={privacySettingModalClose}
      >
        <PrivacySettings />
      </Modal>
    </div>
  );
};

export default ChatLayout;
