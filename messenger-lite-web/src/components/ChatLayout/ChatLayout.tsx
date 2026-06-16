'use client';

import axiosInstance from '@/config/axiosInstance';
import { useAuth } from '@/context/useAuth';
import { socket } from '@/lib/socket';
import { cleanupTyping, startTyping, stopTyping } from '@/lib/typing';
import { useGlobalContext } from '@/provider/GlobalContextProvider';
import { useChatStore } from '@/store/useChatStore';
import { useFriendsStore } from '@/store/useFriendsStrore';
import { useCallback, useEffect } from 'react';
import { Chat } from '../../types/ChatType';
import AnimatedWrapper from '../animations/AnimatedWrapper';
import Modal from '../reusable/Modal';
import { RightSideDrawer } from '../reusable/RightSideDrawer';
import AddFriend from './AddFriend/AddFriend';
import ChatSidebar from './ChatSidebar/ChatSidebar';
import ChatWindow from './ChatWindow/ChatWindow';
import CreateGroup from './CreateGroup/CreateGroup';
import Navbar from './Navbar/Navbar';
import NewChat from './NewChat/NewChat';
import SearchModal from './SearchModal/SearchModal';
import SelectedChatProfile from './SelectedChatProfile';
import GeneralSettings from './UserSettings/GeneralSettings';
import PrivacySettings from './UserSettings/PrivacySettings';
import UserSettings from './UserSettings/UserSettings';

const ChatLayout = () => {
  const { user, getMyself } = useAuth();
  const {
    selectedChat,
    isConnected,
    setSelectedChat,
    setMessages,
    setOtherUserTyping,
    setIsConnected,
    setShowSearch,
    onSendMessage,
    onAddReaction,
    resetPagination,
  } = useChatStore();

  const {
    newDrawerIsOpen,
    setNewDrawerIsOpen,
    settingModalClose,
    settingModalIsOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    isAddFriendModalOpen,
    setIsAddFriendModalOpen,
    isGeneralSettingModalOpen,
    isPrivacySettingModalOpen,
    generalSettingModalClose,
    privacySettingModalClose,
    isOpenSelectedChatProfile,
    closeSelectedChatProfile,
    createGroupModalClose,
    isCreateGroupModalOpen,
  } = useGlobalContext();

  const { clearSelectedUsers } = useFriendsStore()

  useEffect(() => {
    if (user) setIsConnected(true);
    else setIsConnected(false);
  }, [user, setIsConnected]);

  useEffect(() => cleanupTyping(), []);

  useEffect(() => {
    if (user) getMyself();
  }, [user, getMyself]);

  const onChatSelect = useCallback(
    (chat: Chat) => {
      setSelectedChat(chat);
      setMessages([]);
      setOtherUserTyping(null);
      resetPagination();

      socket.emit('join_conversation', chat.id);

      (async () => {
        try {
          const response = await axiosInstance.get(`messages/${chat.id}`);
          if (response.status === 200) {
            const data = response.data.results || response.data.data;
            const fetchedMessages = data.messages || [];

            setMessages(fetchedMessages);

            useChatStore.setState({
              messageCursor: data.nextCursor || null,
              hasMoreMessages: data.hasMore || false,
            });
          }
        } catch {
          setMessages([]);
        }
      })();
    },
    [setSelectedChat, setMessages, setOtherUserTyping, resetPagination]
  );

  const handleTypingStart = useCallback(() => {
    if (!selectedChat || selectedChat.type !== 'user') return;
    startTyping(setOtherUserTyping, user?.id ?? 'Unknown');

    socket.emit('typing', {
      conversationId: selectedChat.id,
      userId: user?.id,
    });
  }, [selectedChat, user, setOtherUserTyping]);

  const handleTypingStop = useCallback(() => stopTyping(setOtherUserTyping), [setOtherUserTyping]);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="shrink-0">
        <Navbar isConnected={isConnected} onSearchClick={() => setShowSearch(true)} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:block w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <ChatSidebar groups={[]} selectedChat={selectedChat} onChatSelect={onChatSelect} />
        </div>

        {/* Chat Window */}
        {/* <div className="flex-1 bg-white dark:bg-gray-900 flex flex-col overflow-hidden"> */}
        <AnimatedWrapper
          type="fadeFromLeft" // or "slideLeft", "growIn", "shrink"
          duration={0.3}
          isOpen={true} // ChatWindow is always visible
          className="flex-1 bg-white dark:bg-gray-900 flex flex-col overflow-hidden"
        >
          <ChatWindow
            currentUser={user}
            onSendMessage={(msg, type, file, voice, fwd) =>
              onSendMessage(msg, type, file, voice, fwd, user, isOpenSelectedChatProfile)
            }
            onAddReaction={(id, emoji) => onAddReaction(id, emoji, user)}
            onTypingStart={handleTypingStart}
            onTypingStop={handleTypingStop}
          />
        </AnimatedWrapper>
        {/* </div> */}

        <AnimatedWrapper
          type="fadeFromRight"
          duration={0.3}
          isOpen={isOpenSelectedChatProfile}
          className={`${isOpenSelectedChatProfile ? 'w-80' : 'w-0'} border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out overflow-hidden`}
        >
          <div className="h-full w-80">
            <SelectedChatProfile
              onClose={closeSelectedChatProfile}
              id={selectedChat?.userId ?? ''}
            />
          </div>
        </AnimatedWrapper>
      </div>

      {/* New Chat Drawer */}
      <RightSideDrawer
        isOpen={newDrawerIsOpen}
        onOpenChange={setNewDrawerIsOpen}
        title="New Chat"
        className="w-80"
      >
        <NewChat onChatSelect={onChatSelect} />
      </RightSideDrawer>

      {/* Add Friend Drawer */}
      <RightSideDrawer
        isOpen={isAddFriendModalOpen}
        onOpenChange={setIsAddFriendModalOpen}
        title="Add Friend"
        className="w-80"
      >
        <AddFriend isAddFriendModalOpen={isAddFriendModalOpen} />
      </RightSideDrawer>

      {/* Left Sidebar Drawer */}
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

      {/* Modals */}
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
        maxWidth="5xl"
        className="!p-0"
        title="Privacy Settings"
        open={isPrivacySettingModalOpen}
        onClose={privacySettingModalClose}
      >
        <PrivacySettings />
      </Modal>
      <Modal
        maxWidth="md"
        className="min-h-[60vh] !p-0"
        title="New Group"
        open={isCreateGroupModalOpen}
        onClose={() => {
          createGroupModalClose()
          clearSelectedUsers()
        }}

      >
        <CreateGroup />
      </Modal>

      <SearchModal />

    </div>
  );
};

export default ChatLayout;
