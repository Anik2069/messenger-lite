"use client";
import React, { useEffect } from "react";
import ChatSidebar from "./ChatSidebar/ChatSidebar";
import Navbar from "./Navbar/Navbar";
import ChatWindow from "./ChatWindow/ChatWindow";
import { RightSideDrawer } from "../reusable/RightSideDrawer";
import Modal from "../reusable/Modal";
import UserSettings from "./UserSettings/UserSettings";
import { useGlobalContext } from "@/provider/GlobalContextProvider";
import { useChatStore } from "@/store/useChatStore";
import { useFriendsStore } from "@/store/useFriendsStrore";
import { useAuth } from "@/context/useAuth";
import { socket } from "@/lib/socket";
import axiosInstance from "@/config/axiosInstance";

const ChatLayout = () => {
  const { user } = useAuth();
  const { fetchFriends, friends } = useFriendsStore();
  const {
    selectedChat,
    setSelectedChat,
    setMessages,
    setOtherUserTyping,
    setIsConnected,
    isConnected,
    messages,
    otherUserTyping,
    onSendMessage,
    onAddReaction,
  } = useChatStore();

  const {
    newDrawerIsOpen,
    setNewDrawerIsOpen,
    settingModalIsOpen,
    settingModalClose,
  } = useGlobalContext();

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    if (user) setIsConnected(true);
    else setIsConnected(false);
  }, [user, setIsConnected]);

  useEffect(() => {
    if (!selectedChat) return;

    socket.emit("join_conversation", selectedChat.id);

    (async () => {
      try {
        const response = await axiosInstance.get(`messages/${selectedChat.id}`);
        if (response.status === 200) {
          setMessages(response.data?.results);
        }
      } catch (e) {
        console.error("Failed to fetch messages", e);
      }
    })();

    return () => {
      socket.emit("leave_conversation", selectedChat.id);
    };
  }, [selectedChat, setMessages]);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <div className="shrink-0">
        <Navbar
          user={user ?? null}
          isConnected={isConnected}
          onSearchClick={() => setNewDrawerIsOpen(true)} // open sidebar on mobile
        />
      </div>

      {/* Main Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop only) */}
        <div className="hidden md:block w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ChatSidebar
            users={friends ?? []}
            groups={[]} // pass groups if needed
            selectedChat={selectedChat}
            onChatSelect={(chat) => {
              setSelectedChat(chat);
              setMessages([]);
              setOtherUserTyping(null);
            }}
          />
        </div>

        {/* Chat Window (Always full flex) */}
        <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col">
          <ChatWindow
            currentUser={user ?? null}
            selectedChat={selectedChat}
            messages={messages}
            otherUserTyping={otherUserTyping}
            onSendMessage={(msg, type, file, forwarded) =>
              onSendMessage(msg, type, file, forwarded, user)
            }
            onAddReaction={(id, emoji) => onAddReaction(id, emoji, user)}
            onTypingStart={() =>
              socket.emit("typing", {
                conversationId: selectedChat?.id,
                userId: user?.id,
              })
            }
            onTypingStop={() => setOtherUserTyping(null)}
          />
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      <RightSideDrawer
        isOpen={newDrawerIsOpen}
        onOpenChange={setNewDrawerIsOpen}
        title="Chats"
        className="w-[85%] sm:w-[70%] md:hidden" // only show on mobile
      >
        <ChatSidebar
          users={friends ?? []}
          groups={[]}
          selectedChat={selectedChat}
          onChatSelect={(chat) => {
            setSelectedChat(chat);
            setMessages([]);
            setOtherUserTyping(null);
            setNewDrawerIsOpen(false);
          }}
        />
      </RightSideDrawer>

      {/* Settings Modal */}
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
