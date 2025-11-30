"use client";
import React, { useState, useEffect, useCallback } from "react";
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
import { socket } from "@/lib/socket";
import axiosInstance from "@/config/axiosInstance";
import AddFriend from "./AddFriend/AddFriend";
import PrivacySettings from "./UserSettings/PrivacySettings";
import GeneralSettings from "./UserSettings/GeneralSettings";
import AnimatedWrapper from "../animations/AnimatedWrapper";
import { X } from "lucide-react";
import SelectedChatProfile from "./SelectedChatProfile";
import { Conversation } from "@/types/coversations.type";
import SearchModal from "./SearchModal/SearchModal";

const ChatLayout = () => {
  const { user, getMyself } = useAuth();
  const {
    selectedChat,
    messages,
    otherUserTyping,
    isConnected,
    showSearch,
    messageCursor,
    hasMoreMessages,
    isLoadingMessages,
    setSelectedChat,
    setMessages,
    setOtherUserTyping,
    setIsConnected,
    setShowSearch,
    onSendMessage,
    onAddReaction,
    resetPagination,
    loadMoreMessages,
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

  // Track socket connection
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

  // ✅ FIXED: Optimized chat selection with useCallback
  const onChatSelect = useCallback(
    (chat: Chat) => {
      setSelectedChat(chat);
      setMessages([]);
      setOtherUserTyping(null);
      resetPagination();

      // Join conversation room
      socket.emit("join_conversation", chat.id);

      // Fetch messages with pagination
      (async () => {
        try {
          const response = await axiosInstance.get(`messages/${chat.id}`);
          if (response.status === 200) {
            const data = response.data.results || response.data.data;
            const fetchedMessages = data.messages || [];
            const hasMore = data.hasMore || false;
            const nextCursor = data.nextCursor || null;

            setMessages(fetchedMessages);

            // Update pagination state
            useChatStore.setState({
              messageCursor: nextCursor,
              hasMoreMessages: hasMore,
            });
          }
        } catch (error) {
          console.error("Failed to fetch messages", error);
          setMessages([]);
        }
      })();
    },
    [setSelectedChat, setMessages, setOtherUserTyping, resetPagination]
  );

  useEffect(() => {
    if (!selectedChat) return;

    let isSubscribed = true;

    const handleConversationsUpdated = (conversations: Conversation[]) => {
      if (!isSubscribed) return;

      console.log("conversations_updated----------------", conversations);

      if (selectedChat.type === "user") {
        const matchedConversation = conversations.find((conversation) => {
          const participants = conversation.participants || [];
          return (
            participants.some((p) => p.user?.id === selectedChat.id) &&
            participants.some((p) => p.user?.id === user?.id)
          );
        });

        if (matchedConversation && matchedConversation.id !== selectedChat.id) {
          console.log(
            "Updating selected chat with conversation ID:",
            matchedConversation.id
          );
          setSelectedChat({
            ...selectedChat,
            id: matchedConversation.id,
          });
        }
      }
    };

    socket.on("conversations_updated", handleConversationsUpdated);

    return () => {
      isSubscribed = false;
      socket.off("conversations_updated", handleConversationsUpdated);
      socket.emit("leave_conversation", selectedChat.id);
    };
  }, [selectedChat, user?.id, setSelectedChat]);

  const handleSendMessage = useCallback(
    (
      message: string,
      type: "TEXT" | "FILE" | "forwarded" | "VOICE" = "TEXT",
      fileData?: object,
      voiceUrl?: string,
      forwardedFrom?: ForwardedData
    ) => {
      onSendMessage(message, type, fileData, voiceUrl, forwardedFrom, user);
    },
    [onSendMessage, user]
  );

  const handleAddReaction = useCallback(
    (messageId: string, emoji: string) => {
      onAddReaction(messageId, emoji, user);
    },
    [onAddReaction, user]
  );

  const handleTypingStart = useCallback(() => {
    if (!selectedChat || selectedChat.type !== "user") return;
    if (selectedChat.id === user?.id) return;

    startTyping(setOtherUserTyping, user?.id ?? "Unknown");
    socket.emit("typing", {
      conversationId: selectedChat.id,
      userId: user?.id,
    });
  }, [selectedChat, user, setOtherUserTyping]);

  const handleTypingStop = useCallback(() => {
    stopTyping(setOtherUserTyping);
  }, [setOtherUserTyping]);

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
            hasMoreMessages={hasMoreMessages}
            isLoadingMessages={isLoadingMessages}
            onLoadMoreMessages={loadMoreMessages}
          />
        </div>

        <AnimatedWrapper
          isOpen={isOpenSelectedChatProfile}
          fixedRight
          overlay
          onClose={closeSelectedChatProfile}
          className="w-80"
        >
          <div className="flex justify-start relative h-full max-h-[100vh]">
            <button
              className="h-fit"
              type="button"
              onClick={closeSelectedChatProfile}
            >
              <X className="absolute w-5 h-5 m-2 cursor-pointer hover:text-gray-400 transition" />
            </button>
            <SelectedChatProfile id={selectedChat?.userId ?? ""} />
          </div>
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

      <Modal
        maxWidth="7xl"
        className="!p-0"
        title="Privacy Settings"
        open={isPrivacySettingModalOpen}
        onClose={privacySettingModalClose}
      >
        <PrivacySettings />
      </Modal>

      <SearchModal />
    </div>
  );
};

export default ChatLayout;
