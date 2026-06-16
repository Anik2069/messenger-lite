import { useChatStore } from '@/store/useChatStore';
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

import { MEDIA_HOST } from '@/constant';
import { DummyAvatar, dummyGroupAvatar } from '@/assets/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ShowFiles from './SelectedChatProfile/ShowFiles';
import ShowMedia from './SelectedChatProfile/ShowMedia';
import ShowLinksa from './SelectedChatProfile/ShowLinksa';
import ShowInfo from './SelectedChatProfile/ShowInfo';
import { useGlobalContext } from '@/provider/GlobalContextProvider';

interface SelectedChatProfileProps {
  id: string;
  onClose?: () => void;
}

const SelectedChatProfile: React.FC<SelectedChatProfileProps> = ({ id, onClose }) => {
  const [activeTab, setActiveTab] = useState('media');
  const { isOpenSelectedChatProfile } = useGlobalContext()
  const { handleFetchUsersInfo, selectedUserInfo, selectedChat, handleFetchGroupInfo, selectedGroupInfo } = useChatStore();
  const isGroup = selectedChat?.type === 'group'
  useEffect(() => {
    if (id && isOpenSelectedChatProfile) {
      handleFetchUsersInfo(id);
    }
  }, [id, handleFetchUsersInfo, isOpenSelectedChatProfile,]);

  useEffect(() => {
    if (isGroup && selectedChat?.id && isOpenSelectedChatProfile) {
      handleFetchGroupInfo(selectedChat?.id);
    }
  }, [selectedChat, handleFetchGroupInfo, isOpenSelectedChatProfile, isGroup]);

  // if (isGroup && !selectedGroupInfo) return <div className="p-4">Loading group info...</div>;
  // if (!isGroup && !selectedUserInfo) return <div className="p-4">Loading user info...</div>;

  let displayAvatar = DummyAvatar.src;
  let displayName = '';
  let displayEmail = '';

  if (isGroup && selectedGroupInfo) {
    displayAvatar = selectedGroupInfo.avatar ? `${MEDIA_HOST}/${selectedGroupInfo.avatar}` : dummyGroupAvatar.src;
    displayName = selectedGroupInfo.name || 'Group';
    displayEmail = `${selectedGroupInfo.participants?.length || 0} members`;
  } else if (!isGroup && selectedUserInfo) {
    displayAvatar = selectedUserInfo.avatar ? `${MEDIA_HOST}/${selectedUserInfo.avatar}` : DummyAvatar.src;
    displayName = selectedUserInfo.username || 'User';
    displayEmail = selectedUserInfo.email || '';
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        {onClose && (
          <button
            onClick={() => {
              onClose();
            }}
          >
            <X className="w-5 h-5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" />
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-2 shrink-0">
        <div className="w-24 h-24">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={displayAvatar} alt="Profile" className="rounded-full object-cover w-full h-full" />
        </div>
      </div>

      {/* User Info */}
      <div className="text-center mb-4 shrink-0">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h3>
        <p className="text-gray-600 dark:text-gray-400">{displayEmail}</p>
      </div>

      {/* TABS → this section scrolls only */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="w-full shrink-0">
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="media" className="h-full overflow-y-auto scrollbar-none px-2">
              <ShowMedia selectedChat={selectedChat} />
            </TabsContent>

            <TabsContent value="files" className="h-full overflow-y-auto px-2">
              <ShowFiles />
            </TabsContent>

            <TabsContent value="links" className="h-full overflow-y-auto px-2">
              <ShowLinksa />
            </TabsContent>

            <TabsContent value="info" className="h-full overflow-y-auto px-2">
              <ShowInfo isGroup={isGroup} selectedUserInfo={selectedUserInfo} selectedGroupInfo={selectedGroupInfo} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SelectedChatProfile;
